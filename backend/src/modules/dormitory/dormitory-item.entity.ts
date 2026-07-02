import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { DormitorySection } from './dormitory-section.entity';

@Entity('dormitory_items')
export class DormitoryItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ name: 'section_id' })
  sectionId: number;

  @Column({ name: 'text_ko', type: 'text' })
  textKo: string;

  @Column({ name: 'text_ja', type: 'text' })
  textJa: string;

  @Column({ name: 'warning_ko', type: 'text', nullable: true })
  warningKo: string | null;

  @Column({ name: 'warning_ja', type: 'text', nullable: true })
  warningJa: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  pin: string | null;

  @Column({ name: 'is_danger', default: false })
  isDanger: boolean;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;

  @ManyToOne(() => DormitorySection, (section) => section.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'section_id' })
  section: DormitorySection;
}
