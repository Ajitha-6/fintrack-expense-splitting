import { SharedExpenseRepository } from '../repositories/SharedExpenseRepository';
import { ExpenseParticipantRepository } from '../repositories/ExpenseParticipantRepository';
import { SharedExpense } from '../entities/SharedExpense';
import { ExpenseParticipant } from '../entities/ExpenseParticipant';
import { logger } from '../utils/logger';
import Decimal from 'decimal.js';

export interface BalanceResult {
  userId: string;
  owes: number;
  owed: number;
  netBalance: number;
}

export class ExpenseService {
  private expenseRepository: SharedExpenseRepository;
  private participantRepository: ExpenseParticipantRepository;

  constructor() {
    this.expenseRepository = new SharedExpenseRepository();
    this.participantRepository = new ExpenseParticipantRepository();
  }

  async createExpense(
    createdById: string,
    title: string,
    totalAmount: number,
    splitType: string = 'EQUAL',
    expenseDate: Date,
    description?: string,
    category?: string
  ): Promise<SharedExpense> {
    // Validate inputs
    if (!title || title.trim().length === 0) {
      throw new Error('Expense title is required');
    }

    if (totalAmount <= 0) {
      throw new Error('Expense amount must be greater than 0');
    }

    const validSplitTypes = ['EQUAL', 'ITEMIZED', 'PERCENTAGE'];
    if (!validSplitTypes.includes(splitType)) {
      throw new Error(`Invalid split type: ${splitType}`);
    }

    const decimalAmount = new Decimal(totalAmount).toDP(2);

    const expense = await this.expenseRepository.create({
      createdById,
      title: title.trim(),
      description: description || null,
      totalAmount: decimalAmount.toNumber(),
      splitType,
      expenseDate,
      category: category || null,
      status: 'PENDING',
    });

    logger.info('Shared expense created', {
      service: 'ExpenseService',
      expenseId: expense.id,
      createdById,
      totalAmount: expense.totalAmount,
      splitType,
    });

    return expense;
  }

  async addParticipant(
    expenseId: string,
    userId: string,
    amount: number
  ): Promise<ExpenseParticipant> {
    // Validate amount
    if (amount <= 0) {
      throw new Error('Participant amount must be greater than 0');
    }

    const decimalAmount = new Decimal(amount).toDP(2);

    const participant = await this.participantRepository.create({
      expenseId,
      userId,
      amount: decimalAmount.toNumber(),
      paidAmount: null,
      isPaid: false,
    });

    logger.info('Participant added to expense', {
      service: 'ExpenseService',
      expenseId,
      userId,
      amount: participant.amount,
    });

    return participant;
  }

  async calculateBalances(expenseId: string): Promise<BalanceResult[]> {
    logger.debug('Calculating balances for expense', { expenseId });

    const participants = await this.participantRepository.findByExpenseId(expenseId);

    if (participants.length === 0) {
      return [];
    }

    const balances: Map<string, BalanceResult> = new Map();

    // Initialize balances
    participants.forEach((participant) => {
      if (!balances.has(participant.userId)) {
        balances.set(participant.userId, {
          userId: participant.userId,
          owes: 0,
          owed: 0,
          netBalance: 0,
        });
      }
    });

    // Calculate owes and owed
    participants.forEach((participant) => {
      const balance = balances.get(participant.userId)!;
      const amount = new Decimal(participant.amount);

      if (participant.isPaid) {
        balance.owed = new Decimal(balance.owed).plus(amount).toDP(2).toNumber();
      } else {
        balance.owes = new Decimal(balance.owes).plus(amount).toDP(2).toNumber();
      }
    });

    // Calculate net balance
    balances.forEach((balance) => {
      balance.netBalance = new Decimal(balance.owed).minus(new Decimal(balance.owes)).toDP(2).toNumber();
    });

    logger.info('Balances calculated', {
      service: 'ExpenseService',
      expenseId,
      participantCount: participants.length,
    });

    return Array.from(balances.values());
  }

  async getExpenseById(id: string): Promise<SharedExpense | null> {
    return await this.expenseRepository.findById(id);
  }

  async getExpensesByUser(userId: string): Promise<SharedExpense[]> {
    return await this.expenseRepository.findByCreatedById(userId);
  }

  async getAllExpenses(): Promise<SharedExpense[]> {
    return await this.expenseRepository.findAll();
  }

  async settleExpense(expenseId: string): Promise<SharedExpense | null> {
    logger.info('Settling expense', { expenseId });
    return await this.expenseRepository.update(expenseId, { status: 'SETTLED' });
  }
}
