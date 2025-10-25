/**
 * Test setup and configuration
 * Loads test environment variables and sets up global test utilities
 */

import dotenv from 'dotenv';
import path from 'path';

// Load test environment variables
dotenv.config({ path: path.join(__dirname, '../.env.test') });

// Global test utilities
declare global {
    var testUtils: {
        generateTestUserId: () => string;
        generateTestDate: () => string;
        waitFor: (ms: number) => Promise<void>;
        isCI: () => boolean;
        skipIfCI: (testName: string) => boolean;
    };
}

global.testUtils = {
    // Generate predictable test data
    generateTestUserId: () => 'test-user-123',
    generateTestDate: () => '2024-01-15',

    // Wait for async operations
    waitFor: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),

    // Check if we're in CI environment
    isCI: () => process.env.CI === 'true',

    // Skip tests that require external APIs in CI
    skipIfCI: (testName: string) => {
        if (process.env.CI === 'true') {
            console.log(`⏭️  Skipping ${testName} in CI environment`);
            return true;
        }
        return false;
    }
};

// Increase timeout for integration tests
// @ts-ignore - Jest is available at runtime
if (typeof jest !== 'undefined') {
    // @ts-ignore
    jest.setTimeout(30000);
}

// Global error handler for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
