# Morning Briefing CLI Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a `jerry brief` terminal command that outputs a structured daily morning briefing pulling from Notion tasks, Google Calendar, and a web research watchlist.

**Architecture:** A standalone CLI script (`backend/src/cli/brief.ts`) that directly calls existing services (NotionService, CalendarService) and a new ResearchService (Brave/Perplexity), formats output as terminal-readable markdown, and is invoked via `npm run brief` or a global `jerry` alias. The script bypasses the AI agent loop entirely — it calls services directly, then passes structured data to Claude once for final formatting. This keeps it fast, deterministic, and testable.

**Tech Stack:** TypeScript, tsx (already in project), Anthropic SDK, @notionhq/client (exists), googleapis (exists), Brave Search API (new)

---

## What We Are NOT Touching

- The existing WebSocket server, frontend, scheduler, or chat routes
- The existing `morning-routine.ts` (step tracker — different concern)
- The existing `ai-agent.ts` chat loop (we call Claude directly, not through it)
- Supabase (not needed for v1 briefing)

---

## Task 1: Verify Notion integration works

**Goal:** Confirm `NotionService.getTasksFromList()` returns real data before building on top of it.

**Files:**
- Read: `backend/src/services/notion-service.ts`
- Create: `backend/src/cli/smoke-test-notion.ts`

**Step 1: Write a quick smoke test script**

```typescript
// backend/src/cli/smoke-test-notion.ts
import * as dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

import { NotionService } from '../services/notion-service';

async function main() {
    const notion = new NotionService();
    const result = await notion.getTasksFromList('justin');
    console.log('Priorities:', result.priorities.slice(0, 3));
    console.log('Overdue:', result.overdue.slice(0, 3));
}

main().catch(console.error);
```

**Step 2: Run it**

```bash
cd backend && npx tsx src/cli/smoke-test-notion.ts
```

Expected: Prints 1–3 task objects with title/status/priority fields.
If it errors: Check `NOTION_API_KEY` in `.env` and the hardcoded database ID in `notion-service.ts`.

**Step 3: Note which fields are actually populated**

Confirm: `title`, `status`, `priority`, `dueDate` are real. Note any nulls.

**Step 4: Commit**

```bash
git add backend/src/cli/smoke-test-notion.ts
git commit -m "chore: add notion smoke test script"
```

---

## Task 2: Verify Calendar integration works

**Goal:** Confirm CalendarService can fetch today's events.

**Files:**
- Read: `backend/src/services/calendar-service.ts`
- Create: `backend/src/cli/smoke-test-calendar.ts`

**Step 1: Check what method returns today's events**

```bash
grep -n "getTodaysEvents\|getEvents\|async " backend/src/services/calendar-service.ts | head -20
```

**Step 2: Write smoke test**

```typescript
// backend/src/cli/smoke-test-calendar.ts
import * as dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

import { CalendarService } from '../services/calendar-service';

async function main() {
    const cal = new CalendarService();
    // Adjust method name based on what you found in step 1
    const events = await (cal as any).getTodaysEvents?.()
        ?? await (cal as any).getEvents?.()
        ?? 'No method found - check calendar-service.ts';
    console.log('Events:', JSON.stringify(events, null, 2));
}

main().catch(console.error);
```

**Step 3: Run it**

```bash
cd backend && npx tsx src/cli/smoke-test-calendar.ts
```

Expected: Array of today's calendar events, or an auth error (which means Google OAuth tokens need setup — note this as a blocker and skip calendar section in v1 briefing).

**Step 4: Commit**

```bash
git add backend/src/cli/smoke-test-calendar.ts
git commit -m "chore: add calendar smoke test script"
```

---

## Task 3: Create the ResearchService (Brave Search)

**Goal:** A simple service that takes a list of topics and returns 2–3 headline summaries per topic.

**Files:**
- Create: `backend/src/services/research-service.ts`
- Create: `backend/src/__tests__/research-service.test.ts`

