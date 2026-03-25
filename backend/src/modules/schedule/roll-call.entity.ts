import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Student } from '../student/student.entity';

@Entity('roll_calls')
@Unique(['studentId', 'date'])
export class RollCall {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'student_id' })
  studentId: number;

  @Column({ type: 'date' })
  date: string;

  @Column({ name: 'is_present', type: 'tinyint', width: 1, default: 0 })
  isPresent: boolean;

  @ManyToOne(() => Student, (student) => student.rollCalls, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'student_id' })
  student: Student;
}
