import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { RollCall } from '../schedule/roll-call.entity';

export enum Gender {
  MALE = 'M',
  FEMALE = 'F',
}

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'name_ja', length: 100 })
  nameJa: string;

  @Column({ name: 'name_ko', type: 'varchar', length: 100, nullable: true })
  nameKo: string | null;

  @Column({ name: 'name_en', type: 'varchar', length: 100, nullable: true })
  nameEn: string | null;

  @Column({ type: 'enum', enum: Gender })
  gender: Gender;

  @Column({ name: 'room_number', type: 'varchar', length: 20, nullable: true })
  roomNumber: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => RollCall, (rollCall) => rollCall.student)
  rollCalls: RollCall[];
}
