import { Repository } from 'typeorm';
import { User } from '../entities/User';
import AppDataSource from '../config/database';

export class UserRepository {
  private repository: Repository<User>;

  constructor() {
    this.repository = AppDataSource.getRepository(User);
  }

  async create(user: Partial<User>): Promise<User> {
    const newUser = this.repository.create(user);
    return await this.repository.save(newUser);
  }

  async findById(id: string): Promise<User | null> {
    return await this.repository.findOne({ where: { id, isActive: true } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.repository.findOne({ where: { email, isActive: true } });
  }

  async findAll(): Promise<User[]> {
    return await this.repository.find({ where: { isActive: true } });
  }

  async update(id: string, user: Partial<User>): Promise<User | null> {
    await this.repository.update(id, { ...user, updatedAt: new Date() });
    return await this.findById(id);
  }

  async findByIdWithPassword(id: string): Promise<User | null> {
    return await this.repository.findOne({
      where: { id, isActive: true },
      select: ['id', 'email', 'firstName', 'lastName', 'passwordHash', 'isActive'],
    });
  }

  async deactivate(id: string): Promise<void> {
    await this.repository.update(id, { isActive: false });
  }
}