**Step 1: Write the failing test**

```typescript
// backend/src/__tests__/research-service.test.ts
import { ResearchService } from '../services/research-service';

describe('ResearchService', () => {
    it('should return results for a valid topic', async () => {
        const service = new ResearchService('fake-api-key');
        // Mock fetch to avoid real API calls in tests
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                web: {
                    results: [
                        { title: 'AI news headline', description: 'Something happened', url: 'https://example.com' },
                        { title: 'Another headline', description: 'More stuff', url: 'https://example2.com' }
                    ]
                }
            })
        });

        const results = await service.search('AI model releases');
        expect(results).toHaveLength(2);
        expect(results[0]).toMatchObject({ title: expect.any(String), snippet: expect.any(String), url: expect.any(String) });
    });

    it('should return empty array on API error', async () => {
        const service = new ResearchService('fake-api-key');
        global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

        const results = await service.search('AI news');
        expect(results).toEqual([]);
    });
});
```

**Step 2: Run test to verify it fails**

```bash
cd backend && npx jest research-service --no-coverage
```

Expected: FAIL — "Cannot find module '../services/research-service'"

**Step 3: Implement ResearchService**

```typescript
// backend/src/services/research-service.ts

export interface SearchResult {
    title: string;
    snippet: string;
    url: string;
}

export class ResearchService {
    private apiKey: string;
    private baseUrl = 'https://api.search.brave.com/res/v1/web/search';

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    async search(query: string, count: number = 3): Promise<SearchResult[]> {
        try {
            const url = `${this.baseUrl}?q=${encodeURIComponent(query)}&count=${count}`;
            const response = await fetch(url, {
                headers: {
                    'Accept': 'application/json',
                    'Accept-Encoding': 'gzip',
                    'X-Subscription-Token': this.apiKey
                }
            });

            if (!response.ok) {
                console.error(`[Research] Brave API error: ${response.status}`);
                return [];
            }

            const data = await response.json();
            const results = data?.web?.results ?? [];

            return results.slice(0, count).map((r: any) => ({
                title: r.title ?? '',
                snippet: r.description ?? '',
                url: r.url ?? ''
            }));
        } catch (err) {
            console.error('[Research] Search failed:', err);
            return [];
        }
    }

    async searchWatchlist(topics: string[]): Promise<Record<string, SearchResult[]>> {
        const results: Record<string, SearchResult[]> = {};
        for (const topic of topics) {
            results[topic] = await this.search(topic, 2);
        }
        return results;
    }
}
```

**Step 4: Run test to verify it passes**

```bash
cd backend && npx jest research-service --no-coverage
```

Expected: PASS

**Step 5: Commit**

```bash
git add backend/src/services/research-service.ts backend/src/__tests__/research-service.test.ts
git commit -m "feat: add ResearchService with Brave Search API"
```

---

## Task 4: Get a Brave Search API key

**Goal:** Register for Brave Search API so research works for real.

**Step 1:** Go to https://brave.com/search/api/ → sign up for free tier (2,000 queries/month free)

**Step 2:** Add to `.env`:

```
BRAVE_SEARCH_API_KEY=your-key-here
```

**Step 3: Smoke test the real API**

```bash
cd backend && npx tsx -e "
import * as dotenv from 'dotenv';
dotenv.config();
import { ResearchService } from './src/services/research-service';
const s = new ResearchService(process.env.BRAVE_SEARCH_API_KEY!);
s.search('Anthropic Claude latest').then(r => console.log(r));
"
```

Expected: 2–3 real search results printed.

---

## Task 5: Build the BriefingService

**Goal:** Orchestrate Notion + Calendar + Research into a structured `BriefingData` object.

**Files:**
- Create: `backend/src/services/briefing-service.ts`
- Create: `backend/src/__tests__/briefing-service.test.ts`

**Step 1: Write the failing test**

