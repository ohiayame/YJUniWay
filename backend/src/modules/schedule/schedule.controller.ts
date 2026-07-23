import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiConsumes,
} from '@nestjs/swagger';
import { ScheduleService } from './schedule.service';
import { Schedule } from './schedule.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

// PDF/이미지만 허용 (신규 엔드포인트라 방어적으로 mimetype 제한 추가)
const SCHEDULE_DOC_MIME = /^(application\/pdf|image\/(jpeg|png|gif|webp))$/;

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

  @Delete()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '일정 전체 삭제' })
  removeAll() {
    return this.scheduleService.removeAll();
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '일정 삭제' })
  remove(@Param('id') id: string) {
    return this.scheduleService.remove(+id);
  }

  @Post('bulk')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '일정 일괄 등록 (AI 파싱 결과 확인 후 등록, 트랜잭션)',
  })
  createMany(@Body() body: { schedules: Partial<Schedule>[] }) {
    return this.scheduleService.createMany(body.schedules);
  }

  @Post('translate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '단일 텍스트 한→일 번역 (폼 필드별 "번역" 버튼 전용)',
  })
  async translate(@Body() body: { text: string }) {
    if (!body.text?.trim()) {
      throw new BadRequestException('번역할 텍스트가 없습니다.');
    }
    const translated = await this.scheduleService.translateText(body.text);
    return { translated };
  }

  @Post('parse-document')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'PDF/이미지에서 일정 목록 추출 및 번역 (Claude AI)',
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 20 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (!SCHEDULE_DOC_MIME.test(file.mimetype)) {
          cb(
            new BadRequestException(
              'PDF 또는 이미지 파일만 업로드할 수 있습니다.',
            ),
            false,
          );
          return;
        }
        cb(null, true);
      },
    }),
  )
  parseDocument(@UploadedFile() file: Express.Multer.File) {
    return this.scheduleService.parseDocument(file);
  }
}
