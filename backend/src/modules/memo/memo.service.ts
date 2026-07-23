import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Memo, MemoTargetType, MemoVisibility } from './memo.entity';
import { MemoBlock, MemoBlockType } from './memo-block.entity';
import { AdminRole } from '../admin/admin.entity';

export interface MemoTarget {
  targetType: MemoTargetType;
  targetDate: string | null;
  scheduleId: number | null;
}

export interface CurrentAdmin {
  id: number;
  role: AdminRole;
}

@Injectable()
export class MemoService {
  constructor(
    @InjectRepository(Memo)
    private readonly memoRepo: Repository<Memo>,
    @InjectRepository(MemoBlock)
    private readonly blockRepo: Repository<MemoBlock>,
  ) {}

  // 대상(날짜/일정)의 공유 메모 + 로그인한 관리자 본인의 개인 메모를 함께 조회
  async findByTarget(target: MemoTarget, currentAdminId: number) {
    const shared = await this.findMemo(target, MemoVisibility.SHARED);
    const own = await this.findMemo(
      target,
      MemoVisibility.PRIVATE,
      currentAdminId,
    );
    return {
      shared: shared ? await this.withBlocks(shared) : null,
      private: own ? await this.withBlocks(own) : null,
    };
  }

  // 줄 추가 — 대상 문서가 없으면 새로 만들고(find-or-create), insertAfterBlockId 뒤에 끼워 넣음(없으면 맨 끝)
  // 개인 메모(private)는 (대상, authorAdminId) 조합으로 관리자별로 완전히 분리됨
  async addBlock(
    target: MemoTarget,
    visibility: MemoVisibility,
    currentAdmin: CurrentAdmin,
    type: MemoBlockType,
    content: string,
    insertAfterBlockId?: number,
  ) {
    const authorFilter =
      visibility === MemoVisibility.PRIVATE ? currentAdmin.id : undefined;
    let memo = await this.findMemo(target, visibility, authorFilter);
    if (!memo) {
      memo = await this.memoRepo.save(
        this.memoRepo.create({
          ...target,
          visibility,
          authorAdminId: currentAdmin.id,
        }),
      );
    }

    const siblings = await this.blockRepo.find({
      where: { memoId: memo.id },
      order: { sortOrder: 'ASC' },
    });

    const newBlock = await this.blockRepo.save(
      this.blockRepo.create({
        memoId: memo.id,
        type,
        content: content.trim(),
        isChecked: false,
        sortOrder: siblings.length,
      }),
    );

    const orderedIds = siblings.map((b) => b.id);
    const insertIndex = insertAfterBlockId
      ? orderedIds.indexOf(insertAfterBlockId) + 1
      : orderedIds.length;
    orderedIds.splice(insertIndex, 0, newBlock.id);

    await Promise.all(
      orderedIds.map((id, index) =>
        this.blockRepo.update(id, { sortOrder: index }),
      ),
    );

    return this.withBlocks(memo);
  }

  // 줄 내용 수정 — 비우면(trim 결과 빈 문자열) 그 줄을 삭제 (문서가 비면 문서도 함께 삭제)
  async updateBlockContent(
    blockId: number,
    content: string,
    currentAdmin: CurrentAdmin,
  ) {
    const { block, memo } = await this.findBlockWithMemo(blockId);
    this.assertCanEditBlock(memo, currentAdmin);

    const trimmed = content.trim();
    if (!trimmed) {
      await this.blockRepo.delete(blockId);
      const remaining = await this.blockRepo.count({
        where: { memoId: memo.id },
      });
      if (remaining === 0) {
        await this.memoRepo.delete(memo.id);
        return { deleted: true, memoDeleted: true };
      }
      return { deleted: true, memoDeleted: false };
    }

    block.content = trimmed;
    return {
      deleted: false,
      memoDeleted: false,
      block: await this.blockRepo.save(block),
    };
  }

  async toggleBlockChecked(blockId: number, currentAdmin: CurrentAdmin) {
    const { block, memo } = await this.findBlockWithMemo(blockId);
    this.assertCanEditBlock(memo, currentAdmin);

    block.isChecked = !block.isChecked;
    return this.blockRepo.save(block);
  }

  // 문서 전체 삭제 — 작성자 본인 또는 교수만 가능 (memo_blocks는 FK CASCADE로 함께 삭제)
  async removeMemo(memoId: number, currentAdmin: CurrentAdmin) {
    const memo = await this.memoRepo.findOne({ where: { id: memoId } });
    if (!memo) throw new NotFoundException('메모를 찾을 수 없습니다.');
    if (
      currentAdmin.role !== AdminRole.PROFESSOR &&
      memo.authorAdminId !== currentAdmin.id
    ) {
      throw new ForbiddenException(
        '작성자 본인 또는 교수만 삭제할 수 있습니다.',
      );
    }
    await this.memoRepo.delete(memoId);
  }

  private async findMemo(
    target: MemoTarget,
    visibility: MemoVisibility,
    authorAdminId?: number,
  ): Promise<Memo | null> {
    return this.memoRepo.findOne({
      where: {
        targetType: target.targetType,
        targetDate:
          target.targetType === MemoTargetType.DATE
            ? (target.targetDate as string)
            : IsNull(),
        scheduleId:
          target.targetType === MemoTargetType.SCHEDULE
            ? (target.scheduleId as number)
            : IsNull(),
        visibility,
        ...(authorAdminId !== undefined ? { authorAdminId } : {}),
      },
    });
  }

  private async findBlockWithMemo(
    blockId: number,
  ): Promise<{ block: MemoBlock; memo: Memo }> {
    const block = await this.blockRepo.findOne({ where: { id: blockId } });
    if (!block) throw new NotFoundException('메모 줄을 찾을 수 없습니다.');
    const memo = await this.memoRepo.findOne({ where: { id: block.memoId } });
    if (!memo) throw new NotFoundException('메모를 찾을 수 없습니다.');
    return { block, memo };
  }

  private assertCanEditBlock(memo: Memo, currentAdmin: CurrentAdmin) {
    if (
      memo.visibility === MemoVisibility.PRIVATE &&
      memo.authorAdminId !== currentAdmin.id
    ) {
      throw new ForbiddenException('본인의 개인 메모만 수정할 수 있습니다.');
    }
  }

  private async withBlocks(
    memo: Memo,
  ): Promise<Memo & { blocks: MemoBlock[] }> {
    const blocks = await this.blockRepo.find({
      where: { memoId: memo.id },
      order: { sortOrder: 'ASC' },
    });
    return { ...memo, blocks };
  }
}
