import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Admin } from '../admin/admin.entity';
import { MemoBlock } from './memo-block.entity';

export enum MemoTargetType {
  DATE = 'date',
  SCHEDULE = 'schedule',
}

export enum MemoVisibility {
  PRIVATE = 'private',
  SHARED = 'shared',
}

@Entity('memos')
export class Memo {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ name: 'target_type', type: 'enum', enum: MemoTargetType })
  targetType: MemoTargetType;

  @Column({ name: 'target_date', type: 'date', nullable: true })
  targetDate: string | null;

  @Column({ name: 'schedule_id', type: 'int', nullable: true })
  scheduleId: number | null;

  @Column({
    type: 'enum',
    enum: MemoVisibility,
    default: MemoVisibility.SHARED,
  })
  visibility: MemoVisibility;

  @Column({ name: 'author_admin_id' })
  authorAdminId: number;

  @ManyToOne(() => Admin, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'author_admin_id' })
  author: Admin;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => MemoBlock, (block) => block.memo)
  blocks: MemoBlock[];
}
