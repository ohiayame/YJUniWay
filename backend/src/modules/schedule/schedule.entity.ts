import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('schedules')
export class Schedule {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ type: 'date' })
  date: string;

  @Column({
    name: 'time_start',
    type: 'time',
    nullable: true,
    transformer: {
      to: (v: string | null) => v,
      from: (v: string | null) => v?.slice(0, 5) ?? null,
    },
  })
  timeStart: string | null;

  @Column({
    name: 'time_end',
    type: 'time',
    nullable: true,
    transformer: {
      to: (v: string | null) => v,
      from: (v: string | null) => v?.slice(0, 5) ?? null,
    },
  })
  timeEnd: string | null;

  @Column({ name: 'title_ko', type: 'varchar', length: 255, nullable: true })
  titleKo: string | null;

  @Column({ name: 'title_ja', type: 'varchar', length: 255 })
  titleJa: string;

  @Column({ name: 'location_ko', type: 'varchar', length: 255, nullable: true })
  locationKo: string | null;

  @Column({ name: 'location_ja', type: 'varchar', length: 255, nullable: true })
  locationJa: string | null;

  @Column({ name: 'manager_name', type: 'varchar', length: 100, nullable: true })
  managerName: string | null;

  @Column({ name: 'notes_ko', type: 'text', nullable: true })
  notesKo: string | null;

  @Column({ name: 'notes_ja', type: 'text', nullable: true })
  notesJa: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
