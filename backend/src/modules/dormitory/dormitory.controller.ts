import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DormitoryService } from './dormitory.service';
import { DormitorySection } from './dormitory-section.entity';
import { DormitoryItem } from './dormitory-item.entity';

@ApiTags('dormitory')
@Controller('dormitory')
export class DormitoryController {
  constructor(private readonly dormitoryService: DormitoryService) {}

  // GET /api/dormitory/floor → dormitory_sections(type=floor) + items 조회 (층별 안내 영역)
  @Get('floor')
  @ApiOperation({ summary: '층별 기숙사 섹션+항목 조회 (B1/1F/2F/4F/ALL)' })
  findFloor() {
    return this.dormitoryService.findFloorSections();
  }

  // GET /api/dormitory/category → dormitory_sections(type=category) + items 조회 (규칙/쓰레기 영역)
  @Get('category')
  @ApiOperation({ summary: '카테고리별 기숙사 섹션+항목 조회 (쓰레기/규칙 등)' })
  findCategory() {
    return this.dormitoryService.findCategorySections();
  }

  @Post('section')
  @ApiBearerAuth()
  @ApiOperation({ summary: '섹션 등록' })
  createSection(@Body() body: Partial<DormitorySection>) {
    return this.dormitoryService.createSection(body);
  }

  @Put('section/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '섹션 수정' })
  updateSection(@Param('id') id: string, @Body() body: Partial<DormitorySection>) {
    return this.dormitoryService.updateSection(+id, body);
  }

  @Delete('section/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '섹션 삭제 (항목 포함)' })
  removeSection(@Param('id') id: string) {
    return this.dormitoryService.removeSection(+id);
  }

  // 항목 --------------------------------------------------

  @Post('item')
  @ApiBearerAuth()
  @ApiOperation({ summary: '항목 등록' })
  createItem(@Body() body: Partial<DormitoryItem>) {
    return this.dormitoryService.createItem(body);
  }

  @Put('item/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '항목 수정' })
  updateItem(@Param('id') id: string, @Body() body: Partial<DormitoryItem>) {
    return this.dormitoryService.updateItem(+id, body);
  }

  @Delete('item/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '항목 삭제' })
  removeItem(@Param('id') id: string) {
    return this.dormitoryService.removeItem(+id);
  }
}
