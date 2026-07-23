import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScheduleModule } from './modules/schedule/schedule.module';
import { DormitoryModule } from './modules/dormitory/dormitory.module';
import { StudentModule } from './modules/student/student.module';
import { AdminModule } from './modules/admin/admin.module';
import { SettingsModule } from './modules/settings/settings.module';
import { LaundryModule } from './modules/laundry/laundry.module';
import { MemoModule } from './modules/memo/memo.module';
import { databaseConfig } from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        ...databaseConfig(),
      }),
      inject: [ConfigService],
    }),
    ScheduleModule,
    DormitoryModule,
    StudentModule,
    AdminModule,
    SettingsModule,
    LaundryModule,
    MemoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
