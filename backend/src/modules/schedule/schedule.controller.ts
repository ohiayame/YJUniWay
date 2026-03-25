import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ScheduleService } from './schedule.service';
import { Schedule } from './schedule.entity';

@ApiTags('schedule')
@Controller('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get()
  @ApiOperation({ summary: '전체 일정 조회' })
  @ApiQuery({ name: 'date', required: false, example: '2025-03-25' })
  findAll(@Query('date') date?: string) {
    if (date) return this.scheduleService.findByDate(date);
    return this.scheduleService.findAll();
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: '일정 등록' })
  create(@Body() body: Partial<Schedule>) {
    return this.scheduleService.create(body);
  }

  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '일정 수정' })
  update(@Param('id') id: string, @Body() body: Partial<Schedule>) {
    return this.scheduleService.update(+id, body);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '일정 삭제' })
  remove(@Param('id') id: string) {
    return this.scheduleService.remove(+id);
  }
}
