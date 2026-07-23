import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { MemoService } from './memo.service';
import { MemoTargetType, MemoVisibility } from './memo.entity';
import { MemoBlockType } from './memo-block.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminRole } from '../admin/admin.entity';

interface RequestWithUser extends Request {
  user: { id: number; role: AdminRole };
}

interface AddBlockBody {
  targetType: MemoTargetType;
  targetDate?: string | null;
  scheduleId?: number | null;
  visibility: MemoVisibility;
  type: MemoBlockType;
  content: string;
  insertAfterBlockId?: number | null;
}

// 일정 페이지의 관리자 메모(날짜 기준 / 일정 기준, 공유 / 나만보기) API.
// 메모 UI 자체가 관리자 로그인 후에만 노출되므로 컨트롤러 전체에 인증을 요구함.
@ApiTags('memo')
@Controller('memo')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MemoController {
  constructor(private readonly memoService: MemoService) {}

  // GET /api/memo?targetType=date&targetDate=2026-04-07
  // GET /api/memo?targetType=schedule&scheduleId=14
  @Get()
  @ApiOperation({
    summary: '대상의 공유 메모 + 로그인 관리자 본인의 개인 메모 조회',
  })
  @ApiQuery({ name: 'targetType', enum: MemoTargetType })
  @ApiQuery({ name: 'targetDate', required: false, example: '2026-04-07' })
  @ApiQuery({ name: 'scheduleId', required: false, example: '14' })
  findByTarget(
    @Query('targetType') targetType: MemoTargetType,
    @Query('targetDate') targetDate: string | undefined,
    @Query('scheduleId') scheduleId: string | undefined,
    @Req() req: RequestWithUser,
  ) {
    return this.memoService.findByTarget(
      {
        targetType,
        targetDate:
          targetType === MemoTargetType.DATE ? (targetDate ?? null) : null,
        scheduleId:
          targetType === MemoTargetType.SCHEDULE && scheduleId
            ? +scheduleId
            : null,
      },
      req.user.id,
    );
  }

  // POST /api/memo/blocks — 줄 추가 (대상 문서가 없으면 새로 생성, find-or-create)
  @Post('blocks')
  @ApiOperation({ summary: '메모 줄 추가' })
  addBlock(@Body() body: AddBlockBody, @Req() req: RequestWithUser) {
    return this.memoService.addBlock(
      {
        targetType: body.targetType,
        targetDate:
          body.targetType === MemoTargetType.DATE
            ? (body.targetDate ?? null)
            : null,
        scheduleId:
          body.targetType === MemoTargetType.SCHEDULE
            ? (body.scheduleId ?? null)
            : null,
      },
      body.visibility,
      req.user,
      body.type,
      body.content,
      body.insertAfterBlockId ?? undefined,
    );
  }

  // PATCH /api/memo/blocks/:id — 줄 내용 수정 (비우면 자동 삭제)
  @Patch('blocks/:id')
  @ApiOperation({ summary: '메모 줄 내용 수정 (비우면 자동 삭제)' })
  updateBlockContent(
    @Param('id') id: string,
    @Body() body: { content: string },
    @Req() req: RequestWithUser,
  ) {
    return this.memoService.updateBlockContent(+id, body.content, req.user);
  }

  @Patch('blocks/:id/toggle')
  @ApiOperation({ summary: '체크박스 줄 체크 토글' })
  toggleBlockChecked(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.memoService.toggleBlockChecked(+id, req.user);
  }

  // DELETE /api/memo/:id — 문서 전체 삭제 (작성자 본인 또는 교수)
  @Delete(':id')
  @ApiOperation({ summary: '메모 문서 전체 삭제 (작성자 본인 또는 교수)' })
  removeMemo(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.memoService.removeMemo(+id, req.user);
  }
}
