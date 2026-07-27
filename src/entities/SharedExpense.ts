import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, Index } from 'typeorm';
import { User } from './User';
import { ExpenseParticipant } from './ExpenseParticipant';

@Entity('shared_expenses')
@Index(['createdById', 'createdAt'])
@Index(['status'])
export class SharedExpense {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  createdById!: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column('decimal', { precision: 10, scale: 2 })
  totalAmount!: number;

  @Column({ type: 'varchar', enum: ['EQUAL', 'ITEMIZED', 'PERCENTAGE'], default: 'EQUAL' })
  splitType!: string;

  @Column({ type: 'varchar', enum: ['PENDING', 'SETTLED', 'CANCELLED'], default: 'PENDING' })
  status!: string;

  @Column({ type: 'date' })
  expenseDate!: Date;

  @Column({ type: 'varchar', nullable: true })
  category!: string | null;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt!: Date;

  @ManyToOne(() => User, (user) => user.expensesCreated)
  createdBy!: User;

  @OneToMany(() => ExpenseParticipant, (participant) => participant.expense, { cascade: true })
  participants!: ExpenseParticipant[];
}
