# FinTrack - Expense Splitting & Transaction Management API

> A comprehensive TypeScript-based REST API for managing shared expenses and personal transactions with precise balance calculations.

## 🚀 Features

- ✅ **Transaction Management**: Create, retrieve, and manage personal transactions
- ✅ **Expense Splitting**: Split expenses among multiple participants
- ✅ **Balance Calculations**: Automatic balance calculations with decimal precision
- ✅ **Multiple Split Types**: EQUAL, ITEMIZED, and PERCENTAGE splits
- ✅ **User Management**: User profiles and relationship management
- ✅ **Fintech Security**: Decimal.js for money handling, input validation
- ✅ **Comprehensive Logging**: Request and error logging with Winston
- ✅ **Unit & Integration Tests**: Jest test suite with mocking
- ✅ **Type Safety**: 100% TypeScript with strict mode
- ✅ **RESTful API**: Clean and intuitive API design

## 📋 Prerequisites

- Node.js >= 16.x
- PostgreSQL >= 12.x
- npm or yarn

## 🔧 Installation

### 1. Clone the repository
```bash
git clone https://github.com/Ajitha-6/fintrack-expense-splitting.git
cd fintrack-expense-splitting
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup environment variables
```bash
cp .env.example .env
```

Edit `.env` and configure:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=fintrack_dev
```

### 4. Create database
```bash
# Create PostgreSQL database
createdb fintrack_dev
```

### 5. Start the server
```bash
# Development mode with hot reload
npm run dev

# Production mode
npm run build
npm start
```

Server will start at `http://localhost:3000`

## 📚 API Documentation

See [API.md](./API.md) for complete API documentation.

### Quick Examples

#### Create Transaction
```bash
curl -X POST http://localhost:3000/api/transactions \
  -H "x-user-id: user-123" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100.00,
    "description": "Grocery shopping",
    "category": "groceries"
  }'
```

#### Create Shared Expense
```bash
curl -X POST http://localhost:3000/api/expenses \
  -H "x-user-id: user-123" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Team Lunch",
    "totalAmount": 300.00,
    "splitType": "EQUAL",
    "expenseDate": "2026-07-27"
  }'
```

#### Get User Balance
```bash
curl -X GET http://localhost:3000/api/balance \
  -H "x-user-id: user-123"
```

## 🧪 Testing

### Run all tests
```bash
npm test
```

### Run specific test file
```bash
npm test -- TransactionService.test.ts
```

### Generate coverage report
```bash
npm run test:coverage
```

### Run with watch mode
```bash
npm test -- --watch
```

## 🏗️ Architecture

The application follows a layered architecture:

```
Client Request
      ↓
   Router
      ↓
  Controller (HTTP handling)
      ↓
   Service (Business logic)
      ↓
  Repository (Data access)
      ↓
   Entity (Database)
```

### Layers

- **Controllers**: Handle HTTP requests/responses
- **Services**: Implement business logic and validations
- **Repositories**: Manage database operations
- **Entities**: Define database schema
- **Utilities**: Helper functions and validators

## 📁 Project Structure

```
fintrack-expense-splitting/
├── src/
│   ├── config/           # Database and logger configuration
│   ├── controllers/      # HTTP request handlers
│   ├── entities/         # TypeORM entities
│   ├── repositories/     # Data access layer
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── tests/           # Test files
│   ├── utils/           # Utilities and validators
│   └── index.ts         # Application entry point
├── .env.example         # Example environment variables
├── API.md              # API documentation
├── DEVELOPMENT.md      # Development guide
├── jest.config.js      # Jest configuration
├── package.json        # Dependencies
├── README.md           # This file
└── tsconfig.json       # TypeScript configuration
```

## 🔐 Security Features

- ✅ Input validation on all endpoints
- ✅ Decimal.js for precise money handling
- ✅ SQL injection prevention (TypeORM parameterized queries)
- ✅ Error handling with custom exception classes
- ✅ Comprehensive logging without sensitive data
- ✅ Soft deletes for data integrity
- ✅ Type-safe database operations

## 🛠️ Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build TypeScript
npm start                # Start production server

# Testing
npm test                 # Run all tests
npm run test:coverage    # Generate coverage report

# Database
npm run typeorm migration:generate -- -n MigrationName
npm run typeorm migration:run
```

## 📦 Dependencies

### Core
- **express**: Web framework
- **typeorm**: ORM for database
- **pg**: PostgreSQL driver
- **decimal.js**: Decimal arithmetic
- **winston**: Logging
- **dotenv**: Environment variables

### Development
- **typescript**: Type safety
- **jest**: Testing framework
- **ts-node**: TypeScript execution
- **ts-jest**: Jest TypeScript support
- **supertest**: HTTP testing

## 🐛 Troubleshooting

### Database Connection Failed
```bash
# Check PostgreSQL is running
psql -U postgres

# Verify connection settings in .env
# Check database exists
psql -U postgres -l | grep fintrack_dev
```

### Port Already in Use
```bash
# Change PORT in .env or
lsof -i :3000
kill -9 <PID>
```

### TypeScript Compilation Error
```bash
rm -rf dist
npm run build
```

## 📖 Development Guide

See [DEVELOPMENT.md](./DEVELOPMENT.md) for:
- Detailed architecture explanation
- Best practices
- Development workflow
- Adding new features

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

### Code Standards
- Use TypeScript with strict mode
- Follow existing code patterns
- Write tests for new features
- Use Decimal.js for money
- Add logging for operations
- Update documentation

## 📝 License

MIT License - see LICENSE file for details

## 👨‍💻 Author

**Ajitha-6**
- GitHub: [@Ajitha-6](https://github.com/Ajitha-6)

## 🙏 Acknowledgments

- TypeORM for excellent ORM
- Express.js for web framework
- Jest for testing framework
- Winston for logging

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing documentation
- Review test files for examples

---

**Built with ❤️ using TypeScript, Express, and TypeORM**
