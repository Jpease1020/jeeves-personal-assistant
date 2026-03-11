/**
 * Create Mochi cards for 3 regular Spanish verbs: estudiar, comer, vivir
 */

import * as dotenv from 'dotenv';
import { mochiService } from '../src/services/mochi-service';

dotenv.config();

interface ConjugationCard {
    spanish: string;
    english: string;
}

const cards: ConjugationCard[] = [
    // ===== ESTUDIAR (to study) - Regular -AR verb =====
    // Present Tense
    { spanish: 'Yo estudio español.', english: 'I study Spanish.' },
    { spanish: 'Tú estudias matemáticas.', english: 'You study mathematics.' },
    { spanish: 'Él/Ella/Usted estudia historia.', english: 'He/She/You study history.' },
    { spanish: 'Nosotros estudiamos juntos.', english: 'We study together.' },
    { spanish: 'Vosotros estudiáis en la biblioteca.', english: 'You all study in the library.' },
    { spanish: 'Ellos/Ellas/Ustedes estudian mucho.', english: 'They/You all study a lot.' },
    
    // Present Progressive Tense
    { spanish: 'Yo estoy estudiando español.', english: 'I am studying Spanish.' },
    { spanish: 'Tú estás estudiando matemáticas.', english: 'You are studying mathematics.' },
    { spanish: 'Él/Ella/Usted está estudiando historia.', english: 'He/She/You are studying history.' },
    { spanish: 'Nosotros estamos estudiando juntos.', english: 'We are studying together.' },
    { spanish: 'Vosotros estáis estudiando en la biblioteca.', english: 'You all are studying in the library.' },
    { spanish: 'Ellos/Ellas/Ustedes están estudiando mucho.', english: 'They/You all are studying a lot.' },
    
    // Imperfect Tense
    { spanish: 'Yo estudiaba español todos los días.', english: 'I used to study Spanish every day.' },
    { spanish: 'Tú estudiabas en la mañana.', english: 'You used to study in the morning.' },
    { spanish: 'Él/Ella/Usted estudiaba en la universidad.', english: 'He/She/You used to study at the university.' },
    { spanish: 'Nosotros estudiábamos juntos.', english: 'We used to study together.' },
    { spanish: 'Vosotros estudiabais todos los días.', english: 'You all used to study every day.' },
    { spanish: 'Ellos/Ellas/Ustedes estudiaban por horas.', english: 'They/You all used to study for hours.' },
    
    // Preterite Tense
    { spanish: 'Yo estudié español ayer.', english: 'I studied Spanish yesterday.' },
    { spanish: 'Tú estudiaste toda la noche.', english: 'You studied all night.' },
    { spanish: 'Él/Ella/Usted estudió para el examen.', english: 'He/She/You studied for the exam.' },
    { spanish: 'Nosotros estudiamos juntos anoche.', english: 'We studied together last night.' },
    { spanish: 'Vosotros estudiasteis mucho.', english: 'You all studied a lot.' },
    { spanish: 'Ellos/Ellas/Ustedes estudiaron toda la semana.', english: 'They/You all studied all week.' },
    
    // Future Tense
    { spanish: 'Yo estudiaré español mañana.', english: 'I will study Spanish tomorrow.' },
    { spanish: 'Tú estudiarás más tarde.', english: 'You will study later.' },
    { spanish: 'Él/Ella/Usted estudiará en la biblioteca.', english: 'He/She/You will study in the library.' },
    { spanish: 'Nosotros estudiaremos juntos.', english: 'We will study together.' },
    { spanish: 'Vosotros estudiaréis esta tarde.', english: 'You all will study this afternoon.' },
    { spanish: 'Ellos/Ellas/Ustedes estudiarán mucho.', english: 'They/You all will study a lot.' },
    
    // ===== COMER (to eat) - Regular -ER verb =====
    // Present Tense
    { spanish: 'Yo como fruta todos los días.', english: 'I eat fruit every day.' },
    { spanish: 'Tú comes verduras.', english: 'You eat vegetables.' },
    { spanish: 'Él/Ella/Usted come en el restaurante.', english: 'He/She/You eat at the restaurant.' },
    { spanish: 'Nosotros comemos juntos.', english: 'We eat together.' },
    { spanish: 'Vosotros coméis muy rápido.', english: 'You all eat very fast.' },
    { spanish: 'Ellos/Ellas/Ustedes comen saludable.', english: 'They/You all eat healthy.' },
    
    // Present Progressive Tense
    { spanish: 'Yo estoy comiendo fruta.', english: 'I am eating fruit.' },
    { spanish: 'Tú estás comiendo verduras.', english: 'You are eating vegetables.' },
    { spanish: 'Él/Ella/Usted está comiendo en el restaurante.', english: 'He/She/You are eating at the restaurant.' },
    { spanish: 'Nosotros estamos comiendo juntos.', english: 'We are eating together.' },
    { spanish: 'Vosotros estáis comiendo muy rápido.', english: 'You all are eating very fast.' },
    { spanish: 'Ellos/Ellas/Ustedes están comiendo saludable.', english: 'They/You all are eating healthy.' },
    
    // Imperfect Tense
    { spanish: 'Yo comía fruta todos los días.', english: 'I used to eat fruit every day.' },
    { spanish: 'Tú comías en casa.', english: 'You used to eat at home.' },
    { spanish: 'Él/Ella/Usted comía en el restaurante.', english: 'He/She/You used to eat at the restaurant.' },
    { spanish: 'Nosotros comíamos juntos.', english: 'We used to eat together.' },
    { spanish: 'Vosotros comíais temprano.', english: 'You all used to eat early.' },
    { spanish: 'Ellos/Ellas/Ustedes comían mucho.', english: 'They/You all used to eat a lot.' },
    
    // Preterite Tense
    { spanish: 'Yo comí fruta esta mañana.', english: 'I ate fruit this morning.' },
    { spanish: 'Tú comiste en el restaurante.', english: 'You ate at the restaurant.' },
    { spanish: 'Él/Ella/Usted comió con nosotros.', english: 'He/She/You ate with us.' },
    { spanish: 'Nosotros comimos juntos ayer.', english: 'We ate together yesterday.' },
    { spanish: 'Vosotros comisteis muy rápido.', english: 'You all ate very fast.' },
    { spanish: 'Ellos/Ellas/Ustedes comieron mucho.', english: 'They/You all ate a lot.' },
    
    // Future Tense
    { spanish: 'Yo comeré fruta mañana.', english: 'I will eat fruit tomorrow.' },
    { spanish: 'Tú comerás más tarde.', english: 'You will eat later.' },
    { spanish: 'Él/Ella/Usted comerá en el restaurante.', english: 'He/She/You will eat at the restaurant.' },
    { spanish: 'Nosotros comeremos juntos.', english: 'We will eat together.' },
    { spanish: 'Vosotros comeréis esta noche.', english: 'You all will eat tonight.' },
    { spanish: 'Ellos/Ellas/Ustedes comerán saludable.', english: 'They/You all will eat healthy.' },
    
    // ===== VIVIR (to live) - Regular -IR verb =====
    // Present Tense
    { spanish: 'Yo vivo en España.', english: 'I live in Spain.' },
    { spanish: 'Tú vives en una ciudad.', english: 'You live in a city.' },
    { spanish: 'Él/Ella/Usted vive cerca de aquí.', english: 'He/She/You live near here.' },
    { spanish: 'Nosotros vivimos juntos.', english: 'We live together.' },
    { spanish: 'Vosotros vivís en el centro.', english: 'You all live in the center.' },
    { spanish: 'Ellos/Ellas/Ustedes viven felices.', english: 'They/You all live happy.' },
    
    // Present Progressive Tense
    { spanish: 'Yo estoy viviendo en España.', english: 'I am living in Spain.' },
    { spanish: 'Tú estás viviendo en una ciudad.', english: 'You are living in a city.' },
    { spanish: 'Él/Ella/Usted está viviendo cerca de aquí.', english: 'He/She/You are living near here.' },
    { spanish: 'Nosotros estamos viviendo juntos.', english: 'We are living together.' },
    { spanish: 'Vosotros estáis viviendo en el centro.', english: 'You all are living in the center.' },
    { spanish: 'Ellos/Ellas/Ustedes están viviendo felices.', english: 'They/You all are living happy.' },
    
    // Imperfect Tense
    { spanish: 'Yo vivía en España antes.', english: 'I used to live in Spain before.' },
    { spanish: 'Tú vivías en una ciudad.', english: 'You used to live in a city.' },
    { spanish: 'Él/Ella/Usted vivía cerca de aquí.', english: 'He/She/You used to live near here.' },
    { spanish: 'Nosotros vivíamos juntos.', english: 'We used to live together.' },
    { spanish: 'Vosotros vivíais en el campo.', english: 'You all used to live in the country.' },
    { spanish: 'Ellos/Ellas/Ustedes vivían felices.', english: 'They/You all used to live happy.' },
    
    // Preterite Tense
    { spanish: 'Yo viví en España por dos años.', english: 'I lived in Spain for two years.' },
    { spanish: 'Tú viviste en esa ciudad.', english: 'You lived in that city.' },
    { spanish: 'Él/Ella/Usted vivió aquí antes.', english: 'He/She/You lived here before.' },
    { spanish: 'Nosotros vivimos juntos el año pasado.', english: 'We lived together last year.' },
    { spanish: 'Vosotros vivisteis en el centro.', english: 'You all lived in the center.' },
    { spanish: 'Ellos/Ellas/Ustedes vivieron allí muchos años.', english: 'They/You all lived there for many years.' },
    
    // Future Tense
    { spanish: 'Yo viviré en España.', english: 'I will live in Spain.' },
    { spanish: 'Tú vivirás en una ciudad nueva.', english: 'You will live in a new city.' },
    { spanish: 'Él/Ella/Usted vivirá cerca de aquí.', english: 'He/She/You will live near here.' },
    { spanish: 'Nosotros viviremos juntos.', english: 'We will live together.' },
    { spanish: 'Vosotros viviréis en el centro.', english: 'You all will live in the center.' },
    { spanish: 'Ellos/Ellas/Ustedes vivirán felices.', english: 'They/You all will live happy.' },
];

async function createCards() {
    console.log('🎴 Creating Mochi cards for 3 regular verbs: estudiar, comer, vivir...\n');
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





