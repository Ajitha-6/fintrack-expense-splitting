import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, Index } from 'typeorm';
import { Transaction } from './Transaction';
import { User } from './User';

@Entity('transaction_participants')
@Index(['transactionId', 'userId'])
export class TransactionParticipant {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  transactionId!: string;

  @Column()
  userId!: string;

  @Column('decimal', { precision: 10, scale: 2 })
  share!: number;

  @Column({ type: 'varchar', enum: ['PENDING', 'CONFIRMED', 'REJECTED'], default: 'PENDING' })
  status!: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date;

  @ManyToOne(() => Transaction, (transaction) => transaction.participants)
  transaction!: Transaction;

  @ManyToOne(() => User)
  user!: User;
}
