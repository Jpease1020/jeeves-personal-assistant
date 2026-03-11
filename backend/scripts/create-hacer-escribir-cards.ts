/**
 * Create Mochi cards for "hacer" and "escribir" verb conjugations
 */

import * as dotenv from 'dotenv';
import { mochiService } from '../src/services/mochi-service';

dotenv.config();

interface ConjugationCard {
    spanish: string;
    english: string;
}

const cards: ConjugationCard[] = [
    // ===== HACER =====
    // Present Tense
    { spanish: 'Yo hago la tarea.', english: 'I do the homework.' },
    { spanish: 'Tú haces ejercicio.', english: 'You do exercise.' },
    { spanish: 'Él/Ella/Usted hace la cama.', english: 'He/She/You make the bed.' },
    { spanish: 'Nosotros hacemos la cena.', english: 'We make dinner.' },
    { spanish: 'Vosotros hacéis ruido.', english: 'You all make noise.' },
    { spanish: 'Ellos/Ellas/Ustedes hacen preguntas.', english: 'They/You all ask questions.' },
    
    // Present Progressive Tense
    { spanish: 'Yo estoy haciendo la tarea.', english: 'I am doing the homework.' },
    { spanish: 'Tú estás haciendo ejercicio.', english: 'You are doing exercise.' },
    { spanish: 'Él/Ella/Usted está haciendo la cama.', english: 'He/She/You are making the bed.' },
    { spanish: 'Nosotros estamos haciendo la cena.', english: 'We are making dinner.' },
    { spanish: 'Vosotros estáis haciendo ruido.', english: 'You all are making noise.' },
    { spanish: 'Ellos/Ellas/Ustedes están haciendo preguntas.', english: 'They/You all are asking questions.' },
    
    // Imperfect Tense
    { spanish: 'Yo hacía la tarea todos los días.', english: 'I used to do the homework every day.' },
    { spanish: 'Tú hacías ejercicio en la mañana.', english: 'You used to do exercise in the morning.' },
    { spanish: 'Él/Ella/Usted hacía la cama temprano.', english: 'He/She/You used to make the bed early.' },
    { spanish: 'Nosotros hacíamos la cena juntos.', english: 'We used to make dinner together.' },
    { spanish: 'Vosotros hacíais ruido en la clase.', english: 'You all used to make noise in class.' },
    { spanish: 'Ellos/Ellas/Ustedes hacían preguntas difíciles.', english: 'They/You all used to ask difficult questions.' },
    
    // Preterite Tense
    { spanish: 'Yo hice la tarea anoche.', english: 'I did the homework last night.' },
    { spanish: 'Tú hiciste ejercicio ayer.', english: 'You did exercise yesterday.' },
    { spanish: 'Él/Ella/Usted hizo la cama esta mañana.', english: 'He/She/You made the bed this morning.' },
    { spanish: 'Nosotros hicimos la cena.', english: 'We made dinner.' },
    { spanish: 'Vosotros hicisteis ruido anoche.', english: 'You all made noise last night.' },
    { spanish: 'Ellos/Ellas/Ustedes hicieron muchas preguntas.', english: 'They/You all asked many questions.' },
    
    // Future Tense
    { spanish: 'Yo haré la tarea mañana.', english: 'I will do the homework tomorrow.' },
    { spanish: 'Tú harás ejercicio más tarde.', english: 'You will do exercise later.' },
    { spanish: 'Él/Ella/Usted hará la cama después.', english: 'He/She/You will make the bed later.' },
    { spanish: 'Nosotros haremos la cena.', english: 'We will make dinner.' },
    { spanish: 'Vosotros haréis ruido en la fiesta.', english: 'You all will make noise at the party.' },
    { spanish: 'Ellos/Ellas/Ustedes harán preguntas importantes.', english: 'They/You all will ask important questions.' },
    
    // ===== ESCRIBIR =====
    // Present Tense
    { spanish: 'Yo escribo una carta.', english: 'I write a letter.' },
    { spanish: 'Tú escribes un libro.', english: 'You write a book.' },
    { spanish: 'Él/Ella/Usted escribe poesía.', english: 'He/She/You write poetry.' },
    { spanish: 'Nosotros escribimos juntos.', english: 'We write together.' },
    { spanish: 'Vosotros escribís artículos.', english: 'You all write articles.' },
    { spanish: 'Ellos/Ellas/Ustedes escriben ensayos.', english: 'They/You all write essays.' },
    
    // Present Progressive Tense
    { spanish: 'Yo estoy escribiendo una carta.', english: 'I am writing a letter.' },
    { spanish: 'Tú estás escribiendo un libro.', english: 'You are writing a book.' },
    { spanish: 'Él/Ella/Usted está escribiendo poesía.', english: 'He/She/You are writing poetry.' },
    { spanish: 'Nosotros estamos escribiendo juntos.', english: 'We are writing together.' },
    { spanish: 'Vosotros estáis escribiendo artículos.', english: 'You all are writing articles.' },
    { spanish: 'Ellos/Ellas/Ustedes están escribiendo ensayos.', english: 'They/You all are writing essays.' },
    
    // Preterite Tense
    { spanish: 'Yo escribí una carta.', english: 'I wrote a letter.' },
    { spanish: 'Tú escribiste un libro.', english: 'You wrote a book.' },
    { spanish: 'Él/Ella/Usted escribió un poema.', english: 'He/She/You wrote a poem.' },
    { spanish: 'Nosotros escribimos juntos.', english: 'We wrote together.' },
    { spanish: 'Vosotros escribisteis artículos.', english: 'You all wrote articles.' },
    { spanish: 'Ellos/Ellas/Ustedes escribieron ensayos.', english: 'They/You all wrote essays.' },
    
    // Imperfect Tense
    { spanish: 'Yo escribía cartas.', english: 'I used to write letters.' },
    { spanish: 'Tú escribías todos los días.', english: 'You used to write every day.' },
    { spanish: 'Él/Ella/Usted escribía poemas.', english: 'He/She/You used to write poems.' },
    { spanish: 'Nosotros escribíamos juntos.', english: 'We used to write together.' },
    { spanish: 'Vosotros escribíais en el periódico.', english: 'You all used to write in the newspaper.' },
    { spanish: 'Ellos/Ellas/Ustedes escribían cuentos.', english: 'They/You all used to write stories.' },
    
    // Future Tense
    { spanish: 'Yo escribiré una carta.', english: 'I will write a letter.' },
    { spanish: 'Tú escribirás un libro.', english: 'You will write a book.' },
    { spanish: 'Él/Ella/Usted escribirá poesía.', english: 'He/She/You will write poetry.' },
    { spanish: 'Nosotros escribiremos juntos.', english: 'We will write together.' },
    { spanish: 'Vosotros escribiréis artículos.', english: 'You all will write articles.' },
    { spanish: 'Ellos/Ellas/Ustedes escribirán ensayos.', english: 'They/You all will write essays.' },
];

async function createCards() {
    console.log('🎴 Creating Mochi cards for "hacer" and "escribir" conjugations...\n');
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

createCards().catch(console.error);





