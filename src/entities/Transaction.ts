import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, Index } from 'typeorm';
import { User } from './User';
import { TransactionParticipant } from './TransactionParticipant';

@Entity('transactions')
@Index(['userId', 'createdAt'])
@Index(['status'])
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  userId!: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount!: number;

  @Column({ type: 'varchar', length: 255 })
  description!: string;

  @Column({ type: 'varchar', enum: ['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED'], default: 'PENDING' })
  status!: string;

  @Column({ type: 'varchar', nullable: true })
  category!: string | null;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @Column({ type: 'boolean', default: false })
  isDeleted!: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt!: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  deletedAt!: Date | null;

  @ManyToOne(() => User, (user) => user.transactions)
  user!: User;

  @OneToMany(() => TransactionParticipant, (participant) => participant.transaction, { cascade: true })
  participants!: TransactionParticipant[];
}
