/**
 * Test Mochi API with sample JSON data
 */

import * as dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const testData = {
    "name": "Spanish Lean A2",
    "cards": [
        { "front": "en", "back": "in / on\n\nExample:\nEstoy en la casa.\nI am in the house.", "tags": ["preposition", "lean"] },
        { "front": "in / on", "back": "en\n\nExample:\nEstoy en la casa.\nI am in the house.", "tags": ["preposition", "lean", "reverse"] },
        { "front": "a", "back": "to\n\nExample:\nVoy a la escuela.\nI go to school.", "tags": ["preposition", "lean"] },
        { "front": "to", "back": "a\n\nExample:\nVoy a la escuela.\nI go to school.", "tags": ["preposition", "lean", "reverse"] },
        { "front": "de", "back": "of / from\n\nExample:\nSoy de España.\nI am from Spain.", "tags": ["preposition", "lean"] },
        { "front": "of / from", "back": "de\n\nExample:\nSoy de España.\nI am from Spain.", "tags": ["preposition", "lean", "reverse"] },
        { "front": "por", "back": "for / by / through\n\nExample:\nCaminamos por el parque.\nWe walk through the park.", "tags": ["preposition", "lean"] },
        { "front": "for / by / through", "back": "por\n\nExample:\nCaminamos por el parque.\nWe walk through the park.", "tags": ["preposition", "lean", "reverse"] },
        { "front": "para", "back": "for / in order to\n\nExample:\nEste regalo es para ti.\nThis gift is for you.", "tags": ["preposition", "lean"] },
        { "front": "for / in order to", "back": "para\n\nExample:\nEste regalo es para ti.\nThis gift is for you.", "tags": ["preposition", "lean", "reverse"] },
        { "front": "con", "back": "with\n\nExample:\nHablo con mi amigo.\nI talk with my friend.", "tags": ["preposition", "lean"] },
        { "front": "with", "back": "con\n\nExample:\nHablo con mi amigo.\nI talk with my friend.", "tags": ["preposition", "lean", "reverse"] },
        { "front": "aquí", "back": "here\n\nExample:\nEl libro está aquí.\nThe book is here.", "tags": ["adverb", "lean"] },
        { "front": "here", "back": "aquí\n\nExample:\nEl libro está aquí.\nThe book is here.", "tags": ["adverb", "lean", "reverse"] },
        { "front": "allí", "back": "there\n\nExample:\nLa tienda está allí.\nThe store is there.", "tags": ["adverb", "lean"] },
        { "front": "there", "back": "allí\n\nExample:\nLa tienda está allí.\nThe store is there.", "tags": ["adverb", "lean", "reverse"] },
        { "front": "hoy", "back": "today\n\nExample:\nHoy tengo una reunión.\nToday I have a meeting.", "tags": ["adverb", "lean"] },
        { "front": "today", "back": "hoy\n\nExample:\nHoy tengo una reunión.\nToday I have a meeting.", "tags": ["adverb", "lean", "reverse"] },
        { "front": "mañana", "back": "tomorrow\n\nExample:\nMañana será un día ocupado.\nTomorrow will be a busy day.", "tags": ["adverb", "lean"] },
        { "front": "tomorrow", "back": "mañana\n\nExample:\nMañana será un día ocupado.\nTomorrow will be a busy day.", "tags": ["adverb", "lean", "reverse"] },
        { "front": "siempre", "back": "always\n\nExample:\nSiempre desayuno a las ocho.\nI always eat breakfast at eight.", "tags": ["adverb", "lean"] },
        { "front": "always", "back": "siempre\n\nExample:\nSiempre desayuno a las ocho.\nI always eat breakfast at eight.", "tags": ["adverb", "lean", "reverse"] },
        { "front": "nunca", "back": "never\n\nExample:\nNunca he visto eso.\nI have never seen that.", "tags": ["adverb", "lean"] },
        { "front": "never", "back": "nunca\n\nExample:\nNunca he visto eso.\nI have never seen that.", "tags": ["adverb", "lean", "reverse"] },
        { "front": "ser — present", "back": "to be (permanent)\n\nsoy, eres, es, somos, sois, son\n\nExample:\nSoy estudiante.\nI am a student.", "tags": ["verb", "conjugation", "lean"] },
        { "front": "estar — present", "back": "to be (temporary)\n\nestoy, estás, está, estamos, estáis, están\n\nExample:\nEstoy cansado.\nI am tired.", "tags": ["verb", "conjugation", "lean"] },
        { "front": "tener — present", "back": "to have\n\ntengo, tienes, tiene, tenemos, tenéis, tienen\n\nExample:\nTengo un perro.\nI have a dog.", "tags": ["verb", "conjugation", "lean"] },
        { "front": "ir — present", "back": "to go\n\nvoy, vas, va, vamos, vais, van\n\nExample:\nVoy a casa.\nI am going home.", "tags": ["verb", "conjugation", "lean"] },
        { "front": "hacer — present", "back": "to do / make\n\nhago, haces, hace, hacemos, hacéis, hacen\n\nExample:\nHago ejercicio.\nI exercise.", "tags": ["verb", "conjugation", "lean"] }
    ]
};

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

async function testMochiAPI() {
    console.log('🧪 Testing Mochi API...\n');

    try {
        // Step 1: Create or get deck
        let deck;
        try {
            const decksResponse = await client.get('/decks');
            const docs = decksResponse.data.docs || [];

            deck = docs.find((d: any) => d.name === testData.name);

            if (deck) {
                console.log(`✅ Found existing deck: "${deck.name}" (${deck.id})`);
            }
        } catch (error) {
            console.log('Could not fetch existing decks');
        }

        if (!deck) {
            console.log(`📚 Creating deck: "${testData.name}"`);
            const createResponse = await client.post('/decks', {
                name: testData.name
            });
            deck = createResponse.data;
            console.log(`✅ Created deck: "${deck.name}" (${deck.id})`);
        }

        console.log('');

        // Step 2: Create cards
        let successCount = 0;
        let errorCount = 0;

        for (const card of testData.cards) {
            try {
                const content = `# ${card.front}\n\n---\n\n${card.back}`;

                const response = await client.post('/cards', {
                    content,
                    'deck-id': deck.id
                });

                console.log(`✅ Created: "${card.front}" → "${card.back.split('\n')[0]}"`);
                successCount++;
            } catch (error: any) {
                console.error(`❌ Failed: "${card.front}" -`, error.response?.data?.errors || error.message);
                errorCount++;
            }
        }

        console.log('\n✨ Results:');
        console.log(`✅ Success: ${successCount}/${testData.cards.length}`);
        console.log(`❌ Errors: ${errorCount}/${testData.cards.length}`);
        console.log(`\n🎉 Check Mochi for deck "${testData.name}"!`);

    } catch (error: any) {
        console.error('\n❌ Error:', error.response?.data || error.message);
        process.exit(1);
    }
}

testMochiAPI();

