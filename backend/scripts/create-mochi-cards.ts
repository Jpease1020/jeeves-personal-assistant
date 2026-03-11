/**
 * Create Mochi Cards via API
 * 
 * Reads Notion content and creates cards directly in Mochi via REST API
 */

import * as dotenv from 'dotenv';
import axios from 'axios';
import { notionService } from '../src/services/notion-service';

dotenv.config();

interface ParsedCard {
    front: string;
    back: string;
    context?: string;
}

interface MochiCard {
    id: string;
    content: string;
}

interface MochiDeck {
    id: string;
    name: string;
}

// Setup API client
const MOCHI_API_KEY = process.env.MOCHI_API_KEY;
if (!MOCHI_API_KEY) {
    console.error('❌ MOCHI_API_KEY not set in environment');
    process.exit(1);
}

const client = axios.create({
    baseURL: 'https://app.mochi.cards/api',
    headers: {
        'Authorization': `Basic ${Buffer.from(MOCHI_API_KEY + ':').toString('base64')}`,
        'Content-Type': 'application/json'
    }
});

/**
 * Get or create Spanish deck
 */
async function getOrCreateSpanishDeck(): Promise<MochiDeck> {
    try {
        // Try to get existing Spanish deck
        const response = await client.get('/decks');
        const docs = response.data.docs || [];

        const spanishDeck = docs.find((deck: any) =>
            deck.name?.toLowerCase().includes('spanish')
        );

        if (spanishDeck) {
            console.log(`✅ Found existing deck: "${spanishDeck.name}" (${spanishDeck.id})`);
            return spanishDeck;
        }
    } catch (error) {
        console.log('Could not find existing deck, will create new one');
    }

    // Create new deck
    const response = await client.post('/decks', {
        name: 'Spanish Study'
    });

    console.log(`✅ Created new deck: "${response.data.name}" (${response.data.id})`);
    return response.data;
}

/**
 * Parse content into cards (simple format: word = translation)
 */
function parseSimple(content: string): ParsedCard[] {
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

    return cards;
}

/**
 * Create cards in Mochi via API
 */
async function createCards(deck: MochiDeck, cards: ParsedCard[]): Promise<{ created: number; errors: string[] }> {
    const errors: string[] = [];
    let created = 0;

    for (const card of cards) {
        try {
            const content = `# ${card.front}\n\n---\n\n${card.back}`;

            const response = await client.post('/cards', {
                content,
                'deck-id': deck.id
            });

            console.log(`✅ Created card: ${card.front}`);
            created++;
        } catch (error: any) {
            const errorMsg = error.response?.data?.errors || error.message;
            console.error(`❌ Failed to create card "${card.front}":`, errorMsg);
            errors.push(`${card.front}: ${errorMsg}`);
        }
    }

    return { created, errors };
}

/**
 * Main execution
 */
async function main() {
    console.log('🚀 Starting Mochi API card creation...\n');

    try {
        // Get page URL from command line or environment
        const pageUrl = process.argv.find(arg => arg.startsWith('--page='))?.split('=')[1]
            || process.env.PAGE_URL
            || 'https://www.notion.so/Verb-Conjugation-37b15e3633f147ec827b64e8d1bbd9e2';

        // Extract page ID
        let pageId: string | null = null;
        const idFromSlug = pageUrl.match(/-([a-f0-9]{32})(?:\?|$)/);
        if (idFromSlug) {
            pageId = idFromSlug[1];
        } else {
            const idDirect = pageUrl.match(/notion\.so\/([a-f0-9]{32})/);
            if (idDirect) pageId = idDirect[1];
        }

        if (!pageId) {
            throw new Error('Could not extract Notion page ID from URL');
        }

        console.log(`📄 Fetching Notion page: ${pageId}`);
        const pageContent = await notionService.getPageContent(pageId, false);
        console.log(`✅ Loaded: "${pageContent.title}"\n`);

        // Parse content into cards
        console.log(`📝 Parsing content...`);
        const cards = parseSimple(pageContent.content);
        console.log(`✅ Found ${cards.length} cards to create\n`);

        if (cards.length === 0) {
            console.log('⚠️ No cards found in content. Exiting.');
            return;
        }

        // Get or create deck
        const deck = await getOrCreateSpanishDeck();
        console.log('');

        // Create cards via API
        console.log(`🎴 Creating ${cards.length} cards in Mochi...\n`);
        const result = await createCards(deck, cards);

        // Summary
        console.log('\n✨ Summary:');
        console.log(`✅ Created: ${result.created} cards`);
        if (result.errors.length > 0) {
            console.log(`❌ Errors: ${result.errors.length}`);
            result.errors.forEach(e => console.log(`   - ${e}`));
        }
        console.log(`\n🎉 Done! Check Mochi for your cards.`);

    } catch (error) {
        console.error('\n❌ Error:', error);
        process.exit(1);
    }
}

// Run
main();

