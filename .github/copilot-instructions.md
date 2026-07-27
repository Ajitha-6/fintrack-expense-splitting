# FinTrack Expense Splitting - Copilot Instructions

## Technology Stack Declaration
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: PostgreSQL (v13+)
- **ORM**: TypeORM
- **Language**: TypeScript
- **Testing**: Jest + Supertest
- **Package Manager**: npm

## Architecture Conventions

### Layered Architecture Pattern
1. **Controller Layer**: HTTP route handlers - Input validation, request/response formatting
2. **Service Layer**: Business logic - Transaction processing, calculations, validations
3. **Repository Layer**: Data access - Database queries using TypeORM only
4. **Model Layer**: Entity definitions - Database schema and types

### File Organization
```
src/
├── entities/          # TypeORM entities (models)
├── repositories/      # Data access layer
├── services/          # Business logic
├── controllers/       # HTTP handlers
├── routes/            # Route definitions
├── middleware/        # Auth, logging, error handling
├── types/             # TypeScript interfaces
├── utils/             # Helper functions
└── config/            # Configuration files
```

## Coding Standards

### Naming Conventions
- **Classes**: PascalCase (e.g., `TransactionService`, `UserRepository`)
- **Functions/Methods**: camelCase (e.g., `createTransaction`, `getUserById`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_TRANSACTION_AMOUNT`)
- **Variables**: camelCase (e.g., `userId`, `transactionDate`)
- **Files**: kebab-case for utilities, PascalCase for classes

### Type Annotations
- ALL function parameters must have explicit type annotations
- ALL function return types must be explicitly declared
- Use specific types, never use `any`

### Logging Standards
- Use structured logging with Winston
- Log format: `{timestamp, level, service, function, message, context}`
- Log levels: ERROR, WARN, INFO, DEBUG

### Error Handling
- Create specific exception classes (not generic Error)
- Include error codes, HTTP status, and user messages

## Security Rules (CRITICAL for Fintech)

### Input Validation
- Validate ALL user inputs before processing
- Use class-validator for request DTOs
- Check type, format, length, and range

### Authorization
- Verify user identity on every API call
- Users can only access their own data
- Log all authorization failures

### Sensitive Data
- NEVER store passwords in plain text
- NEVER log passwords, API keys, tokens
- NEVER expose sensitive data in error messages
- Use environment variables for secrets

### SQL/Database Security
- NEVER construct SQL queries with string concatenation
- ALWAYS use parameterized queries via ORM
- Prevent SQL injection via TypeORM

## Testing Expectations

### Unit Tests
- Test every Service method
- Mock repositories and external dependencies
- Cover happy path, edge cases, error scenarios
- Minimum 80% coverage

### Integration Tests
- Test API endpoints end-to-end
- Use test database
- Test auth, validation, and business logic

## Fintech-Specific Rules

### Currency & Money Handling
- NEVER use JavaScript number type for money
- Use Decimal.js or store as integers (cents)
- Always round to 2 decimal places

### Transaction Immutability
- Transactions should be immutable once created
- Use soft deletes (mark as deleted)
- Log all modifications

### Balance Calculations
- Calculate from transaction history
- Cache with TTL for performance
- Verify accuracy on critical operations

### Date/Time Standards
- Store all timestamps in UTC
- Use ISO 8601 format for API responses
- Track: created_at, updated_at, deleted_at
