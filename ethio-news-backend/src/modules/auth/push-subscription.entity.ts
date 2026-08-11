import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('push_subscriptions')
export class PushSubscription {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text', unique: true })
  endpoint!: string;

  @Column({ type: 'text' })
  p256dh!: string;

  @Column({ type: 'text' })
  auth!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'username', referencedColumnName: 'username' })
  user!: User;

  @Column({ type: 'varchar' })
  username!: string;
}
