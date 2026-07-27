import { Repository } from 'typeorm';
import { SharedExpense } from '../entities/SharedExpense';
import AppDataSource from '../config/database';

export class SharedExpenseRepository {
  private repository: Repository<SharedExpense>;

  constructor() {
    this.repository = AppDataSource.getRepository(SharedExpense);
  }

  async create(expense: Partial<SharedExpense>): Promise<SharedExpense> {
    const newExpense = this.repository.create(expense);
    return await this.repository.save(newExpense);
  }

  async findById(id: string): Promise<SharedExpense | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['createdBy', 'participants', 'participants.user'],
    });
  }

  async findByCreatedById(userId: string): Promise<SharedExpense[]> {
    return await this.repository.find({
      where: { createdById: userId },
      relations: ['participants', 'participants.user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findAll(): Promise<SharedExpense[]> {
    return await this.repository.find({
      relations: ['createdBy', 'participants'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, expense: Partial<SharedExpense>): Promise<SharedExpense | null> {
    await this.repository.update(id, { ...expense, updatedAt: new Date() });
    return await this.findById(id);
  }

  async findByStatus(status: string): Promise<SharedExpense[]> {
    return await this.repository.find({
      where: { status },
      order: { createdAt: 'DESC' },
    });
  }
}
