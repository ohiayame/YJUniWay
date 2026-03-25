import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppSettings } from './app-settings.entity';
import { EmergencyContact } from './emergency-contact.entity';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';

@Module({
  imports: [TypeOrmModule.forFeature([AppSettings, EmergencyContact])],
  controllers: [SettingsController],
  providers: [SettingsService],
})
export class SettingsModule {}
