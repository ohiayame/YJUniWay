import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('emergency_contacts')
export class EmergencyContact {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'label_ko', length: 100 })
  labelKo: string;

  @Column({ name: 'label_ja', length: 100 })
  labelJa: string;

  @Column({ length: 30 })
  phone: string;
}
