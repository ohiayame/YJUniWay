import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppSettings } from './app-settings.entity';
import { EmergencyContact } from './emergency-contact.entity';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(AppSettings)
    private readonly settingsRepo: Repository<AppSettings>,
    @InjectRepository(EmergencyContact)
    private readonly contactRepo: Repository<EmergencyContact>,
  ) {}

  // app_settings 테이블에서 id=1 단일 행 조회 (없으면 빈 행 생성)
  async getSettings(): Promise<AppSettings> {
    let settings = await this.settingsRepo.findOne({ where: { id: 1 } });
    if (!settings) {
      settings = this.settingsRepo.create({ id: 1 });
      await this.settingsRepo.save(settings);
    }
    return settings;
  }

  async updateSettings(data: Partial<AppSettings>): Promise<AppSettings> {
    await this.settingsRepo.save({ ...data, id: 1 });
    return this.getSettings();
  }

  // 긴급 연락처 ------------------------------------------

  // emergency_contacts 테이블 전체 조회
  findAllContacts(): Promise<EmergencyContact[]> {
    return this.contactRepo.find();
  }

  createContact(data: Partial<EmergencyContact>): Promise<EmergencyContact> {
    return this.contactRepo.save(this.contactRepo.create(data));
  }

  async updateContact(id: number, data: Partial<EmergencyContact>): Promise<EmergencyContact> {
    await this.contactRepo.update(id, data);
    return this.contactRepo.findOne({ where: { id } }) as Promise<EmergencyContact>;
  }

  async removeContact(id: number): Promise<void> {
    await this.contactRepo.delete(id);
  }
}
