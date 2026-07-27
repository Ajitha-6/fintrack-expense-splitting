# FinTrack API Documentation

## Overview
FinTrack is a RESTful API for managing shared expenses and transactions with comprehensive balance calculations.

## Base URL
```
http://localhost:3000/api
```

## Authentication
All endpoints require the `x-user-id` header for authentication.

```bash
X-User-Id: user-uuid
```

## Endpoints

### Transactions

#### Create Transaction
**POST** `/transactions`

Create a new transaction for the authenticated user.

**Request Body:**
```json
{
  "amount": 100.00,
  "description": "Grocery shopping",
  "category": "groceries",
  "notes": "Weekly groceries from supermarket"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "user-id",
    "amount": 100.00,
    "description": "Grocery shopping",
    "status": "COMPLETED",
    "category": "groceries",
    "notes": "Weekly groceries from supermarket",
    "createdAt": "2026-07-27T14:00:00Z",
    "updatedAt": "2026-07-27T14:00:00Z"
  }
}
```

**Error (400):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Amount is required and must be a number",
    "timestamp": "2026-07-27T14:00:00Z"
  }
}
```

#### Get Transaction
**GET** `/transactions/:id`

Retrieve a specific transaction by ID.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "user-id",
    "amount": 100.00,
    "description": "Grocery shopping",
    "status": "COMPLETED",
    "category": "groceries",
    "createdAt": "2026-07-27T14:00:00Z"
  }
}
```

#### Get User Transactions
**GET** `/transactions/user/:userId`

Retrieve all transactions for a user.

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "amount": 100.00,
      "description": "Grocery shopping",
      "createdAt": "2026-07-27T14:00:00Z"
    }
  ],
  "count": 1
}
```

#### Get User Balance
**GET** `/balance`

Retrieve the total balance for the authenticated user.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "userId": "user-id",
    "balance": 1500.50
  }
}
```

#### Delete User Transactions
**DELETE** `/transactions/user/:userId`

Delete all transactions for a user (soft delete).

**Response (200 OK):**
```json
{
  "success": true,
  "message": "All transactions deleted"
}
```

### Expenses

#### Create Expense
**POST** `/expenses`

Create a new shared expense.

**Request Body:**
```json
{
  "title": "Team Lunch",
  "totalAmount": 300.00,
  "splitType": "EQUAL",
  "expenseDate": "2026-07-27",
  "description": "Team lunch celebration",
  "category": "food"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "createdById": "user-id",
    "title": "Team Lunch",
    "totalAmount": 300.00,
    "splitType": "EQUAL",
    "status": "PENDING",
    "expenseDate": "2026-07-27",
    "createdAt": "2026-07-27T14:00:00Z"
  }
}
```

#### Add Participant
**POST** `/expenses/participants`

Add a participant to an expense.

**Request Body:**
```json
{
  "expenseId": "expense-uuid",
  "userId": "participant-user-id",
  "amount": 75.00
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "expenseId": "expense-uuid",
    "userId": "participant-user-id",
    "amount": 75.00,
    "isPaid": false
  }
}
```

#### Get Expense
**GET** `/expenses/:id`

Retrieve a specific expense with all participants.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "expense-uuid",
    "title": "Team Lunch",
    "totalAmount": 300.00,
    "participants": [
      {
        "userId": "user-1",
        "amount": 100.00,
        "isPaid": false
      }
    ]
  }
}
```

#### Get User Expenses
**GET** `/expenses/user/:userId`

Retrieve all expenses created by a user.

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Team Lunch",
      "totalAmount": 300.00,
      "status": "PENDING"
    }
  ],
  "count": 1
}
```

#### Calculate Balances
**POST** `/balances/calculate`

Calculate all balances (owes, owed, net) for an expense.

**Request Body:**
```json
{
  "expenseId": "expense-uuid"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "userId": "user-1",
      "owes": 100.00,
      "owed": 0.00,
      "netBalance": -100.00
    },
    {
      "userId": "user-2",
      "owes": 100.00,
      "owed": 300.00,
      "netBalance": 200.00
    }
  ]
}
```

#### Settle Expense
**POST** `/expenses/settle`

Mark an expense as settled.

**Request Body:**
```json
{
  "expenseId": "expense-uuid"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "expense-uuid",
    "status": "SETTLED"
  }
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Description is required and must be a string",
    "timestamp": "2026-07-27T14:00:00Z"
  }
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": {
    "code": "AUTHENTICATION_ERROR",
    "message": "Authentication failed",
    "timestamp": "2026-07-27T14:00:00Z"
  }
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Transaction not found",
    "timestamp": "2026-07-27T14:00:00Z"
  }
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred",
    "timestamp": "2026-07-27T14:00:00Z"
  }
}
```

## Testing

### Run Unit Tests
```bash
npm test
```

### Run Integration Tests
```bash
npm test -- api.integration.test.ts
```

### Generate Coverage Report
```bash
npm run test:coverage
```

## Environment Variables

```env
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=fintrack_dev
DB_SYNCHRONIZE=true
DB_LOGGING=true
JWT_SECRET=your-secret-key
JWT_EXPIRATION=24h
```
