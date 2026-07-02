import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LaundrySettings } from './laundry-settings.entity';
import { LaundryStep } from './laundry-step.entity';

@Injectable()
export class LaundryService {
  constructor(
    @InjectRepository(LaundrySettings)
    private readonly settingsRepo: Repository<LaundrySettings>,
    @InjectRepository(LaundryStep)
    private readonly stepRepo: Repository<LaundryStep>,
  ) {}

  // laundry_settings 테이블에서 id=1 단일 행 조회 (없으면 기본값으로 생성)
  async getSettings(): Promise<LaundrySettings> {
    let settings = await this.settingsRepo.findOne({ where: { id: 1 } });
    if (!settings) {
      settings = this.settingsRepo.create({ id: 1 });
      await this.settingsRepo.save(settings);
    }
    return settings;
  }

  // laundry_steps 테이블 전체 조회 (sort_order 오름차순)
  getSteps(): Promise<LaundryStep[]> {
    return this.stepRepo.find({ order: { sortOrder: 'ASC' } });
  }
}
