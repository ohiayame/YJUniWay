import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DormitorySection } from './dormitory-section.entity';
import { DormitoryItem } from './dormitory-item.entity';

@Injectable()
export class DormitoryService {
  constructor(
    @InjectRepository(DormitorySection)
    private readonly sectionRepo: Repository<DormitorySection>,
    @InjectRepository(DormitoryItem)
    private readonly itemRepo: Repository<DormitoryItem>,
  ) {}

  findAllSections(): Promise<DormitorySection[]> {
    return this.sectionRepo.find({ relations: ['items'] });
  }

  async findSection(id: number): Promise<DormitorySection> {
    const section = await this.sectionRepo.findOne({ where: { id }, relations: ['items'] });
    if (!section) throw new NotFoundException('섹션을 찾을 수 없습니다.');
    return section;
  }

  createSection(data: Partial<DormitorySection>): Promise<DormitorySection> {
    return this.sectionRepo.save(this.sectionRepo.create(data));
  }

  async updateSection(id: number, data: Partial<DormitorySection>): Promise<DormitorySection> {
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

  async updateItem(id: number, data: Partial<DormitoryItem>): Promise<DormitoryItem> {
    const item = await this.itemRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('항목을 찾을 수 없습니다.');
    Object.assign(item, data);
    return this.itemRepo.save(item);
  }

  async removeItem(id: number): Promise<void> {
    await this.itemRepo.delete(id);
  }
}
