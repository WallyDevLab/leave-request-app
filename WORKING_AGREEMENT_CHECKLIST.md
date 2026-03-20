# Working Agreement Compliance Checklist

This checklist ensures code meets the Wally × Claude Working Agreement standards. Review before committing any code.

## Critical (Must Fix)

### Immutability
- [ ] All functions return new objects instead of mutating existing ones
- [ ] No direct property assignments on function parameters
- [ ] Arrays use spread operator or immutable methods (map, filter, reduce)
- [ ] Objects use spread operator or Object.assign for updates
- [ ] `Readonly<T>` used for parameters that shouldn't be mutated

### Input Validation
- [ ] All user inputs validated with Zod schemas at system boundaries
- [ ] API endpoints validate request bodies before processing
- [ ] Form submissions validated on both client and server
- [ ] External API responses validated before use
- [ ] File uploads validated (type, size, content)

### Security (CRITICAL)
- [ ] No hardcoded secrets, API keys, or passwords in code
- [ ] All environment variables loaded via config module
- [ ] SQL queries use parameterized statements only
- [ ] User content sanitized before rendering HTML
- [ ] Authentication verified on all protected routes
- [ ] Authorization checked before sensitive operations
- [ ] Error messages don't expose sensitive data or stack traces

### Error Handling
- [ ] All async functions have try/catch blocks
- [ ] Errors logged with proper context (not console.log)
- [ ] User facing errors are friendly and actionable
- [ ] Server errors logged with full details
- [ ] Unknown errors handled with `unknown` type, then narrowed

## High Priority (Fix When Practical)

### TypeScript Types
- [ ] Explicit return types on all exported functions
- [ ] Explicit types on public class methods
- [ ] No `any` types (use `unknown` instead)
- [ ] Interfaces for extendable object shapes
- [ ] Types for unions, intersections, mapped types
- [ ] String literal unions instead of enums

### File Organization
- [ ] Files under 800 lines (200-400 typical)
- [ ] High cohesion: related code together
- [ ] Low coupling: minimal dependencies
- [ ] Organized by feature/domain, not file type
- [ ] Utilities extracted from large modules

### API Design
- [ ] Consistent response format (ApiResponse envelope)
- [ ] RESTful resource naming (plural, kebab-case)
- [ ] Query parameters for filtering, sorting, pagination
- [ ] Correct HTTP status codes
- [ ] Sub-resources for relationships

### Logging
- [ ] No console.log in production code
- [ ] Winston logger used for all logging
- [ ] Appropriate log levels (error, warn, info, debug)
- [ ] Structured logging with context objects
- [ ] No sensitive data in logs

## Medium Priority (Nice to Have)

### Testing
- [ ] TDD approach: test written first, then implementation
- [ ] 80%+ code coverage
- [ ] Unit tests for functions and utilities
- [ ] Integration tests for API endpoints
- [ ] E2E tests for critical user flows
- [ ] Tests use Arrange-Act-Assert structure
- [ ] No tests depending on execution order
- [ ] Edge cases tested (null, undefined, empty, large inputs)

### Code Quality
- [ ] Functions do one thing well
- [ ] Descriptive variable and function names
- [ ] Magic numbers extracted to named constants
- [ ] Complex conditions extracted to named functions
- [ ] Code is self-documenting with minimal comments
- [ ] Comments explain "why", not "what"

### Performance
- [ ] No N+1 query patterns
- [ ] Batch fetching for related data
- [ ] Caching for expensive operations
- [ ] Database queries use appropriate indexes
- [ ] Large lists paginated
- [ ] Expensive computations memoized

### Git Commits
- [ ] Conventional commit format used
- [ ] Commit message explains "why", not just "what"
- [ ] One concern per commit
- [ ] PR includes full diff analysis
- [ ] PR includes test plan

## UI Specific (For Frontend Code)

### Design
- [ ] 60/30/10 color rule applied
- [ ] Consistent spacing and typography
- [ ] Generous whitespace
- [ ] Interactive elements look interactive
- [ ] Contrast ratios meet accessibility standards
- [ ] Loading states for async operations
- [ ] Error states with recovery options

### React Patterns
- [ ] Functional components with hooks
- [ ] Props validated with TypeScript
- [ ] No prop drilling (use context or composition)
- [ ] useCallback for event handlers passed to children
- [ ] useMemo for expensive computations
- [ ] Keys on list items are stable and unique

## Review Checklist

Before submitting code for review:

1. **Self-review**: Read through all changes as if you're reviewing someone else's code
2. **Run tests**: `npm test` passes with 80%+ coverage
3. **Lint**: `npm run lint` passes with no errors
4. **Build**: `npm run build` succeeds
5. **Manual test**: Verify the feature works in the browser
6. **Simplify**: Remove any unnecessary code or complexity
7. **Document**: Update README if public APIs changed

## Quick Reference

### Good Patterns
```typescript
// Immutable update
const updated = { ...original, field: newValue }

// Validation at boundary
const validated = schema.parse(input)

// Proper error handling
try {
  const result = await operation()
  return createSuccessResponse(result)
} catch (error) {
  log.error("Operation failed", { error: getErrorMessage(error) })
  return createErrorResponse(getErrorMessage(error))
}

// Explicit types
export function transform(data: InputType): OutputType {
  // implementation
}
```

### Anti-Patterns to Avoid
```typescript
// ❌ Mutation
user.name = "New Name"

// ❌ Any type
function process(data: any) {}

// ❌ Console.log
console.log("Debug info")

// ❌ Unhandled promise
fetch(url) // missing .catch()

// ❌ Hardcoded secret
const key = "sk-proj-abc123"
```

---

Use this checklist during code review and before committing. The goal is to catch issues early and maintain consistent quality across the codebase.
