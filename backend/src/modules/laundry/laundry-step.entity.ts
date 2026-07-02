import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('laundry_steps')
export class LaundryStep {
  @PrimaryGeneratedColumn()
  id: number;

  // 표시 순서 (1부터 시작, 오름차순 정렬 기준)
  @Column({ name: 'sort_order' })
  sortOrder: number;

  @Column({ name: 'text_ko', length: 255 })
  textKo: string;

  @Column({ name: 'text_ja', length: 255 })
  textJa: string;
}
