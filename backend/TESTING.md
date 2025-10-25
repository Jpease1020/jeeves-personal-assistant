# Testing Guide

## Overview

This project uses a **high-level, integration-focused testing approach** that minimizes mocking and tests real functionality. The tests are designed to verify that your services work with real external APIs and provide meaningful feedback.

## Test Categories

### 1. Health Checks (`health-checks.test.ts`)
- **Purpose**: Verify connectivity to external services
- **What it tests**: Notion API, Supabase, Oura service initialization
- **Mocking**: None - uses real APIs
- **Run**: `npm run test:health`

### 2. API Integration Tests (`api-integration.test.ts`)
- **Purpose**: Test HTTP endpoints with real requests
- **What it tests**: All API routes, request/response handling, error cases
- **Mocking**: None - tests real Express app
- **Run**: `npm run test:integration`

### 3. Service Integration Tests (`service-integration.test.ts`)
- **Purpose**: Test service-to-service communication
- **What it tests**: Dashboard aggregation, data consistency, service failures
- **Mocking**: Minimal - uses real external APIs
- **Run**: `npm run test:integration`

### 4. LLM Response Quality Tests (`llm-response-quality.test.ts`)
- **Purpose**: Test AI response quality and structure
- **What it tests**: Response format, consistency, conversation context, error handling
- **Mocking**: None - uses real Claude API
- **Run**: `npm run test:integration`

### 5. End-to-End Workflow Tests (`e2e-workflows.test.ts`)
- **Purpose**: Test complete user workflows
- **What it tests**: Morning routine, task management, learning, evening check-in
- **Mocking**: None - tests real workflows
- **Run**: `npm run test:integration`

## Running Tests

### Quick Start
```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run specific test categories
npm run test:health      # Health checks only
npm run test:integration # All integration tests
```

### Advanced Usage
```bash
# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch

# Run specific test file
npx jest health-checks.test.ts

# Run with verbose output
npx jest --verbose
```

### Custom Test Runner
```bash
# Use the custom test runner
node scripts/test-runner.js health
node scripts/test-runner.js integration --coverage
node scripts/test-runner.js all --watch
```

## Test Environment Setup

### 1. Environment Variables
Create `.env.test` file with test credentials:
```bash
cp .env.test.example .env.test
# Edit .env.test with your test API keys
```

### 2. Required Environment Variables
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_KEY` - Supabase service role key
- `NOTION_API_KEY` - Notion integration token
- `ANTHROPIC_API_KEY` - Claude API key

### 3. Test Database
- Use a separate test database for Supabase
- Or use your main database (tests are read-only)

## What Gets Tested

### ✅ **Real External APIs**
- Notion API calls return actual data
- Supabase queries work with real database
- Claude API generates real responses

### ✅ **Real Service Integration**
- Dashboard aggregates data from all services
- Services handle failures gracefully
- Data structures are consistent

### ✅ **Real HTTP Endpoints**
- Express routes handle requests correctly
- Error handling works as expected
- Response formats are valid

### ✅ **Real AI Responses**
- Claude generates helpful responses
- Conversation context is maintained
- Response quality is consistent

### ❌ **What We Don't Mock**
- External API calls
- Database operations
- Network requests
- Environment variables

### ⚠️ **What We Mock Sparingly**
- Time-dependent operations (use fixed timestamps)
- Random ID generation (use predictable values)

## Test Philosophy

### High-Level Focus
- Tests verify **what users actually experience**
- Tests catch **real integration issues**
- Tests provide **meaningful feedback**

### Minimal Mocking
- Mock only what's necessary for test stability
- Prefer real APIs over mocked responses
- Test real error conditions

### Practical Value
- Tests catch issues before production
- Tests verify external service connectivity
- Tests ensure API contracts are maintained

## Troubleshooting

### Common Issues

1. **API Key Errors**
   - Check your `.env.test` file
   - Verify API keys are valid
   - Ensure test database exists

2. **Network Timeouts**
   - Increase timeout in `jest.config.js`
   - Check internet connectivity
   - Verify external services are accessible

3. **Test Failures**
   - Check console output for specific errors
   - Verify external services are working
   - Check environment variables

### Debug Mode
```bash
# Run with debug output
DEBUG=* npm test

# Run single test with verbose output
npx jest health-checks.test.ts --verbose
```

## Continuous Integration

### GitHub Actions Example
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm test
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}
          NOTION_API_KEY: ${{ secrets.NOTION_API_KEY }}
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
```

## Best Practices

1. **Run tests before deployment**
2. **Fix failing tests immediately**
3. **Add new tests for new features**
4. **Keep tests focused and readable**
5. **Use descriptive test names**
6. **Test real user workflows**

## Contributing

When adding new tests:
1. Follow the existing test structure
2. Use real APIs when possible
3. Add meaningful assertions
4. Include helpful console output
5. Update this documentation
