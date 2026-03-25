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

  @Column({ name: 'content_ko', type: 'text' })
  contentKo: string;

  @Column({ name: 'content_ja', type: 'text' })
  contentJa: string;

  @ManyToOne(() => DormitorySection, (section) => section.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'section_id' })
  section: DormitorySection;
}
