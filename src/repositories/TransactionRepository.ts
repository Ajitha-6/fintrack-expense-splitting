import { Repository } from 'typeorm';
import { Transaction } from '../entities/Transaction';
import AppDataSource from '../config/database';

export class TransactionRepository {
  private repository: Repository<Transaction>;

  constructor() {
    this.repository = AppDataSource.getRepository(Transaction);
  }

  async create(transaction: Partial<Transaction>): Promise<Transaction> {
    const newTransaction = this.repository.create(transaction);
    return await this.repository.save(newTransaction);
  }

  async findById(id: string): Promise<Transaction | null> {
    return await this.repository.findOne({
      where: { id, isDeleted: false },
      relations: ['user', 'participants'],
    });
  }

  async findByUserId(userId: string): Promise<Transaction[]> {
    return await this.repository.find({
      where: { userId, isDeleted: false },
      relations: ['participants'],
      order: { createdAt: 'DESC' },
    });
  }

  async findAll(): Promise<Transaction[]> {
    return await this.repository.find({
      where: { isDeleted: false },
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, transaction: Partial<Transaction>): Promise<Transaction | null> {
    await this.repository.update(id, { ...transaction, updatedAt: new Date() });
    return await this.findById(id);
  }

  async softDelete(id: string): Promise<void> {
    await this.repository.update(id, {
      isDeleted: true,
      deletedAt: new Date(),
    });
  }

  async deleteAllByUserId(userId: string): Promise<void> {
    await this.repository.update({ userId }, { isDeleted: true, deletedAt: new Date() });
  }

  async findByStatus(status: string): Promise<Transaction[]> {
    return await this.repository.find({
      where: { status, isDeleted: false },
      order: { createdAt: 'DESC' },
    });
  }
}
