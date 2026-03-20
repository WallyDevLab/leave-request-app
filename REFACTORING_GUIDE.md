# Working Agreement Refactoring Guide

This document explains the refactoring performed to align the MTN Leave Tracker with the Wally × Claude Working Agreement.

## Overview

The codebase has been refactored to follow enterprise-level best practices:
- ✅ Schema-based input validation (Zod)
- ✅ Proper logging (Winston)
- ✅ Immutable data operations
- ✅ Explicit error handling
- ✅ Type safety improvements
- ✅ Configuration management
- ✅ Test infrastructure (Vitest)
- ✅ Consistent API response format

## New File Structure

```
lib/
├── validation.ts           # Zod schemas for input validation
├── logger.ts              # Winston logger (replaces console.log)
├── config.ts              # Environment variable management
├── api-response.ts        # Consistent API response format
├── actions-refactored.ts  # Refactored actions with proper validation
├── sanitize.ts            # Input sanitization (legacy, now using Zod)
├── email.ts               # Email service
├── types.ts               # TypeScript types
├── auth.ts                # Authentication
└── __tests__/             # Test files
    └── validation.test.ts # Example validation tests

```

## Key Changes

### 1. Input Validation with Zod

**Before:**
```typescript
// Manual validation and sanitization
const sanitized = sanitizeText(input)
if (!sanitized) throw new Error("Invalid input")
```

**After:**
```typescript
// Schema-based validation at system boundary
import { LeaveRequestSubmissionSchema } from "./validation"

const validated = LeaveRequestSubmissionSchema.parse(rawData)
// TypeScript now knows the exact shape and all fields are validated
```

**Benefits:**
- Type-safe validation
- Clear error messages
- Automatic type inference
- Single source of truth for validation rules

### 2. Proper Logging

**Before:**
```typescript
console.log("Debug info")  // Bad: no structure, not production-ready
console.error("Error:", error)  // Bad: loses context
```

**After:**
```typescript
import { log } from "./logger"

log.info("Leave request submitted", { requestId, email })
log.error("Failed to send email", { 
  requestId, 
  error: getErrorMessage(error) 
})
```

**Benefits:**
- Structured logging with context
- Different log levels (debug, info, warn, error)
- File-based logging in production
- No console.log in production code

### 3. Immutable Data Operations

**Before:**
```typescript
function updateRequest(request: LeaveRequest, status: string) {
  request.status = status  // BAD: mutates input
  return request
}
```

**After:**
```typescript
function updateRequest(
  request: Readonly<LeaveRequest>, 
  status: string
): LeaveRequest {
  return { ...request, status }  // GOOD: creates new object
}
```

**Benefits:**
- Prevents hidden side effects
- Easier debugging
- Safer for concurrent operations
- TypeScript enforces immutability

### 4. Consistent API Response Format

**Before:**
```typescript
// Inconsistent return types
return newRequest  // Sometimes just data
throw new Error("Failed")  // Sometimes throws
```

**After:**
```typescript
import { createSuccessResponse, createErrorResponse } from "./api-response"

// Success case
return createSuccessResponse(newRequest)

// Error case
return createErrorResponse("Validation failed")
```

**Benefits:**
- Predictable response shape
- Easier error handling on frontend
- Consistent timestamp in all responses
- Type-safe success/error handling

### 5. Configuration Management

**Before:**
```typescript
const apiKey = process.env.API_KEY  // No validation
// Might be undefined at runtime!
```

**After:**
```typescript
import { config } from "./config"

const apiKey = config.resendApiKey  // Type-safe, validated at startup
```

**Benefits:**
- Fail fast if required config missing
- Type-safe access to config
- Clear error messages for missing variables
- Production vs development validation

### 6. Error Handling

**Before:**
```typescript
try {
  await operation()
} catch (error) {
  // Error swallowed or logged poorly
}
```

**After:**
```typescript
try {
  const result = await operation()
  return createSuccessResponse(result)
} catch (error) {
  log.error("Operation failed", { error: getErrorMessage(error) })
  return createErrorResponse(getErrorMessage(error))
}
```

**Benefits:**
- All errors logged with context
- Unknown errors handled properly
- User-friendly error messages
- Detailed server-side logging

## Migration Steps

### For Existing Code

1. **Update imports:**
   ```typescript
   // Old
   import { submitLeaveRequest } from "@/lib/actions"
   
   // New
   import { submitLeaveRequest } from "@/lib/actions-refactored"
   ```

2. **Handle API responses:**
   ```typescript
   // Old
   const request = await submitLeaveRequest(data)
   
   // New
   const response = await submitLeaveRequest(data)
   if (response.success) {
     const request = response.data
     // Handle success
   } else {
     // Handle error: response.error
   }
   ```

3. **Replace console.log:**
   ```typescript
   // Old
   console.log("Debug info")
   
   // New
   import { log } from "@/lib/logger"
   log.debug("Debug info", { context })
   ```

### For New Features

