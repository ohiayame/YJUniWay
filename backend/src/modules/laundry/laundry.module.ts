import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LaundrySettings } from './laundry-settings.entity';
import { LaundryStep } from './laundry-step.entity';
import { LaundryService } from './laundry.service';
import { LaundryController } from './laundry.controller';

@Module({
  imports: [TypeOrmModule.forFeature([LaundrySettings, LaundryStep])],
  providers: [LaundryService],
  controllers: [LaundryController],
})
export class LaundryModule {}
