import { Repository } from 'typeorm';
import { ExpenseParticipant } from '../entities/ExpenseParticipant';
import AppDataSource from '../config/database';

export class ExpenseParticipantRepository {
  private repository: Repository<ExpenseParticipant>;

  constructor() {
    this.repository = AppDataSource.getRepository(ExpenseParticipant);
  }

  async create(participant: Partial<ExpenseParticipant>): Promise<ExpenseParticipant> {
    const newParticipant = this.repository.create(participant);
    return await this.repository.save(newParticipant);
  }

  async findById(id: string): Promise<ExpenseParticipant | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['expense', 'user'],
    });
  }

  async findByExpenseId(expenseId: string): Promise<ExpenseParticipant[]> {
    return await this.repository.find({
      where: { expenseId },
      relations: ['user'],
    });
  }

  async findByUserId(userId: string): Promise<ExpenseParticipant[]> {
    return await this.repository.find({
      where: { userId },
      relations: ['expense'],
    });
  }

  async findByExpenseIdAndUserId(expenseId: string, userId: string): Promise<ExpenseParticipant | null> {
    return await this.repository.findOne({
      where: { expenseId, userId },
    });
  }

  async update(id: string, participant: Partial<ExpenseParticipant>): Promise<ExpenseParticipant | null> {
    await this.repository.update(id, participant);
    return await this.findById(id);
  }

  async markAsPaid(id: string, paidAmount: number): Promise<void> {
    await this.repository.update(id, { isPaid: true, paidAmount });
  }
}