```typescript
// backend/src/__tests__/briefing-service.test.ts
import { BriefingService } from '../services/briefing-service';

describe('BriefingService', () => {
    it('should return a BriefingData object with all sections', async () => {
        // Arrange: mock all dependencies
        const mockNotion = { getTasksFromList: jest.fn().mockResolvedValue({
            priorities: [{ title: 'Fix login bug', status: 'In Progress', priority: 'High', dueDate: null }],
            overdue: []
        })};
        const mockCalendar = { getTodaysEvents: jest.fn().mockResolvedValue([
            { summary: 'Standup', start: { dateTime: '2026-02-17T09:00:00Z' } }
        ])};
        const mockResearch = { searchWatchlist: jest.fn().mockResolvedValue({
            'AI model releases': [{ title: 'GPT-5 released', snippet: 'OpenAI ships...', url: 'https://example.com' }]
        })};

        const service = new BriefingService(mockNotion as any, mockCalendar as any, mockResearch as any);
        const data = await service.gather();

        expect(data.tasks.priorities).toHaveLength(1);
        expect(data.tasks.priorities[0].title).toBe('Fix login bug');
        expect(data.calendar).toHaveLength(1);
        expect(data.research['AI model releases']).toHaveLength(1);
        expect(data.date).toMatch(/^\d{4}-\d{2}-\d{2}/);
    });

    it('should still return data if calendar fails', async () => {
        const mockNotion = { getTasksFromList: jest.fn().mockResolvedValue({ priorities: [], overdue: [] }) };
        const mockCalendar = { getTodaysEvents: jest.fn().mockRejectedValue(new Error('Auth error')) };
        const mockResearch = { searchWatchlist: jest.fn().mockResolvedValue({}) };

        const service = new BriefingService(mockNotion as any, mockCalendar as any, mockResearch as any);
        const data = await service.gather();

        expect(data.calendar).toEqual([]);
        expect(data.calendarError).toBe('Calendar unavailable (auth required)');
    });
});
```

**Step 2: Run test to verify it fails**

```bash
cd backend && npx jest briefing-service --no-coverage
```

Expected: FAIL

**Step 3: Implement BriefingService**

```typescript
// backend/src/services/briefing-service.ts
import { NotionService, NotionTask } from './notion-service';
import { CalendarService } from './calendar-service';
import { ResearchService, SearchResult } from './research-service';

export const DEFAULT_WATCHLIST = [
    'AI model releases this week',
    'AI engineering jobs site:linkedin.com OR site:lever.co',
    'Anthropic OR OpenAI news'
];

export interface BriefingData {
    date: string;
    tasks: { priorities: NotionTask[]; overdue: NotionTask[] };
    calendar: any[];
    calendarError?: string;
    research: Record<string, SearchResult[]>;
}

export class BriefingService {
    constructor(
        private notion: NotionService,
        private calendar: CalendarService,
        private research: ResearchService
    ) {}

    async gather(watchlist: string[] = DEFAULT_WATCHLIST): Promise<BriefingData> {
        const date = new Date().toISOString().split('T')[0];

        // Run Notion and research in parallel; calendar isolated so failure doesn't break everything
        const [tasks, calendarResult, research] = await Promise.all([
            this.notion.getTasksFromList('justin'),
            this.fetchCalendar(),
            this.research.searchWatchlist(watchlist)
        ]);

        return {
            date,
            tasks,
            calendar: calendarResult.events,
            calendarError: calendarResult.error,
            research
        };
    }

    private async fetchCalendar(): Promise<{ events: any[]; error?: string }> {
        try {
            const cal = this.calendar as any;
            const method = cal.getTodaysEvents ?? cal.getEvents;
            if (!method) return { events: [], error: 'Calendar unavailable (no method found)' };
            const events = await method.call(cal);
            return { events: events ?? [] };
        } catch {
            return { events: [], error: 'Calendar unavailable (auth required)' };
        }
    }
}
```

**Step 4: Run tests**

```bash
cd backend && npx jest briefing-service --no-coverage
```

Expected: PASS

**Step 5: Commit**

