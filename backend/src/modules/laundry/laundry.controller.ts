import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { LaundryService } from './laundry.service';

@ApiTags('laundry')
@Controller('laundry')
export class LaundryController {
  constructor(private readonly laundryService: LaundryService) {}

  // GET /api/laundry/settings → laundry_settings 단일 행 조회 (요금, 앱 정보, 미디어 경로)
  @Get('settings')
  @ApiOperation({ summary: '세탁기 설정 조회 (요금, 앱 정보, 이미지/영상 경로)' })
  getSettings() {
    return this.laundryService.getSettings();
  }

  // GET /api/laundry/steps → laundry_steps 전체 조회 (sort_order 오름차순)
  @Get('steps')
  @ApiOperation({ summary: '세탁기 사용 순서 목록 조회' })
  getSteps() {
    return this.laundryService.getSteps();
  }
}
