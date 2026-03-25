import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { Admin } from './admin.entity';

@ApiTags('admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('login')
  @ApiOperation({ summary: '관리자 로그인' })
  login(@Body() body: { studentId: string; password: string }) {
    return this.adminService.login(body.studentId, body.password);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: '관리자 목록 조회' })
  findAll() {
    return this.adminService.findAll();
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: '관리자 등록' })
  create(@Body() body: Partial<Admin>) {
    return this.adminService.create(body);
  }

  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '관리자 수정' })
  update(@Param('id') id: string, @Body() body: Partial<Admin>) {
    return this.adminService.update(+id, body);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '관리자 삭제' })
  remove(@Param('id') id: string) {
    return this.adminService.remove(+id);
  }
}
