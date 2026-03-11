/**
 * Test Mochi API - Fresh test with conjugation cards
 */

import * as dotenv from 'dotenv';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

const testData = JSON.parse(fs.readFileSync(path.join(__dirname, '../spanish.json'), 'utf-8'));
testData.name = testData.name + ' - Test ' + Date.now();

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

async function testMochiAPI() {
    console.log('🧪 Testing Mochi API with conjugation cards...\n');

    try {
        let deck;
        console.log(`📚 Creating NEW deck: "${testData.name}"`);
        const createResponse = await client.post('/decks', {
            name: testData.name
        });
        deck = createResponse.data;
        console.log(`✅ Created deck: "${deck.name}" (${deck.id})\n`);

        let successCount = 0;
        let errorCount = 0;

        for (const card of testData.cards) {
            try {
                const content = `# ${card.front}\n\n---\n\n${card.back}`;

                const response = await client.post('/cards', {
                    content,
                    'deck-id': deck.id,
                    'manual-tags': card.tags || []
                });

                console.log(`✅ Created: "${card.front}"`);
                successCount++;
            } catch (error: any) {
                console.error(`❌ Failed: "${card.front}" -`, error.response?.data?.errors || error.message);
                errorCount++;
            }
        }

        console.log('\n✨ Results:');
        console.log(`✅ Success: ${successCount}/${testData.cards.length}`);
        console.log(`❌ Errors: ${errorCount}/${testData.cards.length}`);
        console.log(`\n🎉 Check Mochi for deck "${deck.name}"!`);
        console.log(`📌 Deck ID: ${deck.id}`);

    } catch (error: any) {
        console.error('\n❌ Error:', error.response?.data || error.message);
        process.exit(1);
    }
}

testMochiAPI();
