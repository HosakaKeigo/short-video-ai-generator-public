# Unit Testing with Vitest

This directory contains unit tests for the frontend application using Vitest.

## Running Tests

```bash
# Run all unit tests
npm run test

# Run tests in UI mode
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Directory Structure

```
tests/unit/
├── setup.ts          # Global test setup (mocks, etc.)
├── utils/            # Utility function tests
│   └── video.test.ts
├── components/       # Component tests (future)
└── stores/           # Store tests (future)
```

## Writing Tests

1. Create test files with `.test.ts` or `.test.tsx` extension
2. Tests will automatically be picked up by Vitest
3. Use the following imports:

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react' // for React components
```

## Mocking

Global mocks are defined in `setup.ts`. This includes:
- `URL.createObjectURL` and `URL.revokeObjectURL`
- Console methods (log, warn, error)

## Configuration

See `vitest.config.mts` in the project root for Vitest configuration.