import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Memo } from './memo.entity';

export enum MemoBlockType {
  TEXT = 'text',
  CHECKBOX = 'checkbox',
}

@Entity('memo_blocks')
export class MemoBlock {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ name: 'memo_id' })
  memoId: number;

  @Column({ type: 'enum', enum: MemoBlockType })
  type: MemoBlockType;

  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'is_checked', type: 'tinyint', width: 1, default: 0 })
  isChecked: boolean;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;

  @ManyToOne(() => Memo, (memo) => memo.blocks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'memo_id' })
  memo: Memo;
}
