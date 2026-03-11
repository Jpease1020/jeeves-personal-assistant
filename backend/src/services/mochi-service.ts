import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

interface MochiCard {
    id: string;
    content: string;
    deck_id: string;
    template_id?: string;
    created_at?: string;
    updated_at?: string;
}

interface MochiDeck {
    id: string;
    name: string;
    description?: string;
    created_at?: string;
}

interface MochiTemplate {
    id: string;
    name: string;
    content: string;
    fields: Record<string, any>;
}

interface CreateCardRequest {
    content: string;
    deck_id: string;
    template_id?: string;
}

export class MochiService {
    private apiKey: string;
    private baseURL: string;
    private client: any;

    constructor() {
        this.apiKey = process.env.MOCHI_API_KEY || '';
        this.baseURL = 'https://app.mochi.cards/api';

        if (!this.apiKey) {
            console.warn('⚠️ MOCHI_API_KEY not set - Mochi integration will be disabled');
        }

        this.client = axios.create({
            baseURL: this.baseURL,
            headers: {
                'Authorization': `Basic ${Buffer.from(this.apiKey + ':').toString('base64')}`,
                'Content-Type': 'application/json'
            }
        });
    }

    /**
     * Create a Spanish learning card in Mochi
     */
    async createCard(front: string, back: string, context?: string, deckId?: string): Promise<MochiCard> {
        if (!this.apiKey) {
            throw new Error('MOCHI_API_KEY not configured');
        }

        try {
            // Get or create Spanish deck
            const deck = await this.getOrCreateSpanishDeck(deckId);

            const cardContent = this.formatCardContent(front, back, context);

            const createCardRequest = {
                content: cardContent,
                'deck-id': deck.id
            };

            const response = await this.client.post('/cards', createCardRequest);

            console.log(`📝 Created Mochi card: ${front}`);

            return response.data;
        } catch (error: any) {
            console.error('Error creating Mochi card:', error.response?.data || error.message);
            throw new Error(`Failed to create Mochi card: ${error.response?.data?.message || error.message}`);
        }
    }

    /**
     * Get a card by ID
     */
    async getCard(cardId: string): Promise<MochiCard> {
        if (!this.apiKey) {
            throw new Error('MOCHI_API_KEY not configured');
        }

        try {
            const response = await this.client.get(`/cards/${cardId}`);
            return response.data;
        } catch (error: any) {
            console.error('Error getting Mochi card:', error.response?.data || error.message);
            throw new Error(`Failed to get Mochi card: ${error.response?.data?.message || error.message}`);
        }
    }

    /**
     * Get all cards from a deck
     */
    async getCardsFromDeck(deckId: string): Promise<MochiCard[]> {
        if (!this.apiKey) {
            throw new Error('MOCHI_API_KEY not configured');
        }

        try {
            const response = await this.client.get(`/decks/${deckId}/cards`);
            return response.data;
        } catch (error: any) {
            console.error('Error getting cards from deck:', error.response?.data || error.message);
            throw new Error(`Failed to get cards from deck: ${error.response?.data?.message || error.message}`);
        }
    }

    /**
     * Create or get Spanish deck
     */
    async getOrCreateSpanishDeck(deckId?: string): Promise<MochiDeck> {
        if (deckId) {
            try {
                const response = await this.client.get(`/decks/${deckId}`);
                return response.data;
            } catch (error) {
                console.log('Deck not found, checking for existing deck...');
            }
        }

        // First, check if a deck named "Spanish Study" already exists
        try {
            const decks = await this.getDecks();
            const existingDeck = decks.find((deck: MochiDeck) => deck.name === 'Spanish Study');
            if (existingDeck) {
                console.log('📚 Using existing Spanish Study deck');
                return existingDeck;
            }
        } catch (error) {
            console.log('Could not check existing decks, will create new one');
        }

        // Create new Spanish deck if none exists
        try {
            const response = await this.client.post('/decks', {
                name: 'Spanish Study'
            });

            console.log('📚 Created new Spanish Study deck in Mochi');

            return response.data;
        } catch (error: any) {
            console.error('Error creating Spanish deck:', error.response?.data || error.message);
            throw new Error(`Failed to create Spanish deck: ${error.response?.data?.message || error.message}`);
        }
    }

    /**
     * Get all decks
     */
    async getDecks(): Promise<MochiDeck[]> {
        if (!this.apiKey) {
            throw new Error('MOCHI_API_KEY not configured');
        }

        try {
            const response = await this.client.get('/decks');
            return response.data;
        } catch (error: any) {
            console.error('Error getting decks:', error.response?.data || error.message);
            throw new Error(`Failed to get decks: ${error.response?.data?.message || error.message}`);
        }
    }

    /**
     * Sync Notion content to Mochi
     */
    async syncNotionContentToMochi(notionItems: Array<{ front: string; back: string; context?: string }>, deckId?: string): Promise<{ created: number; errors: string[] }> {
        const results = { created: 0, errors: [] as string[] };

        if (!this.apiKey) {
            throw new Error('MOCHI_API_KEY not configured');
        }

        const deck = await this.getOrCreateSpanishDeck(deckId);

        for (const item of notionItems) {
            try {
                await this.createCard(item.front, item.back, item.context, deck.id);
                results.created++;
            } catch (error: any) {
                console.error(`Error syncing card "${item.front}":`, error.message);
                results.errors.push(`${item.front}: ${error.message}`);
            }
        }

        console.log(`✅ Synced ${results.created} items to Mochi`);

        return results;
    }

    /**
     * Format card content for Mochi
     * Uses --- separator to create flip cards (front/back)
     */
    private formatCardContent(front: string, back: string, context?: string): string {
        // Mochi uses --- separator to create flip cards
        // Everything before --- is the front, everything after is the back
        let content = `${front}\n\n---\n\n${back}`;

        if (context) {
            content += `\n\n**Context:** ${context}`;
        }

        return content;
    }

    /**
     * Get review statistics from Mochi
     */
    async getReviewStats(deckId: string): Promise<any> {
        if (!this.apiKey) {
            throw new Error('MOCHI_API_KEY not configured');
        }

        try {
            const cards = await this.getCardsFromDeck(deckId);

            return {
                totalCards: cards.length,
                lastReview: cards.length > 0 ? cards[0].updated_at : null,
                deckId
            };
        } catch (error: any) {
            console.error('Error getting review stats:', error.response?.data || error.message);
            throw new Error(`Failed to get review stats: ${error.response?.data?.message || error.message}`);
        }
    }
}

export const mochiService = new MochiService();


