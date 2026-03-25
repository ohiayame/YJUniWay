import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Schedule } from './schedule.entity';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(Schedule)
    private readonly scheduleRepo: Repository<Schedule>,
  ) {}

  findAll(): Promise<Schedule[]> {
    return this.scheduleRepo.find({ order: { date: 'ASC', timeStart: 'ASC' } });
  }

  findByDate(date: string): Promise<Schedule[]> {
    return this.scheduleRepo.find({
      where: { date },
      order: { timeStart: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Schedule> {
    const schedule = await this.scheduleRepo.findOne({ where: { id } });
    if (!schedule) throw new NotFoundException('일정을 찾을 수 없습니다.');
    return schedule;
  }

  create(data: Partial<Schedule>): Promise<Schedule> {
    return this.scheduleRepo.save(this.scheduleRepo.create(data));
  }

  async update(id: number, data: Partial<Schedule>): Promise<Schedule> {
    const schedule = await this.findOne(id);
    Object.assign(schedule, data);
    return this.scheduleRepo.save(schedule);
  }

  async remove(id: number): Promise<void> {
    await this.scheduleRepo.delete(id);
  }
}
