import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { Admin, AdminRole } from './admin.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('login')
  @ApiOperation({ summary: '관리자 로그인' })
  login(@Body() body: { studentId: string; password: string }) {
    return this.adminService.login(body.studentId, body.password);
  }

  // GET /api/admin → admins 테이블 전체 조회 (password 제외), 교수 전용
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AdminRole.PROFESSOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: '관리자 목록 조회 (교수 전용)' })
  findAll() {
    return this.adminService.findAll();
  }

  // 스태프 가입 신청 (미인증 상태로 호출됨 — 인증 요구하지 않음)
  @Post()
  @ApiOperation({ summary: '관리자 등록 (스태프 가입 신청)' })
  create(@Body() body: Partial<Admin>) {
    return this.adminService.create(body);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AdminRole.PROFESSOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: '관리자 수정 (교수 전용)' })
  update(@Param('id') id: string, @Body() body: Partial<Admin>) {
    return this.adminService.update(+id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AdminRole.PROFESSOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: '관리자 삭제 (교수 전용)' })
  remove(@Param('id') id: string) {
    return this.adminService.remove(+id);
  }
}
