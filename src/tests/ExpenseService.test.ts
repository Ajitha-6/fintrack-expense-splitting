import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { ExpenseService } from '../services/ExpenseService';
import { SharedExpenseRepository } from '../repositories/SharedExpenseRepository';
import { ExpenseParticipantRepository } from '../repositories/ExpenseParticipantRepository';

jest.mock('../repositories/SharedExpenseRepository');
jest.mock('../repositories/ExpenseParticipantRepository');

describe('ExpenseService', () => {
  let service: ExpenseService;
  let mockExpenseRepository: jest.Mocked<SharedExpenseRepository>;
  let mockParticipantRepository: jest.Mocked<ExpenseParticipantRepository>;

  beforeAll(() => {
    mockExpenseRepository = new SharedExpenseRepository() as jest.Mocked<SharedExpenseRepository>;
    mockParticipantRepository = new ExpenseParticipantRepository() as jest.Mocked<ExpenseParticipantRepository>;
    service = new ExpenseService();
    (service as any).expenseRepository = mockExpenseRepository;
    (service as any).participantRepository = mockParticipantRepository;
  });

  describe('createExpense', () => {
    it('should create a valid expense', async () => {
      const mockExpense = {
        id: 'expense-1',
        createdById: 'user-1',
        title: 'Dinner',
        totalAmount: 300.0,
        splitType: 'EQUAL',
        expenseDate: new Date(),
        description: 'Team dinner',
        category: 'food',
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: undefined as any,
        participants: [],
      };

      mockExpenseRepository.create.mockResolvedValue(mockExpense);

      const result = await service.createExpense(
        'user-1',
        'Dinner',
        300,
        'EQUAL',
        new Date(),
        'Team dinner',
        'food'
      );

      expect(result).toEqual(mockExpense);
      expect(mockExpenseRepository.create).toHaveBeenCalled();
    });

    it('should reject negative amounts', async () => {
      await expect(
        service.createExpense('user-1', 'Dinner', -300, 'EQUAL', new Date())
      ).rejects.toThrow('Expense amount must be greater than 0');
    });

    it('should reject invalid split type', async () => {
      await expect(
        service.createExpense('user-1', 'Dinner', 300, 'INVALID', new Date())
      ).rejects.toThrow('Invalid split type: INVALID');
    });
  });
});
