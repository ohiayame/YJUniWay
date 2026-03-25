import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum AdminRole {
  PROFESSOR = 'professor',
  STAFF = 'staff',
}

@Entity('admins')
export class Admin {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  name: string;

  @Column({ name: 'student_id', length: 20, unique: true, nullable: true })
  studentId: string | null;

  @Column({ length: 20 })
  phone: string;

  @Column({ type: 'enum', enum: AdminRole, default: AdminRole.STAFF })
  role: AdminRole;

  @Column({ length: 255 })
  password: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  updatedAt: Date | null;
}
