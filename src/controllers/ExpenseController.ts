import { Request, Response } from 'express';
import { ExpenseService } from '../services/ExpenseService';
import { ValidationError, NotFoundError } from '../services/error.service';
import { logger } from '../utils/logger';

export class ExpenseController {
  private service: ExpenseService;

  constructor() {
    this.service = new ExpenseService();
  }

  async createExpense(req: Request, res: Response): Promise<void> {
    try {
      const { title, totalAmount, splitType, expenseDate, description, category } = req.body;
      const createdById = (req as any).userId;

      // Validate inputs
      if (!title || typeof title !== 'string') {
        throw new ValidationError('Title is required and must be a string');
      }

      if (!totalAmount || typeof totalAmount !== 'number') {
        throw new ValidationError('Total amount is required and must be a number');
      }

      if (!expenseDate) {
        throw new ValidationError('Expense date is required');
      }

      const expense = await this.service.createExpense(
        createdById,
        title,
        totalAmount,
        splitType || 'EQUAL',
        new Date(expenseDate),
        description,
        category
      );

      res.status(201).json({
        success: true,
        data: expense,
      });
    } catch (error) {
      logger.error('Create expense error', { error: (error as Error).message });
      throw error;
    }
  }

  async addParticipant(req: Request, res: Response): Promise<void> {
    try {
      const { expenseId, userId, amount } = req.body;

      // Validate inputs
      if (!expenseId || typeof expenseId !== 'string') {
        throw new ValidationError('Expense ID is required');
      }

      if (!userId || typeof userId !== 'string') {
        throw new ValidationError('User ID is required');
      }

      if (!amount || typeof amount !== 'number') {
        throw new ValidationError('Amount is required and must be a number');
      }

      const participant = await this.service.addParticipant(expenseId, userId, amount);

      res.status(201).json({
        success: true,
        data: participant,
      });
    } catch (error) {
      logger.error('Add participant error', { error: (error as Error).message });
      throw error;
    }
  }

  async getExpense(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const expense = await this.service.getExpenseById(id);
      if (!expense) {
        throw new NotFoundError('Expense');
      }

      res.status(200).json({
        success: true,
        data: expense,
      });
    } catch (error) {
      logger.error('Get expense error', { error: (error as Error).message });
      throw error;
    }
  }

  async getUserExpenses(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;

      const expenses = await this.service.getExpensesByUser(userId);

      res.status(200).json({
        success: true,
        data: expenses,
        count: expenses.length,
      });
    } catch (error) {
      logger.error('Get user expenses error', { error: (error as Error).message });
      throw error;
    }
  }

  async calculateBalances(req: Request, res: Response): Promise<void> {
    try {
      const { expenseId } = req.body;

      if (!expenseId || typeof expenseId !== 'string') {
        throw new ValidationError('Expense ID is required');
      }

      const balances = await this.service.calculateBalances(expenseId);

      res.status(200).json({
        success: true,
        data: balances,
      });
    } catch (error) {
      logger.error('Calculate balances error', { error: (error as Error).message });
      throw error;
    }
  }

  async settleExpense(req: Request, res: Response): Promise<void> {
    try {
      const { expenseId } = req.body;

      if (!expenseId || typeof expenseId !== 'string') {
        throw new ValidationError('Expense ID is required');
      }

      const expense = await this.service.settleExpense(expenseId);

      res.status(200).json({
        success: true,
        data: expense,
      });
    } catch (error) {
      logger.error('Settle expense error', { error: (error as Error).message });
      throw error;
    }
  }
}
