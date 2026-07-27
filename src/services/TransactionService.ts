import { TransactionRepository } from '../repositories/TransactionRepository';
import { Transaction } from '../entities/Transaction';
import { logger } from '../utils/logger';
import Decimal from 'decimal.js';

export class TransactionService {
  private repository: TransactionRepository;

  constructor() {
    this.repository = new TransactionRepository();
  }

  async createTransaction(
    userId: string,
    amount: number,
    description: string,
    category?: string,
    notes?: string
  ): Promise<Transaction> {
    // Validate amount
    if (amount <= 0) {
      logger.warn('Invalid transaction amount', { userId, amount });
      throw new Error('Transaction amount must be greater than 0');
    }

    // Convert to Decimal for precision
    const decimalAmount = new Decimal(amount).toDP(2);
    if (decimalAmount.toNumber() > 1000000) {
      logger.warn('Transaction amount exceeds maximum', { userId, amount });
      throw new Error('Transaction amount exceeds maximum limit');
    }

    // Validate description
    if (!description || description.trim().length === 0) {
      throw new Error('Transaction description is required');
    }

    if (description.length > 255) {
      throw new Error('Transaction description must be less than 255 characters');
    }

    const transaction = await this.repository.create({
      userId,
      amount: decimalAmount.toNumber(),
      description: description.trim(),
      category: category || null,
      notes: notes || null,
      status: 'COMPLETED',
    });

    logger.info('Transaction created', {
      service: 'TransactionService',
      userId,
      transactionId: transaction.id,
      amount: transaction.amount,
    });

    return transaction;
  }

  async getTransactionById(id: string): Promise<Transaction | null> {
    logger.debug('Fetching transaction', { transactionId: id });
    return await this.repository.findById(id);
  }

  async getTransactionsByUserId(userId: string): Promise<Transaction[]> {
    logger.debug('Fetching user transactions', { userId });
    return await this.repository.findByUserId(userId);
  }

  async getAllTransactions(): Promise<Transaction[]> {
    logger.debug('Fetching all transactions');
    return await this.repository.findAll();
  }

  async deleteAllByUserId(userId: string): Promise<void> {
    logger.info('Deleting all transactions for user', { userId });
    await this.repository.deleteAllByUserId(userId);
  }

  async getTransactionsByStatus(status: string): Promise<Transaction[]> {
    const validStatuses = ['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status: ${status}`);
    }
    return await this.repository.findByStatus(status);
  }

  async calculateUserBalance(userId: string): Promise<number> {
    const transactions = await this.repository.findByUserId(userId);
    const balance = transactions.reduce((sum, tx) => {
      return new Decimal(sum).plus(new Decimal(tx.amount));
    }, new Decimal(0));
    return balance.toDP(2).toNumber();
  }
}
