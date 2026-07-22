/**
 * memoSlice.ts
 *
 * 일정 페이지의 관리자 메모(날짜 기준 / 일정 기준, 공유 / 나만보기) 상태.
 * 백엔드 memo/memo-block API가 아직 없어 지금은 mock/memoData.ts로 시드한 값을
 * 순수 클라이언트 상태로 관리합니다. API가 준비되면 이 슬라이스의 CRUD 리듀서를
 * 서버 호출(비동기 thunk)로 교체하되, 컴포넌트 쪽 인터페이스(Memo/MemoBlock 타입,
 * 액션 payload 모양)는 최대한 그대로 유지하는 것을 목표로 합니다.
 *
 * 대상당 문서 하나 규칙: (targetType, targetDate/scheduleId, visibility) 조합마다
 * memos row는 최대 1개만 존재하도록 addBlock에서 find-or-create로 보장합니다.
 * (개인 메모는 관리자별로 이미 분리되어 있으므로 author 구분을 추가로 두지 않음)
 */

import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { initialMemos, initialMemoBlocks, initialNextMemoId, initialNextBlockId } from '../../mock/memoData';

export type MemoTargetType = 'date' | 'schedule';
export type MemoVisibility = 'private' | 'shared';
export type MemoBlockType = 'text' | 'checkbox';

export interface Memo {
  id: number;
  targetType: MemoTargetType;
  targetDate: string | null;
  scheduleId: number | null;
  visibility: MemoVisibility;
  authorName: string; // 임시: 실제 연동 시 author_admin_id 기준으로 관리자 테이블과 조인
  createdAt: string;  // ISO
}

export interface MemoBlock {
  id: number;
  memoId: number;
  type: MemoBlockType;
  content: string;
  isChecked: boolean;
  sortOrder: number;
}

interface MemoTarget {
  targetType: MemoTargetType;
  targetDate: string | null;
  scheduleId: number | null;
  visibility: MemoVisibility;
}

interface MemoState {
  memos: Memo[];
  blocks: MemoBlock[];
  nextMemoId: number;
  nextBlockId: number;
}

const initialState: MemoState = {
  memos: initialMemos,
  blocks: initialMemoBlocks,
  nextMemoId: initialNextMemoId,
  nextBlockId: initialNextBlockId,
};

function matchesTarget(memo: Memo, target: MemoTarget): boolean {
  return memo.targetType === target.targetType
    && memo.targetDate === target.targetDate
    && memo.scheduleId === target.scheduleId
    && memo.visibility === target.visibility;
}

function removeBlockAndEmptyMemo(state: MemoState, blockId: number) {
  const block = state.blocks.find((b) => b.id === blockId);
  if (!block) return;
  state.blocks = state.blocks.filter((b) => b.id !== blockId);
  const hasMoreBlocks = state.blocks.some((b) => b.memoId === block.memoId);
  if (!hasMoreBlocks) {
    state.memos = state.memos.filter((m) => m.id !== block.memoId);
  }
}

const memoSlice = createSlice({
  name: 'memo',
  initialState,
  reducers: {
    // 줄 추가 — 대상 문서가 없으면 새로 만들고(find-or-create), insertAfterBlockId 뒤에 끼워 넣음(없으면 맨 끝)
    addBlock(state, action: PayloadAction<MemoTarget & {
      authorName: string;
      type: MemoBlockType;
      content: string;
      insertAfterBlockId?: number | null;
    }>) {
      const { authorName, type, content, insertAfterBlockId, ...target } = action.payload;

      let memo = state.memos.find((m) => matchesTarget(m, target));
      if (!memo) {
        memo = { id: state.nextMemoId, ...target, authorName, createdAt: new Date().toISOString() };
        state.nextMemoId += 1;
        state.memos.push(memo);
      }
      const memoId = memo.id;

      const siblingIds = state.blocks
        .filter((b) => b.memoId === memoId)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((b) => b.id);

      const newBlockId = state.nextBlockId;
      state.nextBlockId += 1;

      const insertIndex = insertAfterBlockId ? siblingIds.indexOf(insertAfterBlockId) + 1 : siblingIds.length;
      siblingIds.splice(insertIndex, 0, newBlockId);

      state.blocks.push({ id: newBlockId, memoId, type, content, isChecked: false, sortOrder: 0 });
      state.blocks.forEach((b) => {
        if (b.memoId === memoId) b.sortOrder = siblingIds.indexOf(b.id);
      });
    },

    // 줄 내용 수정 — 비우면(trim 결과 빈 문자열) 그 줄을 삭제 (문서가 비면 문서도 함께 삭제)
    updateBlockContent(state, action: PayloadAction<{ blockId: number; content: string }>) {
      const trimmed = action.payload.content.trim();
      if (!trimmed) {
        removeBlockAndEmptyMemo(state, action.payload.blockId);
        return;
      }
      const block = state.blocks.find((b) => b.id === action.payload.blockId);
      if (block) block.content = trimmed;
    },

    toggleBlockChecked(state, action: PayloadAction<{ blockId: number }>) {
      const block = state.blocks.find((b) => b.id === action.payload.blockId);
      if (block) block.isChecked = !block.isChecked;
    },

    // 문서 전체 삭제 (작성자 본인 또는 교수만 호출 가능하도록 컴포넌트에서 버튼 노출을 제한)
    removeMemo(state, action: PayloadAction<{ memoId: number }>) {
      state.memos = state.memos.filter((m) => m.id !== action.payload.memoId);
      state.blocks = state.blocks.filter((b) => b.memoId !== action.payload.memoId);
    },
  },
});

export const { addBlock, updateBlockContent, toggleBlockChecked, removeMemo } = memoSlice.actions;
export default memoSlice.reducer;

// ─── 셀렉터 헬퍼 ────────────────────────────────────────────────────────────
interface MemoRootState {
  memo: MemoState;
}

export const selectMemo = (state: MemoRootState, target: MemoTarget): Memo | undefined =>
  state.memo.memos.find((m) => matchesTarget(m, target));

const EMPTY_BLOCKS: MemoBlock[] = [];

export const selectBlocks = (state: MemoRootState, memoId: number | undefined): MemoBlock[] =>
  memoId === undefined
    ? EMPTY_BLOCKS
    : state.memo.blocks.filter((b) => b.memoId === memoId).sort((a, b) => a.sortOrder - b.sortOrder);

// 배지처럼 개수만 필요한 곳에서 쓰는 셀렉터 — 숫자를 반환하므로 매번 새 배열을 만드는 selectBlocks와 달리
// react-redux의 참조 비교 경고 없이 안전하게 useAppSelector에 바로 쓸 수 있음
export const selectBlockCount = (state: MemoRootState, memoId: number | undefined): number =>
  memoId === undefined ? 0 : state.memo.blocks.reduce((count, b) => (b.memoId === memoId ? count + 1 : count), 0);

export const selectNextBlockId = (state: MemoRootState): number => state.memo.nextBlockId;
