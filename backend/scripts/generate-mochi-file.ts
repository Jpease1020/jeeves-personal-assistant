/**
 * Generate Mochi Bulk Import File
 * 
 * Reads Spanish study content from Notion and generates a .mochi file
 * for bulk import into the Mochi flashcard app.
 */

import * as fs from 'fs';
import * as path from 'path';
import { notionService } from '../src/services/notion-service';
import Anthropic from '@anthropic-ai/sdk';
import archiver from 'archiver';
import * as dotenv from 'dotenv';

dotenv.config();

// Mochi Card Interface
interface MochiCard {
    id: string;
    content: string;
    name?: string;
}

interface MochiDeck {
    name: string;
    id: string;
    cards: MochiCard[];
}

// EDN output string builder (Mochi reliably imports data.edn)
function buildEdn(decks: MochiDeck[]): string {
    const escape = (s: string) => s
        .replace(/\\/g, "\\\\")
        .replace(/\n/g, "\\n")
        .replace(/\"/g, '\\"');

    const deckEdn = decks.map(d => `{:name "${escape(d.name)}" :id :${d.id} :cards [${d.cards.map(c => `{:id :${c.id} :name "${escape(c.name || '')}" :content "${escape(c.content)}"}`).join(' ')}]}`);
    return `{:version 2 :decks [${deckEdn.join(' ')}]}`;
}

// Card Data from Claude Parser
interface ParsedCard {
    front: string;
    back: string;
    context?: string;
}

// Claude API Client
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
});

/**
 * Parse Notion content using Claude AI to extract flashcard-worthy items
 */
async function parseContentWithClaude(content: string, pageTitle: string): Promise<ParsedCard[]> {
    console.log(`🤖 Sending ${content.length} chars to Claude for parsing...`);

    const prompt = `You are helping to convert Spanish study material into flashcards.

Analyze the following Spanish study content and extract all flashcard-worthy items. For each item, identify:
- Spanish vocabulary/phrases with their English translations
- Verb conjugations (e.g., "yo hablo = I speak")
- Grammar concepts with examples
- Useful phrases or expressions

Return a JSON array of objects with this exact structure:
[
  {
    "front": "Spanish term or concept",
    "back": "English translation or explanation",
    "context": "Optional: example sentence or usage note"
  }
]

Content to analyze:
---
${content}
---

IMPORTANT:
- Only include items that should be memorized (vocabulary, conjugations, etc.)
- Skip instructions, headings, and organization text
- For verb conjugations, use format: "hablo (yo)" as front, "I speak" as back
- For grammar, front should be the Spanish pattern, back should be the English rule
- Return ONLY valid JSON, no markdown formatting or code blocks`;

    try {
        const message = await anthropic.messages.create({
            model: 'claude-sonnet-3-5-20241022',
            max_tokens: 4096,
            messages: [{
                role: 'user',
                content: prompt
            }]
        });

        const responseText = message.content[0].type === 'text'
            ? message.content[0].text
            : JSON.stringify(message.content);

        // Extract JSON from response (handle markdown code blocks if present)
        let jsonText = responseText.trim();
        if (jsonText.startsWith('```json')) {
            jsonText = jsonText.slice(7);
        }
        if (jsonText.startsWith('```')) {
            jsonText = jsonText.slice(3);
        }
        if (jsonText.endsWith('```')) {
            jsonText = jsonText.slice(0, -3);
        }
        jsonText = jsonText.trim();

        const cards = JSON.parse(jsonText) as ParsedCard[];
        console.log(`✅ Claude extracted ${cards.length} cards from "${pageTitle}"`);
        return cards;
    } catch (error) {
        console.error(`❌ Error parsing content with Claude:`, error);
        console.log(`Attempting to parse raw content directly...`);

        // Fallback: simple regex-based parsing
        return parseContentSimple(content);
    }
}

/**
 * Simple fallback parser for basic word=translation format
 */
function parseContentSimple(content: string): ParsedCard[] {
    const cards: ParsedCard[] = [];
    const lines = content.split('\n');

    for (const line of lines) {
        // Look for patterns like "word = translation" or "word: translation"
        const equalMatch = line.match(/^([^=:]+?)\s*[=:]\s*(.+)$/);
        if (equalMatch) {
            cards.push({
                front: equalMatch[1].trim(),
                back: equalMatch[2].trim()
            });
        }
    }

    console.log(`📋 Simple parser found ${cards.length} cards`);
    return cards;
}

/**
 * Convert parsed cards to Mochi card format
 */
