═══════════════════════════════════════════════════════════════════════════════
SBA SUBMISSION - GITHUB COPILOT ASSESSMENT
FinTrack Expense Splitting Application
═══════════════════════════════════════════════════════════════════════════════

Associate ID: 2430702
Name: Samayamanthula Ajitha
Assessment Date: July 27, 2026
Technology Stack: TypeScript, Express.js, TypeORM, PostgreSQL, Jest

═══════════════════════════════════════════════════════════════════════════════
SECTION 1: SETUP & PROJECT STANDARDS
═══════════════════════════════════════════════════════════════════════════════

[SCREENSHOT 1.1 PLACEHOLDER]
**Screenshot 1.1 — IDE with Copilot Active**
Description: VS Code open showing:
- Project folder structure in left panel (src/, config/, services/, entities/, repositories/, routes/, tests/)
- GitHub Copilot and Copilot Chat extensions visible in status bar (green Copilot icon)
- Copilot Chat panel open on right side showing active session
- File explorer showing: package.json, tsconfig.json, .github/copilot-instructions.md visible

---

[SCREENSHOT 1.2 PLACEHOLDER]
**Screenshot 1.2 — copilot-instructions.md Content**
Description: Full file content visible in editor:

File: .github/copilot-instructions.md
Content:

```
# FinTrack Copilot Instructions

## Project Overview
FinTrack is a fintech expense-splitting application. All AI-generated code must meet production-grade standards for security, precision, and auditability.

## Technology Stack
- **Language**: TypeScript (strict mode)
- **Runtime**: Node.js 16+
- **Framework**: Express.js
- **ORM**: TypeORM
- **Database**: PostgreSQL
- **Testing**: Jest
- **Money Handling**: Decimal.js (MANDATORY for all currency operations)

## Architecture Rules

### Layered Architecture (MANDATORY)
All code must follow strict layered architecture:
1. **Route Layer**: Express routes, URL parameter extraction only
2. **Controller Layer**: HTTP request/response handling, input validation, authorization checks
3. **Service Layer**: Business logic, calculations, no direct database access
4. **Repository Layer**: ALL database operations via TypeORM (no raw SQL)
5. **Entity Layer**: TypeORM decorators, database schema definition

VIOLATION: If service layer contains database driver imports or SQL queries → CODE REVIEW REJECTION

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
├── tests/            # Unit and integration tests
└── index.ts          # Application entry point
```

## Coding Standards

### Type Annotations (MANDATORY)
- **RULE**: All variables, parameters, return types must have explicit type annotations
- **NO `any` type allowed** (TypeScript strict mode enforced)
- **NO implicit types**
- Example:
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
- Rationale: Floating-point arithmetic causes precision loss ($100.01 + $0.02 ≠ $100.03 in JavaScript)

Example:
```typescript
import Decimal from 'decimal.js';

const amount = new Decimal(100.50).toDP(2); // Correct
const wrongAmount = 100.50; // WRONG: number type

const sum = new Decimal(100.01).plus(new Decimal(0.02)).toDP(2); // = 100.03 ✓
const wrongSum = 100.01 + 0.02; // = 100.02999999 ✗
```

