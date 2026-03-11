/**
 * Create Mochi cards for "hablar" verb conjugations
 */

import * as dotenv from 'dotenv';
import { mochiService } from '../src/services/mochi-service';

dotenv.config();

interface ConjugationCard {
    spanish: string;
    english: string;
}

const cards: ConjugationCard[] = [
    // Present Tense
    { spanish: 'Yo hablo español.', english: 'I speak Spanish.' },
    { spanish: 'Tú hablas inglés.', english: 'You speak English.' },
    { spanish: 'Él/Ella/Usted habla francés.', english: 'He/She/You speak French.' },
    { spanish: 'Nosotros hablamos italiano.', english: 'We speak Italian.' },
    { spanish: 'Vosotros habláis alemán.', english: 'You all speak German.' },
    { spanish: 'Ellos/Ellas/Ustedes hablan ruso.', english: 'They/You all speak Russian.' },
    
    // Present Progressive Tense
    { spanish: 'Yo estoy hablando con mi amigo.', english: 'I am talking with my friend.' },
    { spanish: 'Tú estás hablando por teléfono.', english: 'You are talking on the phone.' },
    { spanish: 'Él/Ella/Usted está hablando ahora.', english: 'He/She/You are talking now.' },
    { spanish: 'Nosotros estamos hablando juntos.', english: 'We are talking together.' },
    { spanish: 'Vosotros estáis hablando en clase.', english: 'You all are talking in class.' },
    { spanish: 'Ellos/Ellas/Ustedes están hablando.', english: 'They/You all are talking.' },
    
    // Imperfect Tense
    { spanish: 'Yo hablaba con mi abuela.', english: 'I was talking with my grandmother.' },
    { spanish: 'Tú hablabas demasiado.', english: 'You were talking too much.' },
    { spanish: 'Él/Ella/Usted hablaba en serio.', english: 'He/She/You were talking seriously.' },
    { spanish: 'Nosotros hablábamos de todo.', english: 'We were talking about everything.' },
    { spanish: 'Vosotros hablabais muy rápido.', english: 'You all were talking very fast.' },
    { spanish: 'Ellos/Ellas/Ustedes hablaban mucho.', english: 'They/You all were talking a lot.' },
    
    // Preterite Tense
    { spanish: 'Yo hablé con el profesor.', english: 'I talked with the teacher.' },
    { spanish: 'Tú hablaste ayer.', english: 'You talked yesterday.' },
    { spanish: 'Él/Ella/Usted habló en la reunión.', english: 'He/She/You talked at the meeting.' },
    { spanish: 'Nosotros hablamos con ellos.', english: 'We talked with them.' },
    { spanish: 'Vosotros hablasteis claro.', english: 'You all talked clearly.' },
    { spanish: 'Ellos/Ellas/Ustedes hablaron mucho.', english: 'They/You all talked a lot.' },
    
    // Future Tense
    { spanish: 'Yo hablaré mañana.', english: 'I will talk tomorrow.' },
    { spanish: 'Tú hablarás con ella.', english: 'You will talk with her.' },
    { spanish: 'Él/Ella/Usted hablará pronto.', english: 'He/She/You will talk soon.' },
    { spanish: 'Nosotros hablaremos después.', english: 'We will talk later.' },
    { spanish: 'Vosotros hablaréis en la fiesta.', english: 'You all will talk at the party.' },
    { spanish: 'Ellos/Ellas/Ustedes hablarán hoy.', english: 'They/You all will talk today.' },
];

async function createHablarCards() {
    console.log('🎴 Creating Mochi cards for "hablar" conjugations...\n');
    console.log('📚 Getting or creating Spanish Study deck...\n');

    // Get the deck once first to ensure it exists
    const deck = await mochiService.getOrCreateSpanishDeck();
    console.log(`✅ Using deck: "${deck.name}" (${deck.id})\n`);

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (const card of cards) {
        try {
            // Pass the deck ID to avoid repeated lookups
            await mochiService.createCard(card.spanish, card.english, undefined, deck.id);
            successCount++;
        } catch (error: any) {
            console.error(`❌ Failed: "${card.spanish}" -`, error.message);
            errors.push(`${card.spanish}: ${error.message}`);
            errorCount++;
        }
    }

    console.log('\n✨ Summary:');
    console.log(`✅ Created: ${successCount}/${cards.length} cards`);
    if (errorCount > 0) {
        console.log(`❌ Errors: ${errorCount}`);
        errors.forEach(e => console.log(`   - ${e}`));
    }
    console.log(`\n🎉 Done! Check Mochi for your cards in deck "${deck.name}".`);
}

createHablarCards().catch(console.error);

