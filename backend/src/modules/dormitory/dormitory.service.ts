import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DormitorySection, SectionType } from './dormitory-section.entity';
import { DormitoryItem } from './dormitory-item.entity';
import { translateKoToJa } from '../../utils/translate.util';

@Injectable()
export class DormitoryService {
  constructor(
    @InjectRepository(DormitorySection)
    private readonly sectionRepo: Repository<DormitorySection>,
    @InjectRepository(DormitoryItem)
    private readonly itemRepo: Repository<DormitoryItem>,
  ) {}

  // dormitory_sections(type=floor) + dormitory_items 조회 → 층별 안내 영역
  findFloorSections(): Promise<DormitorySection[]> {
    return this.sectionRepo.find({
      where: { type: SectionType.FLOOR },
      relations: ['items'],
      order: { sortOrder: 'ASC', items: { sortOrder: 'ASC' } },
    });
  }

  // dormitory_sections(type=category) + dormitory_items 조회 → 규칙/쓰레기 등 카테고리 영역
  findCategorySections(): Promise<DormitorySection[]> {
    return this.sectionRepo.find({
      where: { type: SectionType.CATEGORY },
      relations: ['items'],
      order: { sortOrder: 'ASC', items: { sortOrder: 'ASC' } },
    });
  }

  async findSection(id: number): Promise<DormitorySection> {
    const section = await this.sectionRepo.findOne({
      where: { id },
      relations: ['items'],
    });
    if (!section) throw new NotFoundException('섹션을 찾을 수 없습니다.');
    return section;
  }

  createSection(data: Partial<DormitorySection>): Promise<DormitorySection> {
    return this.sectionRepo.save(this.sectionRepo.create(data));
  }

  async updateSection(
    id: number,
    data: Partial<DormitorySection>,
  ): Promise<DormitorySection> {
    const section = await this.findSection(id);
    Object.assign(section, data);
    return this.sectionRepo.save(section);
  }

  async removeSection(id: number): Promise<void> {
    await this.sectionRepo.delete(id);
  }

  // 항목 --------------------------------------------------

  createItem(data: Partial<DormitoryItem>): Promise<DormitoryItem> {
    return this.itemRepo.save(this.itemRepo.create(data));
  }

  async updateItem(
    id: number,
    data: Partial<DormitoryItem>,
  ): Promise<DormitoryItem> {
    const item = await this.itemRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('항목을 찾을 수 없습니다.');
    Object.assign(item, data);
    return this.itemRepo.save(item);
  }

  async removeItem(id: number): Promise<void> {
    await this.itemRepo.delete(id);
  }

  // 폼 직접 입력 중 필드별 "번역" 버튼 트리거 전용 (단일 텍스트만 좁게 번역)
  translateText(text: string): Promise<string> {
    return translateKoToJa(text);
  }
}
