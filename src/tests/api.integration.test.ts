import request from 'supertest';
import app from '../index';
import { TransactionService } from '../services/TransactionService';
import { ExpenseService } from '../services/ExpenseService';

jest.mock('../services/TransactionService');
jest.mock('../services/ExpenseService');

describe('Transaction API', () => {
  const userId = 'test-user-123';

  describe('POST /api/transactions', () => {
    it('should create a new transaction', async () => {
      const transactionData = {
        amount: 100.0,
        description: 'Grocery shopping',
        category: 'groceries',
        notes: 'Weekly groceries',
      };

      const response = await request(app)
        .post('/api/transactions')
        .set('x-user-id', userId)
        .send(transactionData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    it('should reject missing amount', async () => {
      const transactionData = {
        description: 'Grocery shopping',
      };

      const response = await request(app)
        .post('/api/transactions')
        .set('x-user-id', userId)
        .send(transactionData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject missing authorization', async () => {
      const transactionData = {
        amount: 100.0,
        description: 'Grocery shopping',
      };

      const response = await request(app)
        .post('/api/transactions')
        .send(transactionData);

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/transactions/:id', () => {
    it('should retrieve a transaction by ID', async () => {
      const response = await request(app)
        .get('/api/transactions/tx-123')
        .set('x-user-id', userId);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/balance', () => {
    it('should retrieve user balance', async () => {
      const response = await request(app)
        .get('/api/balance')
        .set('x-user-id', userId);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('balance');
    });
  });
});

describe('Expense API', () => {
  const userId = 'test-user-123';

  describe('POST /api/expenses', () => {
    it('should create a new expense', async () => {
      const expenseData = {
        title: 'Team Lunch',
        totalAmount: 300.0,
        splitType: 'EQUAL',
        expenseDate: new Date(),
        description: 'Team lunch expense',
        category: 'food',
      };

      const response = await request(app)
        .post('/api/expenses')
        .set('x-user-id', userId)
        .send(expenseData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });
  });

  describe('POST /api/expenses/participants', () => {
    it('should add a participant to an expense', async () => {
      const participantData = {
        expenseId: 'exp-123',
        userId: 'participant-user-456',
        amount: 75.0,
      };

      const response = await request(app)
        .post('/api/expenses/participants')
        .set('x-user-id', userId)
        .send(participantData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });
  });

  describe('POST /api/balances/calculate', () => {
    it('should calculate balances for an expense', async () => {
      const calculateData = {
        expenseId: 'exp-123',
      };

      const response = await request(app)
        .post('/api/balances/calculate')
        .set('x-user-id', userId)
        .send(calculateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
});
