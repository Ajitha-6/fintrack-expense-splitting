import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import { User } from '../entities/User';
import { Transaction } from '../entities/Transaction';
import { SharedExpense } from '../entities/SharedExpense';
import { ExpenseParticipant } from '../entities/ExpenseParticipant';
import { TransactionParticipant } from '../entities/TransactionParticipant';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'fintrack_dev',
  synchronize: process.env.DB_SYNCHRONIZE === 'true' || true,
  logging: process.env.DB_LOGGING === 'true' || false,
  entities: [
    User,
    Transaction,
    SharedExpense,
    ExpenseParticipant,
    TransactionParticipant,
  ],
  migrations: ['src/migrations/*.ts'],
  subscribers: ['src/subscribers/*.ts'],
});

export default AppDataSource;
