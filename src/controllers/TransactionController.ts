import { Request, Response } from 'express';
import { TransactionService } from '../services/TransactionService';
import { ValidationError, NotFoundError } from '../services/error.service';
import { logger } from '../utils/logger';

export class TransactionController {
  private service: TransactionService;

  constructor() {
    this.service = new TransactionService();
  }

  async createTransaction(req: Request, res: Response): Promise<void> {
    try {
      const { amount, description, category, notes } = req.body;
      const userId = (req as any).userId;

      // Validate inputs
      if (!amount || typeof amount !== 'number') {
        throw new ValidationError('Amount is required and must be a number');
      }

      if (!description || typeof description !== 'string') {
        throw new ValidationError('Description is required and must be a string');
      }

      const transaction = await this.service.createTransaction(
        userId,
        amount,
        description,
        category,
        notes
      );

      res.status(201).json({
        success: true,
        data: transaction,
      });
    } catch (error) {
      logger.error('Create transaction error', { error: (error as Error).message });
      throw error;
    }
  }

  async getTransaction(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const transaction = await this.service.getTransactionById(id);
      if (!transaction) {
        throw new NotFoundError('Transaction');
      }

      res.status(200).json({
        success: true,
        data: transaction,
      });
    } catch (error) {
      logger.error('Get transaction error', { error: (error as Error).message });
      throw error;
    }
  }

  async getUserTransactions(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;

      const transactions = await this.service.getTransactionsByUserId(userId);

      res.status(200).json({
        success: true,
        data: transactions,
        count: transactions.length,
      });
    } catch (error) {
      logger.error('Get user transactions error', { error: (error as Error).message });
      throw error;
    }
  }

  async deleteUserTransactions(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;

      await this.service.deleteAllByUserId(userId);

      res.status(200).json({
        success: true,
        message: 'All transactions deleted',
      });
    } catch (error) {
      logger.error('Delete user transactions error', { error: (error as Error).message });
      throw error;
    }
  }

  async getUserBalance(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;

      const balance = await this.service.calculateUserBalance(userId);

      res.status(200).json({
        success: true,
        data: {
          userId,
          balance,
        },
      });
    } catch (error) {
      logger.error('Get user balance error', { error: (error as Error).message });
      throw error;
    }
  }
}
