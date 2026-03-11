# Personal Assistant — Senior-Level Applied AI Repo Audit

## Repo Reality Summary

This repo is the **primary** personal-assistant implementation: it has both **frontend** and **backend**, and the backend implements **real LLM → tool execution**. Claude 3.5 Sonnet is called with a **tools** array (Notion: read page, read with children, search; Mochi: create card, sync from Notion); when the model returns `tool_use` blocks, the backend runs the corresponding handler (Notion API, Mochi API) and sends tool results back in a follow-up `messages.create` call. Conversation history is persisted in Supabase (`conversation_history`). Additional AI surfaces: **morning-routine-ai** (Claude for analyzing routine from Notion and returning structured sections/coaching), **Spanish quiz** and **calendar** routes, **blocked-site** and **Mochi** integrations. The root README describes an `mcp-servers/` directory and `npm run dev:mcp`, but the repo’s `package.json` has no `dev:mcp` or mcp-servers—only `dev`, `dev:frontend`, `dev:backend`. So the runnable surface is **backend + frontend**; MCP servers are not in this repo. The strongest portfolio signal is **Claude with native tool use** (Notion + Mochi) and **multi-turn tool loop** implemented in code.

---

## Primary Portfolio Signal

**This repo primarily demonstrates:** Claude native tool use with multi-turn execution (Notion read/search, Mochi flashcards), context-rich system prompt, and persistence of conversation history.

---

## Real Engineering Signals

- **Claude tools and tool execution**: `ai-agent.ts` defines `availableTools` (read_notion_page, read_notion_page_with_children, search_notion, create_mochi_card, sync_to_mochi) and passes them to `client.messages.create(..., { tools: availableTools })`. On `response.content.some(block => block.type === 'tool_use')`, it iterates tool_use blocks, runs a switch on tool name, calls notionService or Mochi API, pushes `tool_result` blocks, and calls `client.messages.create` again with the extended history. **Multi-turn tool loop** is implemented.
- **Notion integration**: notionService.getPageContent(pageId), getPageContent with children, search; URL parsing for Notion page IDs. Real external API use from the AI agent.
- **Mochi integration**: create_mochi_card and sync_to_mochi tools; backend has mochi-service and routes under `/api/mochi`. Demonstrates **LLM-driven flashcard creation**.
- **Conversation persistence**: loadHistoryFromDB / saveHistoryToDB using Supabase `conversation_history` table; history is restored across sessions.
- **System prompt**: loadSystemPrompt(userId) builds context (goals, ADHD considerations, tool descriptions). Same pattern as jeeves; here it feeds a tool-using agent.
- **Morning routine AI**: MorningRoutineAIService uses Claude to analyze a Notion morning-routine page and return structured AIRoutineAnalysis (sections, coaching, schedule); includes caching. Separate LLM use case (structured output from docs).
- **API surface**: Chat, dashboard, activity, notion-ai, morning-routine, spanish-quiz, calendar, mochi, blocked-site, MCP proxy routes (notion, oura, habits, screen-time), webhooks, chrome-extension. Scheduler for proactive jobs.

---

## Low-Signal Areas

- **README vs reality**: README mentions `mcp-servers/` and `npm run dev:mcp`; those do not exist in this repo. `install:all` only installs root, frontend, and backend.
- **MCP routes**: Backend has /api/mcp/notion, habits, oura, screen-time; these are in-process proxies/stubs, not standalone MCP server processes. The **high signal** is the native Claude tools (Notion, Mochi), not the MCP route layer.
- **Frontend**: Out of scope per audit rules; noted as consumer of backend APIs.
- **Redundancy**: Three assistant-related repos (jeeves, personal-assistant-backend, personal-assistant). This one is the only one with **implemented** LLM tool use; it is the strongest single repo for “assistant with tools” narrative.

---

## Demo Slice Candidates

| Slice | Entry / Command | Artifact / Output | Isolation | Notes |
|-------|------------------|-------------------|-----------|--------|
| Backend chat with tool use | `cd personal-assistant/backend && npm run dev` then `curl -X POST http://localhost:4001/api/chat -H "Content-Type: application/json" -d '{"message":"Read this Notion page: https://notion.so/...","userId":"demo"}'` | JSON with Claude reply; if tool used, response includes Notion content | High for backend; needs Notion + Supabase env | Best slice for “LLM + tools.” |
| Create Mochi card via chat | Same; message like “Create a Mochi card: front = hello, back = hola” | Response confirming card creation | High | Requires Mochi API config. |
| Morning routine AI | Call morning-routine API with notionPageId | Structured routine analysis (sections, coaching) | Medium | Uses morning-routine-ai service + Notion. |
| Health + chat (no tools) | Health check then simple chat message | Health JSON + chat JSON | High | Works with just ANTHROPIC_API_KEY + docs; tools optional. |

---

## Top 2 Recommended Slices

### 1. Chat with Notion tool (read page)

- **Command**:  
  `cd personal-assistant/backend && npm run dev`  
  Then:  
  `curl -X POST http://localhost:4001/api/chat -H "Content-Type: application/json" -d '{"message":"Read the content of this Notion page: https://www.notion.so/My-Page-abc123...","userId":"demo"}'`
- **Artifact**: JSON `{ response, timestamp }` where `response` is Claude’s reply, possibly including content from the Notion page after a tool call.
- **Example terminal lines**:  
  ```
  🚀 Backend server running on http://localhost:4001
  🤖 AI Agent: Tool use detected, handling tool calls...
  📄 Reading Notion page: https://...
  📄 Extracted page ID: ...
  ```
- **One small hardening**: If Notion returns an error (e.g. invalid URL or missing integration), include a short error message in the tool result so Claude can respond with a user-friendly message instead of raw JSON.

### 2. Chat with Mochi tool (create card)

- **Command**:  
  Same backend; message: `"Create a Mochi flashcard: front = 'hello' in Spanish, back = 'hola'."`
- **Artifact**: Response text confirming the card was created (or error if Mochi not configured).
- **Example terminal lines**:  
  (Backend logs showing tool_use for create_mochi_card and success/error.)
- **One small hardening**: Validate Mochi API key and deck/config at startup (or on first use) and return a clear “Mochi not configured” in the tool result so the agent can say so in natural language.

---

## Small Hardening Plan

1. **README**: Remove or qualify the `mcp-servers/` and `dev:mcp` references so they match the repo (or add a note: “MCP servers live in jeeves-personal-assistant” if that’s the case). Document that the main AI demo is **backend + Claude tools** (Notion, Mochi).
2. **Startup**: Validate ANTHROPIC_API_KEY and, if chat/tools are required for demo, optionally check Notion and Supabase env; fail fast with clear messages.
3. **Tool errors**: Ensure every tool branch in the tool_use handler returns a structured result (success: false, error: string) on catch so the agent always gets a parseable tool result.
4. **Conversation history**: If Supabase is unavailable, the code falls back to in-memory history; document this behavior so demo runners know persistence requirements.

---

## Archive / De-prioritization Recommendation

**This repo should remain a portfolio repo.** It is the only one of the three assistant repos with **runnable LLM → tool execution** (Claude tools for Notion and Mochi) and multi-turn tool loop. It has clear isolation potential: backend-only chat (with or without tool use) is a strong demo. Recommend **keeping this repo** as the primary “personal assistant with tools” artifact and considering **archiving or de-emphasizing** personal-assistant-backend (redundant, no tool use) and possibly consolidating jeeves as “full stack with MCP servers” vs this as “primary backend with native tools.” Do not archive this repo for portfolio purposes.
