import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LaundryService } from './laundry.service';
import { LaundrySettings } from './laundry-settings.entity';
import { LaundryStep } from './laundry-step.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('laundry')
@Controller('laundry')
export class LaundryController {
  constructor(private readonly laundryService: LaundryService) {}

  // GET /api/laundry/settings → laundry_settings 단일 행 조회 (요금, 앱 정보, 미디어 경로)
  @Get('settings')
  @ApiOperation({
    summary: '세탁기 설정 조회 (요금, 앱 정보, 이미지/영상 경로)',
  })
  getSettings() {
    return this.laundryService.getSettings();
  }

  @Put('settings')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '세탁기 설정 수정 (요금, 앱 정보, 주의사항)' })
  updateSettings(@Body() body: Partial<LaundrySettings>) {
    return this.laundryService.updateSettings(body);
  }

  // 사용 순서 --------------------------------------------------

  // GET /api/laundry/steps → laundry_steps 전체 조회 (sort_order 오름차순)
  @Get('steps')
  @ApiOperation({ summary: '세탁기 사용 순서 목록 조회' })
  getSteps() {
    return this.laundryService.getSteps();
  }

  @Post('step')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '사용 순서 등록' })
  createStep(@Body() body: Partial<LaundryStep>) {
    return this.laundryService.createStep(body);
  }

  @Put('step/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '사용 순서 수정' })
  updateStep(@Param('id') id: string, @Body() body: Partial<LaundryStep>) {
    return this.laundryService.updateStep(+id, body);
  }

  @Delete('step/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '사용 순서 삭제' })
  removeStep(@Param('id') id: string) {
    return this.laundryService.removeStep(+id);
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
    const translated = await this.laundryService.translateText(body.text);
    return { translated };
  }
}
