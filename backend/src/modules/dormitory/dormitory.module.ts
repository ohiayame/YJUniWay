import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DormitorySection } from './dormitory-section.entity';
import { DormitoryItem } from './dormitory-item.entity';
import { DormitoryController } from './dormitory.controller';
import { DormitoryService } from './dormitory.service';

@Module({
  imports: [TypeOrmModule.forFeature([DormitorySection, DormitoryItem])],
  controllers: [DormitoryController],
  providers: [DormitoryService],
})
export class DormitoryModule {}
