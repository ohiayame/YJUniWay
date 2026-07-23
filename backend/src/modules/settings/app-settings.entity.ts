import { Entity, PrimaryColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity('app_settings')
export class AppSettings {
  @PrimaryColumn({ default: 1 })
  id: number;

  @Column({
    name: 'curfew_time',
    type: 'time',
    nullable: true,
    transformer: {
      to: (v: string | null) => v,
      from: (v: string | null) => v?.slice(0, 5) ?? null,
    },
  })
  curfewTime: string | null;

  @Column({ name: 'wifi_ssid', type: 'varchar', length: 100, nullable: true })
  wifiSsid: string | null;

  @Column({ name: 'wifi_password', type: 'varchar', length: 100, nullable: true })
  wifiPassword: string | null;

  @Column({ name: 'school_address_ko', type: 'varchar', length: 255, nullable: true })
  schoolAddressKo: string | null;

  @Column({ name: 'school_address_ja', type: 'varchar', length: 255, nullable: true })
  schoolAddressJa: string | null;

  @Column({ name: 'notice_ko', type: 'text', nullable: true })
  noticeKo: string | null;

  @Column({ name: 'notice_ja', type: 'text', nullable: true })
  noticeJa: string | null;

  @Column({
    name: 'gathering_time',
    type: 'time',
    nullable: true,
    transformer: {
      to: (v: string | null) => v,
      from: (v: string | null) => v?.slice(0, 5) ?? null,
    },
  })
  gatheringTime: string | null;

  @Column({ name: 'gathering_location_ko', type: 'varchar', length: 255, nullable: true })
  gatheringLocationKo: string | null;

  @Column({ name: 'gathering_location_ja', type: 'varchar', length: 255, nullable: true })
  gatheringLocationJa: string | null;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