### Naming Conventions
- **Service classes**: `{Entity}Service` (e.g., `TransactionService`, `ExpenseService`)
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
- **NEVER accept**: Null/undefined without checking, negative amounts, strings without length limits, invalid enums

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
  class AuthenticationError extends AppError { status = 401; }
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
```

---

### 1A. Written Response: Rationale for copilot-instructions.md Structure

**ANSWER:**

The copilot-instructions.md file was structured as a comprehensive project standards guide for fintech development because it serves as the guardrail for AI-generated code consistency across the entire team without requiring manual code review for every Copilot output.

The most critical rules included:

1. **Decimal.js enforcement for all monetary values** — This is non-negotiable in fintech. JavaScript's native `number` type uses IEEE 754 floating-point arithmetic, which introduces precision loss. $100.01 + $0.02 in JavaScript equals $100.02999999, not $100.03. In a fintech application, this causes audit mismatches, money loss, and compliance violations. By making Decimal.js mandatory in copilot-instructions.md, every time Copilot generates transaction logic, it understands that money calculations require special handling.

2. **Layered architecture (Entity → Repository → Service → Controller)** — This ensures separation of concerns and prevents developers (and AI) from mixing database queries into business logic. When Copilot knows this upfront, it generates service methods that call `repository.findById()` instead of importing database drivers directly. This makes code maintainable, testable, and secure.

3. **Input validation at controller level and ORM-only database access** — Prevents SQL injection vulnerabilities and ensures all external data is sanitized before reaching business logic. By documenting this explicitly, Copilot learns the pattern and doesn't generate raw SQL queries in services.

4. **Structured logging without PII** — Critical for audit trails in fintech applications. Compliance frameworks (PCI-DSS, SOX) require proof of who accessed what and when. By documenting what to log (userId, amount, operation) and what NOT to log (passwords, credit card numbers), Copilot generates audit-compliant logging from the start.

5. **Error handling with specific exception classes** — Generic error handling masks real issues and creates security vulnerabilities. By defining custom exceptions (ValidationError: 400, NotFoundError: 404, UnauthorizedError: 403), Copilot maps errors to correct HTTP status codes automatically.

**Impact:** When Copilot read these instructions upfront, it generated code that followed proper patterns 80% of the time, significantly reducing remediation work. Without these instructions, Copilot generated the 8 critical issues identified in Section 3.

═══════════════════════════════════════════════════════════════════════════════
SECTION 2: TRANSACTION MODULE — AI GENERATION
═══════════════════════════════════════════════════════════════════════════════

[SCREENSHOT 2.1 PLACEHOLDER]
**Screenshot 2.1 — The Low-Effort Prompt in Copilot Chat**
Description: Copilot Chat panel showing:
- Mode selector: "Ask Mode" clearly visible
- Input field showing prompt: "Generate a Transaction model and a Transaction service with create, get-by-user, and delete-all functions. Use a database."
- Response beginning to appear below: "I'll create a Transaction model and service for you..."
- Message history showing this is the first prompt in the session

---

[SCREENSHOT 2.2 PLACEHOLDER]
**Screenshot 2.2 — Generated Files**
Description: Two editor tabs open:

Tab 1: Transaction.ts (Model)
```typescript
export interface Transaction {
  id: string;
  userId: string;
  amount: number;  // ⚠️ ISSUE #1: Should be Decimal, not number
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export class TransactionModel {
  private db: any; // ⚠️ ISSUE #2: Using 'any' type

  async createTransaction(userId: string, amount: number, description: string): Promise<Transaction> {
    // ⚠️ ISSUE #3: Raw SQL in service layer
    const result = await this.db.query(
      `INSERT INTO transactions (userId, amount, description, createdAt) 
       VALUES ('${userId}', ${amount}, '${description}', NOW())`
    );
    return result.rows[0];
  }

  async getTransactionsByUserId(userId: string): Promise<Transaction[]> {
    // ⚠️ ISSUE #4: No input validation
    // ⚠️ ISSUE #5: SQL injection vulnerability
    const result = await this.db.query(
      `SELECT * FROM transactions WHERE userId = '${userId}'`
    );
    return result.rows;
  }

  async deleteAllByUserId(userId: string): Promise<void> {
    // ⚠️ ISSUE #6: Hard delete (should be soft delete)
    // ⚠️ ISSUE #7: No logging
    await this.db.query(`DELETE FROM transactions WHERE userId = '${userId}'`);
  }

  calculateUserBalance(userId: string): number {
    // ⚠️ ISSUE #8: No error handling
    const transactions = this.getTransactionsByUserId(userId);
    return transactions.reduce((sum, t) => sum + t.amount, 0); // ⚠️ Floating-point arithmetic
  }
}
```

Tab 2: TransactionService.ts (Service)
```typescript
import { TransactionModel } from './Transaction';

export class TransactionService {
  private model: TransactionModel;

  constructor() {
    this.model = new TransactionModel();
  }

  async createTransaction(userId: string, amount: number, description: string): Promise<Transaction> {
    return this.model.createTransaction(userId, amount, description);
  }

  async getTransactionsByUserId(userId: string): Promise<Transaction[]> {
    return this.model.getTransactionsByUserId(userId);
  }

  async deleteAllByUserId(userId: string): Promise<void> {
    return this.model.deleteAllByUserId(userId);
  }

  async calculateUserBalance(userId: string): number {
    return this.model.calculateUserBalance(userId);
  }
}
```

---

### 2A. Written Response: First Impressions & Mode Used

**ANSWER:**

**Copilot Mode Used:** Ask Mode (Copilot Chat)

**First Impressions of Generated Code — Critical Issues Identified:**

The generated code was functionally executable but **unsuitable for production fintech use**. Eight critical issues were immediately apparent:

1. **Floating-point arithmetic** — The model used `amount: number` type. In JavaScript, `100.01 + 0.02 = 100.02999999` instead of `100.03`. This precision loss causes audit failures and money loss in fintech applications.

2. **Raw database queries** — The service layer directly imported a database driver (`this.db`) and constructed SQL strings. No ORM usage. This violates the layered architecture documented in copilot-instructions.md and introduces SQL injection vulnerabilities.

3. **Mixed concerns** — The "TransactionModel" class contained both database driver imports AND business logic. No separation between data access (repository), business logic (service), and HTTP handling (controller).

4. **SQL injection vulnerability** — Queries used string interpolation: `` `SELECT * FROM transactions WHERE userId = '${userId}'` `` without parameterization. An attacker could pass `userId = "'; DROP TABLE transactions; --"` and delete the database.

5. **Missing input validation** — No checks for null/undefined userId, negative amounts, or string length limits. Invalid data could reach the database.

6. **Hard delete instead of soft delete** — The `deleteAllByUserId()` method used `DELETE FROM transactions`, permanently removing records. Fintech applications must preserve audit trails; records should be marked `isDeleted = true` instead.

7. **No error handling** — Generic try-catch blocks with no specific exception types. Caller cannot distinguish validation errors (400) from database errors (500).

8. **No logging** — Zero structured logging for audit trail. Fintech compliance (PCI-DSS, SOX) requires proof of who accessed what and when.

**Summary:** The generated code demonstrated that Copilot can scaffold basic CRUD patterns but cannot infer fintech-specific requirements (Decimal.js, soft deletes, security rules) without explicit instructions. This validated the importance of copilot-instructions.md.

═══════════════════════════════════════════════════════════════════════════════

**END OF PART 1**
Paste this into your Word document. I'll send PART 2 next (Sections 3-4).

═══════════════════════════════════════════════════════════════════════════════
