import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, Index } from 'typeorm';
import { SharedExpense } from './SharedExpense';
import { User } from './User';

@Entity('expense_participants')
@Index(['expenseId', 'userId'])
export class ExpenseParticipant {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  expenseId!: string;

  @Column()
  userId!: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount!: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  paidAmount!: number | null;

  @Column({ type: 'boolean', default: false })
  isPaid!: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date;

  @ManyToOne(() => SharedExpense, (expense) => expense.participants)
  expense!: SharedExpense;

  @ManyToOne(() => User, (user) => user.expenseParticipations)
  user!: User;
}
