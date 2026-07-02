import {
  Controller, Get, Post, Put, Delete,
  Param, Body, Query,
  UploadedFile, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiConsumes } from '@nestjs/swagger';
import { StudentService } from './student.service';
import { Student } from './student.entity';

@ApiTags('student')
@Controller('student')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  // GET /api/student → students 테이블 전체 조회
  @Get()
  @ApiOperation({ summary: '학생 명단 조회' })
  findAll() {
    return this.studentService.findAll();
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: '학생 등록' })
  create(@Body() body: Partial<Student>) {
    return this.studentService.create(body);
  }

  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '학생 정보 수정' })
  update(@Param('id') id: string, @Body() body: Partial<Student>) {
    return this.studentService.update(+id, body);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '학생 삭제' })
  remove(@Param('id') id: string) {
    return this.studentService.remove(+id);
  }

  @Post('parse-document')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'PDF/이미지에서 학생 명단 추출 (Claude AI)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 20 * 1024 * 1024 } }))
  parseDocument(@UploadedFile() file: Express.Multer.File) {
    return this.studentService.parseDocument(file);
  }

  // 점호 --------------------------------------------------

  @Get('roll-call')
  @ApiBearerAuth()
  @ApiOperation({ summary: '점호 목록 조회 (날짜별)' })
  @ApiQuery({ name: 'date', example: '2025-03-25' })
  getRollCall(@Query('date') date: string) {
    return this.studentService.getRollCall(date);
  }

  @Put('roll-call/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '점호 체크 업데이트' })
  updateRollCall(
    @Param('id') id: string,
    @Body() body: { isPresent: boolean },
  ) {
    return this.studentService.updateRollCall(+id, body.isPresent);
  }
}
