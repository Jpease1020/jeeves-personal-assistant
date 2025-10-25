module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/src'],
    testMatch: [
        '**/__tests__/**/*.ts',
        '**/?(*.)+(spec|test).ts'
    ],
    transform: {
        '^.+\\.ts$': ['ts-jest', {
            useESM: false
        }],
    },
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/**/*.d.ts',
        '!src/**/index.ts'
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],
    setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
    testTimeout: 30000, // 30 seconds for integration tests
    verbose: true,
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node']
};