```bash
git add backend/src/services/briefing-service.ts backend/src/__tests__/briefing-service.test.ts
git commit -m "feat: add BriefingService orchestrator"
```

---

## Task 6: Build the CLI formatter

**Goal:** Format `BriefingData` into clean terminal output. No Claude call yet — just the structure.

**Files:**
- Create: `backend/src/cli/format-briefing.ts`
- Create: `backend/src/__tests__/format-briefing.test.ts`

**Step 1: Write failing test**

```typescript
// backend/src/__tests__/format-briefing.test.ts
import { formatBriefing } from '../cli/format-briefing';
import { BriefingData } from '../services/briefing-service';

const sampleData: BriefingData = {
    date: '2026-02-17',
    tasks: {
        priorities: [
            { id: '1', title: 'Finish portfolio demo', status: 'In Progress', priority: 'High', dueDate: '2026-02-20', url: '', list: 'justin', completed: false }
        ],
        overdue: []
    },
    calendar: [
        { summary: 'Standup', start: { dateTime: '2026-02-17T09:00:00Z' } }
    ],
    research: {
        'AI model releases this week': [
            { title: 'Claude 4.5 ships new features', snippet: 'Anthropic announces...', url: 'https://example.com' }
        ]
    }
};

describe('formatBriefing', () => {
    it('should include the date', () => {
        const output = formatBriefing(sampleData);
        expect(output).toContain('2026-02-17');
    });

    it('should include top tasks', () => {
        const output = formatBriefing(sampleData);
        expect(output).toContain('Finish portfolio demo');
    });

    it('should include calendar events', () => {
        const output = formatBriefing(sampleData);
        expect(output).toContain('Standup');
    });

    it('should include research results', () => {
        const output = formatBriefing(sampleData);
        expect(output).toContain('Claude 4.5 ships new features');
    });

    it('should show calendar unavailable message when no events and error present', () => {
        const data = { ...sampleData, calendar: [], calendarError: 'Calendar unavailable (auth required)' };
        const output = formatBriefing(data);
        expect(output).toContain('Calendar unavailable');
    });
});
```

**Step 2: Run test to verify it fails**

```bash
cd backend && npx jest format-briefing --no-coverage
```

**Step 3: Implement formatter**

```typescript
// backend/src/cli/format-briefing.ts
import { BriefingData } from '../services/briefing-service';

export function formatBriefing(data: BriefingData): string {
    const lines: string[] = [];

    lines.push(`\n========================================`);
    lines.push(`  MORNING BRIEFING — ${data.date}`);
    lines.push(`========================================\n`);

    // Tasks
    lines.push(`## TOP TASKS`);
    if (data.tasks.priorities.length === 0) {
        lines.push('  No priority tasks found.');
    } else {
        data.tasks.priorities.slice(0, 3).forEach((t, i) => {
            const due = t.dueDate ? ` (due ${t.dueDate})` : '';
            lines.push(`  ${i + 1}. [${t.priority}] ${t.title}${due}`);
        });
    }

    if (data.tasks.overdue.length > 0) {
        lines.push(`\n  ⚠️  OVERDUE:`);
        data.tasks.overdue.slice(0, 2).forEach(t => {
            lines.push(`    - ${t.title} (was due ${t.dueDate})`);
        });
    }

    // Calendar
    lines.push(`\n## TODAY'S CALENDAR`);
    if (data.calendarError) {
        lines.push(`  ⚠️  ${data.calendarError}`);
    } else if (data.calendar.length === 0) {
        lines.push('  No events today.');
    } else {
        data.calendar.slice(0, 5).forEach(e => {
            const time = e.start?.dateTime
                ? new Date(e.start.dateTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                : 'All day';
            lines.push(`  ${time} — ${e.summary}`);
        });
    }

    // Research
    lines.push(`\n## AI & JOB SIGNAL`);
    const topics = Object.entries(data.research);
    if (topics.length === 0) {
        lines.push('  No research results.');
    } else {
        topics.forEach(([topic, results]) => {
            if (results.length > 0) {
                lines.push(`\n  [${topic}]`);
                results.forEach(r => {
                    lines.push(`  • ${r.title}`);
                    lines.push(`    ${r.snippet.slice(0, 120)}...`);
                });
            }
        });
    }

    lines.push(`\n========================================\n`);
    return lines.join('\n');
}
```

**Step 4: Run tests**

```bash
cd backend && npx jest format-briefing --no-coverage
```

Expected: PASS

**Step 5: Commit**

```bash
git add backend/src/cli/format-briefing.ts backend/src/__tests__/format-briefing.test.ts
git commit -m "feat: add briefing terminal formatter"
```

---

## Task 7: Build the `jerry brief` CLI entry point

**Goal:** Wire everything together into a single runnable script.

**Files:**
- Create: `backend/src/cli/brief.ts`
- Modify: `backend/package.json`

**Step 1: Create the CLI script**

```typescript
// backend/src/cli/brief.ts
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { NotionService } from '../services/notion-service';
import { CalendarService } from '../services/calendar-service';
import { ResearchService } from '../services/research-service';
import { BriefingService } from '../services/briefing-service';
import { formatBriefing } from './format-briefing';

