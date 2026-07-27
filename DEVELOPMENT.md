# FinTrack Development Guide

## Project Structure

```
fintrack-expense-splitting/
├── src/
│   ├── config/
│   │   ├── database.ts          # Database configuration
│   │   └── logger.ts            # Logger configuration
│   ├── controllers/
│   │   ├── TransactionController.ts
│   │   └── ExpenseController.ts
│   ├── entities/
│   │   ├── Transaction.ts
│   │   ├── User.ts
│   │   ├── SharedExpense.ts
│   │   ├── ExpenseParticipant.ts
│   │   └── TransactionParticipant.ts
│   ├── repositories/
│   │   ├── TransactionRepository.ts
│   │   ├── UserRepository.ts
│   │   ├── SharedExpenseRepository.ts
│   │   └── ExpenseParticipantRepository.ts
│   ├── routes/
│   │   ├── transaction.routes.ts
│   │   └── expense.routes.ts
│   ├── services/
│   │   ├── TransactionService.ts
│   │   ├── ExpenseService.ts
│   │   ├── error.service.ts
│   │   └── logger.service.ts
│   ├── utils/
│   │   ├── logger.ts
│   │   └── validators.ts
│   ├── tests/
│   │   ├── TransactionService.test.ts
│   │   ├── ExpenseService.test.ts
│   │   └── api.integration.test.ts
│   └── index.ts                 # Application entry point
├── .env.example                 # Example environment variables
├── .gitignore                   # Git ignore file
├── API.md                       # API documentation
├── DEVELOPMENT.md               # Development guide
├── jest.config.js               # Jest configuration
├── package.json                 # Dependencies and scripts
├── tsconfig.json                # TypeScript configuration
└── README.md                    # Project README
```

## Development Workflow

### 1. Setup

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Start development server
npm run dev
```

### 2. Architecture Layers

#### Controller Layer
Handles HTTP requests and responses.
- Request validation
- Response formatting
- Error handling delegation

**Example:**
```typescript
async createTransaction(req: Request, res: Response): Promise<void> {
  const { amount, description } = req.body;
  const transaction = await this.service.createTransaction(...);
  res.status(201).json({ success: true, data: transaction });
}
```

#### Service Layer
Implements business logic and validations.
- Transaction calculations
- Expense splitting logic
- Balance calculations
- Input validation

**Example:**
```typescript
async createTransaction(
  userId: string,
  amount: number,
  description: string
): Promise<Transaction> {
  // Validate amount
  if (amount <= 0) throw new Error('Amount must be positive');
  // Business logic
  return this.repository.create({...});
}
```

#### Repository Layer
Manages data access through TypeORM.
- Database queries
- Entity relationships
- Query optimization

**Example:**
```typescript
async findById(id: string): Promise<Transaction | null> {
  return this.repository.findOne({
    where: { id, isDeleted: false },
    relations: ['user', 'participants']
  });
}
```

### 3. Fintech Security Practices

#### Money Handling
```typescript
import Decimal from 'decimal.js';

// Always use Decimal for monetary values
const amount = new Decimal(100.00).toDP(2);
```

#### Input Validation
```typescript
if (amount <= 0 || amount > MAX_TRANSACTION_AMOUNT) {
  throw new ValidationError('Invalid amount');
}
```

#### Logging
```typescript
logger.info('Transaction created', {
  service: 'TransactionService',
  userId,
  amount: transaction.amount
});
```

### 4. Testing

#### Unit Tests
```bash
npm test -- TransactionService.test.ts
```

#### Integration Tests
```bash
npm test -- api.integration.test.ts
```

#### Coverage
```bash
npm run test:coverage
```

### 5. Error Handling

Custom error classes:
```typescript
throw new ValidationError('Invalid input');
throw new NotFoundError('Transaction');
throw new AuthenticationError('Invalid token');
```

### 6. Database Migrations

TypeORM will automatically synchronize schema in development mode.

For production:
```bash
# Generate migration
npm run typeorm migration:generate -- -n MigrationName

# Run migrations
npm run typeorm migration:run
```

## Key Features

### Transaction Management
- Create transactions with categories
- Retrieve transaction history
- Calculate user balances
- Soft delete transactions

### Expense Splitting
- Create shared expenses
- Support multiple split types (EQUAL, ITEMIZED, PERCENTAGE)
- Add participants to expenses
- Calculate balances per participant

### Balance Calculations
- Track who owes whom
- Calculate net balances
- Support multiple participants
- Decimal precision for accuracy

## Best Practices

1. **Type Safety**: Always use explicit types, never use `any`
2. **Error Handling**: Use specific exception classes
3. **Logging**: Log important operations with context
4. **Validation**: Validate all inputs at controller level
5. **Database**: Use TypeORM queries, never raw SQL
6. **Testing**: Write tests for services and critical paths
7. **Security**: Never log sensitive data
8. **Money**: Always use Decimal.js for currency

## Troubleshooting

### Database Connection Error
```bash
# Check database credentials in .env
# Ensure PostgreSQL is running
# Verify connection parameters
```

### TypeScript Compilation Error
```bash
# Clear tsconfig cache
rm -rf dist
npm run build
```

### Port Already in Use
```bash
# Change PORT in .env or:
lsof -i :3000
kill -9 <PID>
```

## Contributing

1. Follow the architecture patterns
2. Write tests for new features
3. Validate all inputs
4. Use Decimal.js for money
5. Add logging for important operations
6. Update API documentation
