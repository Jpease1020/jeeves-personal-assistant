/**
 * Test Configuration
 * Centralized configuration for all tests
 */

export const testConfig = {
    // Test user IDs
    testUserId: 'test-user-integration',
    testUserId2: 'test-user-integration-2',

    // Test dates
    testDate: '2024-01-15',
    testDate2: '2024-01-16',

    // Test timeouts
    defaultTimeout: 30000, // 30 seconds
    llmTimeout: 60000, // 60 seconds for LLM tests

    // Test data
    testMessages: {
        general: 'Hello, how are you?',
        morningRoutine: 'Help me with my morning routine',
        taskManagement: 'What are my priorities today?',
        habitTracking: 'Help me track my habits',
        learning: 'Help me study Spanish',
        reflection: 'Help me reflect on my day'
    },

    // Expected response characteristics
    responseExpectations: {
        minLength: 10,
        maxLength: 10000,
        shouldContainKeywords: {
            morningRoutine: ['morning', 'routine', 'habit', 'step'],
            taskManagement: ['task', 'priority', 'todo', 'complete'],
            habitTracking: ['habit', 'track', 'streak', 'daily'],
            learning: ['study', 'learn', 'practice', 'quiz'],
            reflection: ['reflect', 'day', 'tomorrow', 'plan']
        }
    },

    // Service endpoints
    endpoints: {
        health: '/health',
        chat: '/api/chat',
        dashboard: '/api/dashboard',
        activity: '/api/activity',
        briefing: '/api/chat/briefing',
        checkIn: '/api/chat/check-in',
        spanishStudy: '/api/chat/spanish-study'
    },

    // Test flags
    flags: {
        skipLLMTests: process.env.SKIP_LLM_TESTS === 'true',
        skipExternalAPIs: process.env.SKIP_EXTERNAL_APIS === 'true',
        verbose: process.env.TEST_VERBOSE === 'true'
    }
};

export default testConfig;
