import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { AppSettings } from './app-settings.entity';
import { EmergencyContact } from './emergency-contact.entity';

@ApiTags('settings')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiOperation({ summary: '앱 설정 조회' })
  getSettings() {
    return this.settingsService.getSettings();
  }

  @Put()
  @ApiBearerAuth()
  @ApiOperation({ summary: '앱 설정 수정 (통금, WiFi, 주소, 공지 등)' })
  updateSettings(@Body() body: Partial<AppSettings>) {
    return this.settingsService.updateSettings(body);
  }

  // 긴급 연락처 ------------------------------------------

  @Get('contacts')
  @ApiOperation({ summary: '긴급 연락처 목록 조회' })
  findAllContacts() {
    return this.settingsService.findAllContacts();
  }

  @Post('contacts')
  @ApiBearerAuth()
  @ApiOperation({ summary: '긴급 연락처 등록' })
  createContact(@Body() body: Partial<EmergencyContact>) {
    return this.settingsService.createContact(body);
  }

  @Put('contacts/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '긴급 연락처 수정' })
  updateContact(@Param('id') id: string, @Body() body: Partial<EmergencyContact>) {
    return this.settingsService.updateContact(+id, body);
  }

  @Delete('contacts/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '긴급 연락처 삭제' })
  removeContact(@Param('id') id: string) {
    return this.settingsService.removeContact(+id);
  }
}
