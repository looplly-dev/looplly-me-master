# Testing Setup

This project includes comprehensive unit tests using Jest and React Testing Library.

## Running Tests

To run tests, you'll need to add these scripts to your package.json:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch", 
    "test:coverage": "jest --coverage"
  }
}
```

## Test Structure

### Authentication Tests
- **useAuth Hook Tests** (`src/hooks/__tests__/useAuth.test.ts`)
  - Tests authentication state management
  - Verifies login, registration, and OTP flows
  - Mocks Supabase client interactions

- **Login Component Tests** (`src/components/auth/__tests__/Login.test.tsx`)
  - Tests user interactions and form validation
  - Verifies proper callback handling
  - Tests error states and edge cases

### Validation Tests
- **Validation Utils Tests** (`src/utils/__tests__/validation.test.ts`)
  - Tests profile validation logic
  - Tests mobile number validation
  - Covers edge cases and error conditions

### UI Component Tests  
- **Button Component Tests** (`src/components/ui/__tests__/button.test.tsx`)
  - Tests different button variants and sizes
  - Verifies click handling and disabled states
  - Tests accessibility features

## Test Configuration

- **Jest Config** (`jest.config.js`) - Main test configuration
- **Test Setup** (`src/test-setup.ts`) - Global test setup and mocks
- **Supabase Mocking** - Comprehensive mocking of Supabase client

## Coverage

Tests cover:
- Authentication flows and state management
- Form validation and user interactions  
- UI component behavior and accessibility
- Error handling and edge cases

## Running Tests

1. Install dependencies: `npm install` or `yarn install`
2. Run tests: `npm test` or `yarn test`
3. Watch mode: `npm run test:watch`
4. Coverage report: `npm run test:coverage`