function createMochiCard(card: ParsedCard, id: string): MochiCard {
    let content = `# Front\n${card.front}\n\n---\n\n# Back\n${card.back}`;

    if (card.context) {
        content += `\n\n${card.context}`;
    }

    return {
        id: `card${id}`,
        content,
        name: card.front
    };
}

/**
 * Generate unique card IDs
 */
function generateCardId(index: number): string {
    return index.toString().padStart(6, '0');
}

/**
 * Create .mochi file (ZIP with data.json)
 */
async function createMochiFileEdn(ednData: string, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(outputPath);
        const archive = archiver('zip', {
            zlib: { level: 9 }
        });

        output.on('close', () => {
            const sizeInKB = (archive.pointer() / 1024).toFixed(2);
            console.log(`📦 Created ${outputPath} (${sizeInKB} KB)`);
            resolve();
        });

        archive.on('error', (err) => {
            reject(err);
        });

        archive.pipe(output);
        archive.append(ednData, { name: 'data.edn' });
        archive.finalize();
    });
}

/**
 * Main execution
 */
async function main() {
    console.log('🚀 Starting Mochi bulk import generation...\n');

    try {
        const pageUrlFromEnv = process.env.PAGE_URL || process.argv.find(arg => arg.startsWith('--page='))?.split('=')[1];

        const allCards: ParsedCard[] = [];

        if (pageUrlFromEnv) {
            // Single page mode
            console.log('📚 Single-page mode enabled via PAGE_URL/--page');
            const pageUrl = pageUrlFromEnv;
            // Extract Notion 32-char page ID from slug or direct URL
            let pageId: string | null = null;
            const idFromSlug = pageUrl.match(/-([a-f0-9]{32})(?:\?|$)/);
            if (idFromSlug) {
                pageId = idFromSlug[1];
            } else {
                const idDirect = pageUrl.match(/notion\.so\/([a-f0-9]{32})/);
                if (idDirect) pageId = idDirect[1];
            }

            if (!pageId) {
                throw new Error('Could not extract Notion page ID from URL.');
            }

            const pageContent = await notionService.getPageContent(pageId, false);
            console.log(`✅ Loaded page: "${pageContent.title}"`);
            const cards = await parseContentWithClaude(pageContent.content, pageContent.title);
            allCards.push(...cards);
            console.log(`   → Generated ${cards.length} cards\n`);
        } else {
            // Full study plan mode
            console.log('📚 Fetching Spanish study content from Notion...');
            const studyPlan = await notionService.getSpanishStudyPlan();
            console.log(`✅ Main page: "${studyPlan.title}"`);
            console.log(`✅ Found ${studyPlan.subPages.length} sub-pages\n`);

            // Process main page
            console.log(`📄 Processing main page: ${studyPlan.title}`);
            const mainCards = await parseContentWithClaude(studyPlan.content, studyPlan.title);
            allCards.push(...mainCards);
            console.log(`   → Generated ${mainCards.length} cards\n`);

            // Process sub-pages
            for (const subPage of studyPlan.subPages) {
                console.log(`📄 Processing sub-page: ${subPage.title}`);
                try {
                    const subPageContent = await notionService.getPageContent(subPage.id, false);
                    const subCards = await parseContentWithClaude(subPageContent.content, subPage.title);
                    allCards.push(...subCards);
                    console.log(`   → Generated ${subCards.length} cards\n`);
                } catch (error) {
                    console.error(`❌ Failed to process sub-page "${subPage.title}":`, error);
                }
            }
        }

        console.log(`\n✨ Total cards generated: ${allCards.length}`);

        // Create Mochi data structure
        const mochiCards: MochiCard[] = allCards.map((card, index) =>
            createMochiCard(card, generateCardId(index))
        );

        const decks: MochiDeck[] = [{
            name: 'Spanish Study',
            id: 'spanish01',
            cards: mochiCards
        }];
        const edn = buildEdn(decks);

        // Create output directory if needed
        const outputDir = path.join(process.cwd(), 'output');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const outputPath = path.join(outputDir, 'spanish-study.mochi');

        // Generate .mochi file
        console.log('\n📦 Creating .mochi file (EDN)...');
        await createMochiFileEdn(edn, outputPath);

        console.log('\n✅ Successfully generated spanish-study.mochi!');
        console.log('\n📥 To import into Mochi:');
        console.log('   1. Open Mochi app');
        console.log('   2. Click "Import" button');
        console.log('   3. Select the file:', outputPath);
        console.log('   4. Done! Your cards are ready to study.');

    } catch (error) {
        console.error('\n❌ Error generating Mochi file:', error);
        process.exit(1);
    }
}

// Run the script
main();

