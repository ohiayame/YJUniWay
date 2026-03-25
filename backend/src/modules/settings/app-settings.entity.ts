import { Entity, PrimaryColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity('app_settings')
export class AppSettings {
  @PrimaryColumn({ default: 1 })
  id: number;

  @Column({ name: 'curfew_time', type: 'time', nullable: true })
  curfewTime: string | null;

  @Column({ name: 'wifi_ssid', length: 100, nullable: true })
  wifiSsid: string | null;

  @Column({ name: 'wifi_password', length: 100, nullable: true })
  wifiPassword: string | null;

  @Column({ name: 'school_address_ko', length: 255, nullable: true })
  schoolAddressKo: string | null;

  @Column({ name: 'school_address_ja', length: 255, nullable: true })
  schoolAddressJa: string | null;

  @Column({ name: 'notice_ko', type: 'text', nullable: true })
  noticeKo: string | null;

  @Column({ name: 'notice_ja', type: 'text', nullable: true })
  noticeJa: string | null;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
