#!/usr/bin/env node

/**
 * Test Runner Script
 * Provides different test execution modes for different scenarios
 */

const { spawn } = require('child_process');
const path = require('path');

const testTypes = {
    health: 'Health checks for external services',
    integration: 'API endpoint integration tests',
    services: 'Service integration tests',
    llm: 'LLM response quality tests',
    e2e: 'End-to-end workflow tests',
    all: 'All tests'
};

function runTests(testType = 'all', options = {}) {
    const args = ['jest'];

    if (testType !== 'all') {
        args.push(`--testPathPattern=${testType}`);
    }

    if (options.watch) {
        args.push('--watch');
    }

    if (options.coverage) {
        args.push('--coverage');
    }

    if (options.verbose) {
        args.push('--verbose');
    }

    console.log(`🧪 Running ${testTypes[testType]}...`);
    console.log(`📝 Command: npx ${args.join(' ')}`);

    const jest = spawn('npx', args, {
        stdio: 'inherit',
        cwd: path.join(__dirname, '..')
    });

    jest.on('close', (code) => {
        if (code === 0) {
            console.log(`✅ ${testTypes[testType]} completed successfully`);
        } else {
            console.log(`❌ ${testTypes[testType]} failed with code ${code}`);
            process.exit(code);
        }
    });
}

// Parse command line arguments
const args = process.argv.slice(2);
const testType = args[0] || 'all';
const options = {
    watch: args.includes('--watch'),
    coverage: args.includes('--coverage'),
    verbose: args.includes('--verbose')
};

// Validate test type
if (!testTypes[testType]) {
    console.error(`❌ Invalid test type: ${testType}`);
    console.error(`Available types: ${Object.keys(testTypes).join(', ')}`);
    process.exit(1);
}

// Run tests
runTests(testType, options);
