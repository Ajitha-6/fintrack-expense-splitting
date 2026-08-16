# FinTrack Copilot Instructions

## Project Overview

FinTrack is a fintech expense-splitting and transaction management API. All AI-generated code must meet production-grade standards for security, precision, and auditability.

## Technology Stack

- **Language**: TypeScript (strict mode required)
- **Runtime**: Node.js 16+
- **Framework**: Express.js 4.18+
- **ORM**: TypeORM 0.3+
- **Database**: PostgreSQL 12+
- **Testing**: Jest 29+
- **Money Handling**: Decimal.js 10+ (MANDATORY)
- **Logging**: Winston 3+

## Architecture Rules

### Layered Architecture (MANDATORY)

All code must follow strict layered architecture:

1. **Route Layer**: Express routes, URL parameter extraction only
2. **Controller Layer**: HTTP request/response handling, input validation, authorization checks
3. **Service Layer**: Business logic, calculations, NO database access
4. **Repository Layer**: ALL database operations via TypeORM (NO raw SQL)
5. **Entity Layer**: TypeORM decorators, database schema definition

**VIOLATION**: If service layer contains database imports or SQL queries → CODE REVIEW REJECTION

### Directory Structure

```
src/
├── config/           # Database, logger configuration
├── controllers/      # HTTP handlers (one per resource)
├── entities/         # TypeORM entity definitions
├── repositories/     # Data access layer
├── services/         # Business logic only
├── routes/           # Express route definitions
├── utils/            # Validators, helpers
├── errors/           # Custom exception classes
└── index.ts          # Application entry point
```

## Coding Standards

### Type Annotations (MANDATORY)

- **RULE**: All variables, parameters, return types must have explicit type annotations
- **NO `any` type allowed** (TypeScript strict mode enforced)
- **NO implicit types**

Example:
```typescript
// ✓ CORRECT
async createTransaction(userId: string, amount: Decimal): Promise<Transaction>

// ✗ WRONG
async createTransaction(userId, amount) // implicit any
```

### Money Handling (CRITICAL FOR FINTECH)

- **RULE**: ALL monetary values must use Decimal.js
- **NEVER use `number` type for currency**
- **MANDATORY**: Use `.toDP(2)` for all amounts (2 decimal places)
- **MANDATORY**: Database stores amounts as `numeric(12,2)` in PostgreSQL
- **MANDATORY**: Service layer converts DB string → Decimal → calculation → rounded result
- **Rationale**: Floating-point arithmetic causes precision loss ($100.01 + $0.02 ≠ $100.03 in JavaScript)

Example:
```typescript
import Decimal from 'decimal.js';

const amount = new Decimal(100.50).toDP(2); // Correct
const wrongAmount = 100.50; // WRONG: number type

const sum = new Decimal(100.01).plus(new Decimal(0.02)).toDP(2); // = 100.03 ✓
const wrongSum = 100.01 + 0.02; // = 100.02999999 ✗
```

### Naming Conventions

