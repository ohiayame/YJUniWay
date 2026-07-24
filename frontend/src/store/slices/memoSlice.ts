/**
 * memoSlice.ts
 *
 * 일정 페이지의 관리자 메모(날짜 기준 / 일정 기준, 공유 / 나만보기) 상태.
 * `frontend/src/api/memo.ts`를 통해 백엔드 memo/memo-block API와 통신하는 비동기 thunk로 구성됩니다.
 *
 * 대상+visibility 조합(targetType, targetDate/scheduleId, private/shared)마다 캐시 엔트리를 하나 두고,
 * 조회는 fetchMemosByTarget으로 채우고, 변경 계열 thunk(addMemoLine 등)는 매번 서버를 다시 조회하지 않고
 * 각 API 응답(전체 갱신된 문서 또는 변경된 줄)으로 해당 엔트리만 직접 갱신합니다.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getMemosByTarget,
  addMemoBlock,
  updateMemoBlockContent,
  toggleMemoBlockChecked,
  removeMemoDoc,
} from '../../api/memo';
import type {
  MemoDto,
  MemoBlockDto,
  MemoTargetType,
  MemoVisibility,
  MemoBlockType,
} from '../../api/memo';

export type { MemoTargetType, MemoVisibility, MemoBlockType };
export type Memo = MemoDto;
export type MemoBlock = MemoBlockDto;

interface MemoTarget {
  targetType: MemoTargetType;
  targetDate: string | null;
  scheduleId: number | null;
}

type LoadStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

interface MemoTargetEntry {
  shared: Memo | null;
  private: Memo | null;
  status: LoadStatus;
}

interface MemoState {
  byTarget: Record<string, MemoTargetEntry>;
}

const initialState: MemoState = { byTarget: {} };

function targetKey(target: MemoTarget): string {
  return `${target.targetType}:${target.targetDate ?? ''}:${target.scheduleId ?? ''}`;
}

function emptyEntry(): MemoTargetEntry {
  return { shared: null, private: null, status: 'idle' };
}

// 대상(날짜/일정)의 공유+개인 메모를 함께 조회
export const fetchMemosByTarget = createAsyncThunk(
  'memo/fetchByTarget',
  async (target: MemoTarget) => ({ target, res: await getMemosByTarget(target) }),
);

// 줄 추가 — 대상 문서가 없으면 서버에서 새로 생성됨(find-or-create)
export const addMemoLine = createAsyncThunk(
  'memo/addLine',
  async (payload: MemoTarget & {
    visibility: MemoVisibility;
    type: MemoBlockType;
    content: string;
    insertAfterBlockId?: number | null;
  }) => {
    const { visibility, type, content, insertAfterBlockId, ...target } = payload;
    const memo = await addMemoBlock({ ...target, visibility, type, content, insertAfterBlockId });
    return { target, visibility, memo };
  },
);

// 줄 내용 수정 — 비우면 서버에서 자동 삭제(문서가 비면 문서도 함께 삭제)
export const editMemoLine = createAsyncThunk(
  'memo/editLine',
  async (payload: MemoTarget & { visibility: MemoVisibility; blockId: number; content: string }) => {
    const { visibility, blockId, content, ...target } = payload;
    const result = await updateMemoBlockContent(blockId, content);
    return { target, visibility, blockId, result };
  },
);

export const toggleMemoLine = createAsyncThunk(
  'memo/toggleLine',
  async (payload: MemoTarget & { visibility: MemoVisibility; blockId: number }) => {
    const { visibility, blockId, ...target } = payload;
    const block = await toggleMemoBlockChecked(blockId);
    return { target, visibility, block };
  },
);

// 문서 전체 삭제 (작성자 본인 또는 관리자만 호출 가능하도록 컴포넌트에서 버튼 노출을 제한)
export const removeMemoDocThunk = createAsyncThunk(
  'memo/removeDoc',
  async (payload: MemoTarget & { visibility: MemoVisibility; memoId: number }) => {
    const { visibility, memoId, ...target } = payload;
    await removeMemoDoc(memoId);
    return { target, visibility, memoId };
  },
);

const memoSlice = createSlice({
  name: 'memo',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMemosByTarget.pending, (state, action) => {
        const key = targetKey(action.meta.arg);
        const entry = state.byTarget[key] ?? emptyEntry();
        entry.status = 'loading';
        state.byTarget[key] = entry;
      })
      .addCase(fetchMemosByTarget.fulfilled, (state, action) => {
        const key = targetKey(action.payload.target);
        state.byTarget[key] = {
          shared: action.payload.res.shared,
          private: action.payload.res.private,
          status: 'succeeded',
        };
      })
      .addCase(fetchMemosByTarget.rejected, (state, action) => {
        const key = targetKey(action.meta.arg);
        const entry = state.byTarget[key] ?? emptyEntry();
        entry.status = 'failed';
        state.byTarget[key] = entry;
      })

      .addCase(addMemoLine.fulfilled, (state, action) => {
        const { target, visibility, memo } = action.payload;
        const key = targetKey(target);
        const entry = state.byTarget[key] ?? emptyEntry();
        entry[visibility] = memo;
        entry.status = 'succeeded';
        state.byTarget[key] = entry;
      })

      .addCase(editMemoLine.fulfilled, (state, action) => {
        const { target, visibility, blockId, result } = action.payload;
        const entry = state.byTarget[targetKey(target)];
        const memo = entry?.[visibility];
        if (!entry || !memo) return;

        if (result.deleted) {
          if (result.memoDeleted) {
            entry[visibility] = null;
          } else {
            memo.blocks = memo.blocks.filter((b) => b.id !== blockId);
          }
        } else if (result.block) {
          const block = memo.blocks.find((b) => b.id === blockId);
          if (block) Object.assign(block, result.block);
        }
      })

      .addCase(toggleMemoLine.fulfilled, (state, action) => {
        const { target, visibility, block } = action.payload;
        const memo = state.byTarget[targetKey(target)]?.[visibility];
        const existing = memo?.blocks.find((b) => b.id === block.id);
        if (existing) Object.assign(existing, block);
      })

      .addCase(removeMemoDocThunk.fulfilled, (state, action) => {
        const { target, visibility } = action.payload;
        const entry = state.byTarget[targetKey(target)];
        if (entry) entry[visibility] = null;
      });
  },
});

export default memoSlice.reducer;

// ─── 셀렉터 헬퍼 ────────────────────────────────────────────────────────────
interface MemoRootState {
  memo: MemoState;
}

export const selectMemo = (
  state: MemoRootState,
  target: MemoTarget & { visibility: MemoVisibility },
): Memo | undefined => state.memo.byTarget[targetKey(target)]?.[target.visibility] ?? undefined;

export const selectMemoStatus = (state: MemoRootState, target: MemoTarget): LoadStatus =>
  state.memo.byTarget[targetKey(target)]?.status ?? 'idle';

function findMemoById(state: MemoState, memoId: number | undefined): Memo | undefined {
  if (memoId === undefined) return undefined;
  for (const entry of Object.values(state.byTarget)) {
    if (entry.shared?.id === memoId) return entry.shared;
    if (entry.private?.id === memoId) return entry.private;
  }
  return undefined;
}

const EMPTY_BLOCKS: MemoBlock[] = [];

export const selectBlocks = (state: MemoRootState, memoId: number | undefined): MemoBlock[] =>
  findMemoById(state.memo, memoId)?.blocks ?? EMPTY_BLOCKS;

// 배지처럼 개수만 필요한 곳에서 쓰는 셀렉터 — 숫자를 반환하므로 매번 새 배열을 만드는 selectBlocks와 달리
// react-redux의 참조 비교 경고 없이 안전하게 useAppSelector에 바로 쓸 수 있음
export const selectBlockCount = (state: MemoRootState, memoId: number | undefined): number =>
  findMemoById(state.memo, memoId)?.blocks.length ?? 0;
