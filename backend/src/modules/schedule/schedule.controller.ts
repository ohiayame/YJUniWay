import { Controller, Get, Post, Put, Delete, Param, Body, Query,UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ScheduleService } from './schedule.service';
import { Schedule } from './schedule.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('schedule')
@Controller('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  // GET /api/schedule          → schedules 테이블 전체 조회
  // GET /api/schedule?date=... → 특정 날짜 일정만 조회 (메인 페이지 오늘/내일 일정에 사용)
  @Get()
  @ApiOperation({ summary: '전체 일정 조회 (date 쿼리로 날짜 필터 가능)' })
  @ApiQuery({ name: 'date', required: false, example: '2026-04-07' })
  findAll(@Query('date') date?: string) {
    if (date) return this.scheduleService.findByDate(date);
    return this.scheduleService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '일정 등록' })
  create(@Body() body: Partial<Schedule>) {
    return this.scheduleService.create(body);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '일정 수정' })
  update(@Param('id') id: string, @Body() body: Partial<Schedule>) {
    return this.scheduleService.update(+id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '일정 삭제' })
  remove(@Param('id') id: string) {
    return this.scheduleService.remove(+id);
  }
}
