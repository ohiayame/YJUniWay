import { Entity, PrimaryColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity('laundry_settings')
export class LaundrySettings {
  @PrimaryColumn({ default: 1 })
  id: number;

  // 세탁기/건조기 1회 요금 표시 텍스트
  @Column({ name: 'wash_price', length: 30, default: '700원' })
  washPrice: string;

  @Column({ name: 'dry_price', length: 30, default: '700원~' })
  dryPrice: string;

  // 결제 앱 정보
  @Column({ name: 'app_name', length: 100, default: '메타클럽' })
  appName: string;

  @Column({ name: 'app_url', length: 255, default: 'https://www.metaclub.im/' })
  appUrl: string;

  // 주의사항
  @Column({ name: 'warning_ko', type: 'text', nullable: true })
  warningKo: string | null;

  @Column({ name: 'warning_ja', type: 'text', nullable: true })
  warningJa: string | null;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