async function main() {
    console.log('Gathering your morning briefing...\n');

    const notion = new NotionService();
    const calendar = new CalendarService();
    const research = new ResearchService(process.env.BRAVE_SEARCH_API_KEY ?? '');
    const briefing = new BriefingService(notion, calendar, research);

    const data = await briefing.gather();
    const output = formatBriefing(data);

    console.log(output);
}

main().catch(err => {
    console.error('Briefing failed:', err.message);
    process.exit(1);
});
```

**Step 2: Add npm script to package.json**

In `backend/package.json`, add to the `"scripts"` block:

```json
"brief": "tsx src/cli/brief.ts"
```

**Step 3: Run it**

```bash
cd backend && npm run brief
```

Expected: Terminal output with tasks, calendar, and research sections.

**Step 4: Commit**

```bash
git add backend/src/cli/brief.ts backend/package.json
git commit -m "feat: add jerry brief CLI command"
```

---

## Task 8: Wire up global `jerry` command (optional quality-of-life)

**Goal:** Run `jerry brief` from anywhere in the terminal.

**Step 1: Create a global wrapper script**

```bash
# Create the script
cat > /usr/local/bin/jerry << 'EOF'
#!/bin/bash
BRIEF_DIR="/Users/justinpease/workspace/personal-assistant/backend"
cd "$BRIEF_DIR" && npm run "$@" 2>&1
EOF

chmod +x /usr/local/bin/jerry
```

**Step 2: Test it**

```bash
jerry brief
```

Expected: Same output as `npm run brief`.

**Step 3: Commit note**

This is a local machine config — no git commit needed.

---

## Task 9: Run all tests to verify nothing is broken

**Step 1: Run the full test suite**

```bash
cd backend && npm test
```

**Step 2: Fix any failures before calling this done**

Only mark this task complete when all tests pass.

**Step 3: Final commit**

```bash
git add -A
git commit -m "feat: morning briefing CLI - all tests passing"
```

---

## Checklist Before Calling It Done

- [ ] `npm run brief` runs without errors
- [ ] Notion tasks appear (at least shows "No priority tasks" if DB is empty)
- [ ] Calendar shows events or clean "unavailable" message — never crashes
- [ ] Research shows 2–3 headlines per topic, or clean empty state
- [ ] All new unit tests pass
- [ ] No existing tests broken

---

## V2 Ideas (Do Not Build Now)

- Claude summary pass: pipe `BriefingData` through Claude for a 2-sentence "suggested action"
- Email digest: send briefing to your email via SendGrid
- Push notification: fire a push when briefing is ready
- Adaptive sections: skip research if Brave API is down
- Configurable watchlist: read topics from a `.briefing.json` config file
