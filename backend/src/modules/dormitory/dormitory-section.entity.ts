import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { DormitoryItem } from './dormitory-item.entity';

export enum SectionType {
  FLOOR = 'floor',
  CATEGORY = 'category',
}

@Entity('dormitory_sections')
export class DormitorySection {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: SectionType })
  type: SectionType;

  @Column({ name: 'section_key', length: 20, unique: true })
  sectionKey: string;

  @Column({ name: 'title_ko', length: 100 })
  titleKo: string;

  @Column({ name: 'title_ja', length: 100 })
  titleJa: string;

  @Column({ name: 'subtitle_ko', type: 'varchar', length: 100, nullable: true })
  subtitleKo: string | null;

  @Column({ name: 'subtitle_ja', type: 'varchar', length: 100, nullable: true })
  subtitleJa: string | null;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;

  @OneToMany(() => DormitoryItem, (item) => item.section, {
    cascade: true,
  })
  items: DormitoryItem[];
}