1. **Define Zod schema first:**
   ```typescript
   // In lib/validation.ts
   export const MyFeatureSchema = z.object({
     field: z.string().min(1),
     // ...
   })
   ```

2. **Validate at system boundaries:**
   ```typescript
   export async function myAction(rawData: unknown) {
     const validated = MyFeatureSchema.parse(rawData)
     // Now type-safe!
   }
   ```

3. **Use immutable operations:**
   ```typescript
   // Update array
   const newArray = [...oldArray, newItem]
   
   // Update object
   const newObject = { ...oldObject, field: newValue }
   
   // Update nested
   const updated = {
     ...original,
     nested: { ...original.nested, field: newValue }
   }
   ```

4. **Return consistent responses:**
   ```typescript
   try {
     const result = await doWork()
     return createSuccessResponse(result)
   } catch (error) {
     log.error("Work failed", { error: getErrorMessage(error) })
     return createErrorResponse(getErrorMessage(error))
   }
   ```

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm test -- --coverage
```

### Writing Tests

Follow the Arrange-Act-Assert pattern:

```typescript
import { describe, it, expect } from "vitest"

describe("MyFeature", () => {
  it("should do something correctly", () => {
    // Arrange: Set up test data
    const input = { field: "value" }
    
    // Act: Execute the function
    const result = myFunction(input)
    
    // Assert: Verify the result
    expect(result).toBe(expected)
  })
})
```

## Security Improvements

### 1. No Hardcoded Secrets

**Before:**
```typescript
const apiKey = "sk-proj-abc123"  // BAD
```

**After:**
```typescript
import { config } from "./config"
const apiKey = config.resendApiKey
if (!apiKey) {
  throw new Error("RESEND_API_KEY not configured")
}
```

### 2. Input Validation

All user inputs are now validated with Zod schemas before processing:
- Email format validation
- String length limits
- Type checking
- Custom business rules

### 3. Error Message Safety

Errors don't expose sensitive information:
```typescript
// User sees: "An error occurred"
// Server logs: Full error with stack trace and context
```

## Common Patterns

### Pattern 1: Create API Action

```typescript
export async function myAction(rawData: unknown): Promise<ApiResponse<Result>> {
  try {
    // 1. Validate input
    const validated = MySchema.parse(rawData)
    
    // 2. Business logic (immutable)
    const result = performWork(validated)
    
    // 3. Log success
    log.info("Action succeeded", { id: result.id })
    
    // 4. Return success response
    return createSuccessResponse(result)
  } catch (error) {
    // 5. Log error with context
    log.error("Action failed", { error: getErrorMessage(error) })
    
    // 6. Return error response
    return createErrorResponse(getErrorMessage(error))
  }
}
```

### Pattern 2: Update State Immutably

```typescript
// Update array item
const updated = items.map(item => 
  item.id === targetId 
    ? { ...item, field: newValue }
    : item
)

// Filter array
const filtered = items.filter(item => item.active)

// Add to array
const withNew = [...items, newItem]
```

### Pattern 3: Handle Async Operations

```typescript
// Good
const result = await operation().catch(error => {
  log.error("Operation failed", { error: getErrorMessage(error) })
  throw error
})

// Also good
try {
  const result = await operation()
} catch (error) {
  log.error("Operation failed", { error: getErrorMessage(error) })
  // Handle or rethrow
}
```

## Checklist for New Code

Before committing, verify:

- [ ] Input validation with Zod schemas
- [ ] Winston logger instead of console.log
- [ ] Immutable data operations
- [ ] Explicit error handling with try/catch
- [ ] Consistent API response format
- [ ] Proper TypeScript types
- [ ] Tests written (TDD approach)
- [ ] No hardcoded secrets
- [ ] Configuration via config module

See `WORKING_AGREEMENT_CHECKLIST.md` for complete checklist.

## Benefits Summary

| Aspect | Before | After |
|--------|--------|-------|
| **Validation** | Manual checks | Zod schemas |
| **Logging** | console.log | Winston logger |
| **Data updates** | Mutations | Immutable |
| **Errors** | Inconsistent | Structured |
| **Types** | Some any | Fully typed |
| **Config** | Direct env access | Validated config |
| **Tests** | None | Vitest setup |
| **API responses** | Mixed | Consistent |

## Next Steps

1. **Migrate remaining components** to use refactored actions
2. **Add more tests** to reach 80%+ coverage
3. **Set up production database** (replace mock data)
4. **Configure email service** (Resend or SendGrid)
5. **Add authentication** (NextAuth.js or similar)
6. **Implement rate limiting** on API routes
7. **Add E2E tests** with Playwright

## Questions?

Review these documents:
- `WORKING_AGREEMENT_CHECKLIST.md` - Code quality checklist
- `lib/validation.ts` - Input validation examples
- `lib/__tests__/validation.test.ts` - Testing examples
- Working agreement document - Full standards reference

---

The refactoring maintains all existing functionality while significantly improving code quality, type safety, and maintainability according to enterprise best practices.