- **Service classes**: `{Entity}Service` (e.g., `TransactionService`)
- **Repository classes**: `{Entity}Repository` (e.g., `TransactionRepository`)
- **Controller classes**: `{Entity}Controller` (e.g., `TransactionController`)
- **Entity/Model files**: PascalCase (e.g., `Transaction.ts`, `SharedExpense.ts`)
- **Database tables**: snake_case (e.g., `transactions`, `shared_expenses`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_AMOUNT = 1000000`)
- **Functions/Methods**: camelCase (e.g., `calculateBalance()`, `getTransactionById()`)

### Input Validation (MANDATORY)

- **WHERE**: Every controller endpoint
- **WHEN**: First line of handler, before passing to service
- **WHAT**: All external inputs (query params, body, path params, headers)
- **HOW**: Use specific validation functions, throw ValidationError
- **NEVER accept**: Null/undefined without checking, negative amounts, strings without length limits

Example:
```typescript
// Controller
router.post('/transactions', (req, res) => {
  const { amount, description } = req.body;
  
  // Validate
  if (!amount || amount <= 0 || amount > 1000000) {
    throw new ValidationError('Amount must be 0.01 to 1,000,000');
  }
  if (!description || description.length === 0 || description.length > 255) {
    throw new ValidationError('Description required, max 255 chars');
  }
  
  // THEN call service
  const transaction = transactionService.createTransaction(userId, amount, description);
});
```

### Error Handling (MANDATORY)

- **RULE**: Create specific exception classes, NEVER generic Error
- **Custom Exceptions**:
  ```typescript
  class ValidationError extends AppError { status = 400; }
  class NotFoundError extends AppError { status = 404; }
  class UnauthorizedError extends AppError { status = 403; }
  class SettlementError extends AppError { status = 400; }
  ```
- **RULE**: Service methods throw specific exceptions
- **RULE**: Controller/middleware catches and maps to HTTP status code
- **NEVER log stack traces to client**: Internal errors only logged on server

### Logging (MANDATORY FOR FINTECH AUDIT TRAIL)

- **RULE**: Use Winston logger, structured format
- **RULE**: Log at service entry point: operation type, user, amount, timestamp
- **RULE**: Log at repository level: query type, record count affected
- **NEVER log**: Passwords, full credit card numbers, API keys, PII (emails, phone numbers)
- **Format**: `{ timestamp, level, service, userId, operation, amount, status, error }`

Example:
```typescript
logger.info('Transaction created', {
  service: 'TransactionService',
  userId: user.id,
  amount: transaction.amount.toString(),
  transactionId: transaction.id,
  timestamp: new Date().toISOString(),
});

logger.error('Transaction creation failed', {
  userId: user.id,
  error: error.message, // NOT full stack trace
  statusCode: 400,
});
```

### Database Access (MANDATORY)

- **RULE**: ALL database queries through TypeORM ORM
- **RULE**: NO raw SQL strings (prevents SQL injection)
- **RULE**: Repository layer only, never in Service
- **RULE**: Use TypeORM query builder for complex queries
- **RULE**: Soft deletes: mark `isDeleted = true`, `deletedAt = NOW()` (never hard delete)
- **RULE**: All SELECT queries must filter `WHERE isDeleted = false` by default

Example:
```typescript
// ✓ CORRECT
const transaction = await transactionRepository.findOne({
  where: { id, isDeleted: false },
  relations: ['user'],
});

// ✗ WRONG
const transaction = await db.query(`SELECT * FROM transactions WHERE id = '${id}'`);
```

### Authorization (MANDATORY)

- **RULE**: Check ownership before returning user data
- **RULE**: Controller verifies `req.userId === resource.userId`
- **RULE**: Reject with 403 Forbidden if mismatch
- **RULE**: Log authorization failures for security audit

Example:
```typescript
// Controller
async getTransaction(req: Request, res: Response) {
  const transaction = await transactionService.getTransactionById(req.params.id);
  
  // AUTHORIZATION CHECK
  if (req.userId !== transaction.userId) {
    throw new UnauthorizedError('Cannot access transaction');
  }
  
  res.json({ success: true, data: transaction });
}
```

## Security Rules

### SQL Injection Prevention

- **RULE**: NEVER concatenate user input into SQL strings
- **RULE**: Use TypeORM parameterized queries exclusively
- **RULE**: Validate input types and lengths at controller

### Authentication & Authorization

- **RULE**: All endpoints require `x-user-id` header
- **RULE**: Verify user owns resource before granting access
- **RULE**: Log all access attempts and authorization failures
- **RULE**: Return 401 for auth failure, 403 for authorization failure

### Data Privacy

- **RULE**: Never log full credit card numbers, SSNs, passwords
- **RULE**: Use encryption for sensitive fields (if added in future)
- **RULE**: Soft delete user data when requested (GDPR compliance)

### Fintech-Specific

- **RULE**: All money calculations use Decimal.js
- **RULE**: All money calculations rounded to 2 decimals
- **RULE**: All money operations logged for audit trail
- **RULE**: Verify balance calculations sum to 100% (no money disappears)

## Testing Expectations

### Unit Tests (Jest)

- **RULE**: Service layer 100% coverage (critical business logic)
- **RULE**: Controller layer 80%+ coverage
- **RULE**: Mock external dependencies (repositories, external APIs)
- **RULE**: Test happy path, edge cases, error scenarios

Test Structure:
```typescript
describe('TransactionService', () => {
  describe('createTransaction', () => {
    it('should create valid transaction', async () => { /* test */ });
    it('should reject negative amount', async () => { /* test */ });
    it('should reject missing description', async () => { /* test */ });
  });
});
```

### Integration Tests

- **RULE**: Test full request → response cycle
- **RULE**: Use real database or in-memory SQLite
- **RULE**: Test authorization checks
- **RULE**: Test error scenarios (404, 400, 403)

### Coverage Thresholds

- Statements: 70%+ required
- Branches: 70%+ required
- Functions: 70%+ required
- Lines: 70%+ required

## Git Commit Standards

Commit messages must follow convention:
```
[Feature/Fix/Refactor] Brief description

- Detail 1
- Detail 2
```

Example:
```
[Feature] Add Transaction soft delete support

- Implement isDeleted flag on Transaction entity
- Update all repository queries to filter isDeleted = false
- Add test coverage for soft delete logic
```

## Copilot Chat Best Practices

### DO

- Use Ask Mode for design questions: "How should I structure the balance calculation?"
- Use Edit Mode for targeted fixes: "Fix the Decimal.js rounding here"
- Use Agent Mode for multi-file scaffolding: "Create Entity, Repository, Service, Controller"
- Provide explicit constraints: "Use Decimal.js for all amounts"
- Reference existing patterns: "Follow the same pattern as TransactionService"
- Use @workspace for context: Show Copilot how to maintain consistency
- Use #file to reference existing implementations

### DON'T

- Accept generated code without reviewing for money precision
- Accept code without authorization checks
- Accept service layer code with database imports
- Accept error handling with generic Error class
- Merge generated code without running tests
- Ignore Copilot's own warnings about best practices

## Code Review Checklist (Before Accepting Generated Code)

- ✓ All type annotations present (no implicit any)
- ✓ Decimal.js used for all money (never number type)
- ✓ Layered architecture respected (no Service→DB shortcuts)
- ✓ Input validation at controller level
- ✓ Specific exception classes used
- ✓ Soft deletes implemented (not hard deletes)
- ✓ Authorization checks present (resource ownership verified)
- ✓ Logging includes context (userId, amount, operation)
- ✓ No hardcoded secrets or PII
- ✓ Tests cover happy path + edge cases + errors

## Summary

This instruction set ensures that GitHub Copilot generates code that is:

1. **Secure** — No SQL injection, proper authorization
2. **Precise** — Decimal.js for money, exact calculations
3. **Auditable** — Structured logging, soft deletes, clear error handling
4. **Maintainable** — Layered architecture, consistent naming, specific exceptions
5. **Production-Ready** — Test coverage, type safety, business logic isolated

When in doubt, refer back to these rules and require Copilot to explain how its output follows these standards.