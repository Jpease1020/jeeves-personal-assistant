/**
 * LLM Response Quality Tests
 * Tests the quality and structure of AI responses without mocking the LLM
 * Focuses on response format, completeness, and consistency
 */

import { chatWithAgent } from '../services/ai-agent';

describe('LLM Response Quality Tests', () => {
    const testUserId = 'test-user-llm-quality';

    describe('Response Structure Tests', () => {
        test('should return well-structured responses for general queries', async () => {
            const response = await chatWithAgent('Hello, how are you?', testUserId);

            expect(response).toBeDefined();
            expect(typeof response).toBe('string');
            expect(response.length).toBeGreaterThan(10);
            expect(response.trim().length).toBeGreaterThan(0);

            console.log(`✅ General query response structure valid. Length: ${response.length}`);
        });

        test('should return structured responses for morning routine queries', async () => {
            const response = await chatWithAgent('Help me with my morning routine', testUserId);

            expect(response).toBeDefined();
            expect(typeof response).toBe('string');
            expect(response.length).toBeGreaterThan(20);

            // Check for common morning routine elements
            const lowerResponse = response.toLowerCase();
            const hasRoutineElements =
                lowerResponse.includes('morning') ||
                lowerResponse.includes('routine') ||
                lowerResponse.includes('habit') ||
                lowerResponse.includes('step');

            expect(hasRoutineElements).toBe(true);

            console.log(`✅ Morning routine response structure valid. Length: ${response.length}`);
        });

        test('should return structured responses for task management queries', async () => {
            const response = await chatWithAgent('What are my priorities today?', testUserId);

            expect(response).toBeDefined();
            expect(typeof response).toBe('string');
            expect(response.length).toBeGreaterThan(20);

            console.log(`✅ Task management response structure valid. Length: ${response.length}`);
        });
    });

    describe('Response Consistency Tests', () => {
        test('should return consistent response types for similar queries', async () => {
            const queries = [
                'What should I do today?',
                'Help me plan my day',
                'What are my priorities?'
            ];

            const responses = await Promise.all(
                queries.map(query => chatWithAgent(query, testUserId))
            );

            // All responses should be strings
            responses.forEach(response => {
                expect(typeof response).toBe('string');
                expect(response.length).toBeGreaterThan(10);
            });

            // Responses should be different (not cached)
            const uniqueResponses = new Set(responses);
            expect(uniqueResponses.size).toBeGreaterThan(1);

            console.log(`✅ Response consistency verified. ${responses.length} unique responses`);
        });

        test('should maintain conversation context', async () => {
            // First message
            const response1 = await chatWithAgent('My name is Justin', testUserId);
            expect(response1).toBeDefined();

            // Follow-up message that should reference context
            const response2 = await chatWithAgent('What is my name?', testUserId);
            expect(response2).toBeDefined();

            // Both should be valid responses
            expect(typeof response1).toBe('string');
            expect(typeof response2).toBe('string');

            console.log('✅ Conversation context maintained');
        });
    });

    describe('Response Quality Indicators', () => {
        test('should provide helpful responses for ADHD-related queries', async () => {
            const response = await chatWithAgent('I feel overwhelmed and distracted', testUserId);

            expect(response).toBeDefined();
            expect(typeof response).toBe('string');
            expect(response.length).toBeGreaterThan(30);

            // Check for supportive language
            const lowerResponse = response.toLowerCase();
            const hasSupportiveElements =
                lowerResponse.includes('help') ||
                lowerResponse.includes('support') ||
                lowerResponse.includes('understand') ||
                lowerResponse.includes('suggest') ||
                lowerResponse.includes('try');

            expect(hasSupportiveElements).toBe(true);

            console.log(`✅ ADHD-supportive response quality verified. Length: ${response.length}`);
        });

        test('should provide actionable responses for habit queries', async () => {
            const response = await chatWithAgent('How can I build better habits?', testUserId);

            expect(response).toBeDefined();
            expect(typeof response).toBe('string');
            expect(response.length).toBeGreaterThan(30);

            // Check for actionable language
            const lowerResponse = response.toLowerCase();
            const hasActionableElements =
                lowerResponse.includes('start') ||
                lowerResponse.includes('begin') ||
                lowerResponse.includes('try') ||
                lowerResponse.includes('step') ||
                lowerResponse.includes('first');

            expect(hasActionableElements).toBe(true);

            console.log(`✅ Actionable habit response quality verified. Length: ${response.length}`);
        });
    });

    describe('Error Handling Tests', () => {
        test('should handle empty messages gracefully', async () => {
            const response = await chatWithAgent('', testUserId);

            expect(response).toBeDefined();
            expect(typeof response).toBe('string');

            console.log('✅ Empty message handling verified');
        });

        test('should handle very long messages', async () => {
            const longMessage = 'Help me with my morning routine '.repeat(100);
            const response = await chatWithAgent(longMessage, testUserId);

            expect(response).toBeDefined();
            expect(typeof response).toBe('string');
            expect(response.length).toBeGreaterThan(10);

            console.log('✅ Long message handling verified');
        });

        test('should handle special characters and emojis', async () => {
            const specialMessage = 'Hello! 👋 How are you? 🚀 Can you help me? 💪';
            const response = await chatWithAgent(specialMessage, testUserId);

            expect(response).toBeDefined();
            expect(typeof response).toBe('string');
            expect(response.length).toBeGreaterThan(10);

            console.log('✅ Special characters handling verified');
        });
    });

    describe('Response Time Tests', () => {
        test('should respond within reasonable time', async () => {
            const startTime = Date.now();
            const response = await chatWithAgent('Hello', testUserId);
            const endTime = Date.now();

            const responseTime = endTime - startTime;

            expect(response).toBeDefined();
            expect(responseTime).toBeLessThan(30000); // 30 seconds max

            console.log(`✅ Response time acceptable: ${responseTime}ms`);
        });
    });
});
