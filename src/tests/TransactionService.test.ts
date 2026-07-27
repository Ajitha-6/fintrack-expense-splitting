import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { TransactionService } from '../services/TransactionService';
import { TransactionRepository } from '../repositories/TransactionRepository';
import { Transaction } from '../entities/Transaction';

jest.mock('../repositories/TransactionRepository');

describe('TransactionService', () => {
  let service: TransactionService;
  let mockRepository: jest.Mocked<TransactionRepository>;

  beforeAll(() => {
    mockRepository = new TransactionRepository() as jest.Mocked<TransactionRepository>;
    service = new TransactionService();
    (service as any).repository = mockRepository;
  });

  describe('createTransaction', () => {
    it('should create a valid transaction', async () => {
      const mockTransaction: Transaction = {
        id: 'test-id',
        userId: 'user-1',
        amount: 100.0,
        description: 'Test transaction',
        status: 'COMPLETED',
        category: 'groceries',
        notes: 'Test notes',
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        user: undefined as any,
        participants: [],
      };

      mockRepository.create.mockResolvedValue(mockTransaction);

      const result = await service.createTransaction('user-1', 100, 'Test transaction', 'groceries', 'Test notes');

      expect(result).toEqual(mockTransaction);
      expect(mockRepository.create).toHaveBeenCalledTimes(1);
    });

    it('should reject negative amounts', async () => {
      await expect(service.createTransaction('user-1', -100, 'Test')).rejects.toThrow(
        'Transaction amount must be greater than 0'
      );
    });

    it('should reject amounts exceeding maximum', async () => {
      await expect(service.createTransaction('user-1', 1000001, 'Test')).rejects.toThrow(
        'Transaction amount exceeds maximum limit'
      );
    });

    it('should reject empty description', async () => {
      await expect(service.createTransaction('user-1', 100, '')).rejects.toThrow(
        'Transaction description is required'
      );
    });
  });

  describe('calculateUserBalance', () => {
    it('should calculate total balance for user', async () => {
      const mockTransactions: Transaction[] = [
        {
          id: 'tx-1',
          userId: 'user-1',
          amount: 100.0,
          description: 'Transaction 1',
          status: 'COMPLETED',
          category: null,
          notes: null,
          isDeleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          user: undefined as any,
          participants: [],
        },
        {
          id: 'tx-2',
          userId: 'user-1',
          amount: 50.0,
          description: 'Transaction 2',
          status: 'COMPLETED',
          category: null,
          notes: null,
          isDeleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          user: undefined as any,
          participants: [],
        },
      ];

      mockRepository.findByUserId.mockResolvedValue(mockTransactions);

      const balance = await service.calculateUserBalance('user-1');

      expect(balance).toBe(150.0);
      expect(mockRepository.findByUserId).toHaveBeenCalledWith('user-1');
    });
  });
});
