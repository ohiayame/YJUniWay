import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LaundrySettings } from './laundry-settings.entity';
import { LaundryStep } from './laundry-step.entity';
import { translateKoToJa } from '../../utils/translate.util';

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

  async updateSettings(
    data: Partial<LaundrySettings>,
  ): Promise<LaundrySettings> {
    await this.settingsRepo.save({ ...data, id: 1 });
    return this.getSettings();
  }

  // 사용 순서 --------------------------------------------------

  // laundry_steps 테이블 전체 조회 (sort_order 오름차순)
  getSteps(): Promise<LaundryStep[]> {
    return this.stepRepo.find({ order: { sortOrder: 'ASC' } });
  }

  createStep(data: Partial<LaundryStep>): Promise<LaundryStep> {
    return this.stepRepo.save(this.stepRepo.create(data));
  }

  async updateStep(
    id: number,
    data: Partial<LaundryStep>,
  ): Promise<LaundryStep> {
    await this.stepRepo.update(id, data);
    return this.stepRepo.findOne({ where: { id } }) as Promise<LaundryStep>;
  }

  async removeStep(id: number): Promise<void> {
    await this.stepRepo.delete(id);
  }

  // 폼 직접 입력 중 필드별 "번역" 버튼 트리거 전용 (단일 텍스트만 좁게 번역)
  translateText(text: string): Promise<string> {
    return translateKoToJa(text);
  }
}
