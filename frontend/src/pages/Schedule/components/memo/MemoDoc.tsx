import { useState } from 'react';
import { shallowEqual } from 'react-redux';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAppDispatch, useAppSelector } from '../../../../store';
import {
  addMemoLine, editMemoLine, toggleMemoLine, removeMemoDocThunk,
  selectMemo, selectBlocks,
} from '../../../../store/slices/memoSlice';
import type { MemoTargetType, MemoVisibility, MemoBlockType } from '../../../../store/slices/memoSlice';
import MemoBlockRow from './MemoBlockRow';
import MemoNewLineInput from './MemoNewLineInput';

// 활성 입력줄 위치: null = 아직 없음, { afterId: null } = 맨 끝, { afterId: N } = N번 줄 바로 뒤
type Draft = { afterId: number | null } | null;

interface MemoDocProps {
  targetType: MemoTargetType;
  targetDate: string | null;
  scheduleId: number | null;
  visibility: MemoVisibility;
  isKo: boolean;
  emptyHint: string;
}

// 문서 하나(공유 1개 또는 나만보기 1개)의 헤더 + 줄 목록 + 입력줄 관리
// 대상 데이터 자체의 조회(fetchMemosByTarget)는 부모(MemoPanel/ScheduleMemoBadge)에서 트리거하며,
// 이 컴포넌트는 스토어에 이미 채워진 데이터만 읽어서 렌더링/변경 요청만 담당한다.
const MemoDoc = ({ targetType, targetDate, scheduleId, visibility, isKo, emptyHint }: MemoDocProps) => {
  const dispatch = useAppDispatch();
  const { id: currentAdminId, role } = useAppSelector((state) => state.auth);
  const target = { targetType, targetDate, scheduleId };
  const memo = useAppSelector((state) => selectMemo(state, { ...target, visibility }));
  const blocks = useAppSelector((state) => selectBlocks(state, memo?.id), shallowEqual);

  const [draft, setDraft] = useState<Draft>(null);
  // 줄이 하나도 없으면(처음이거나, 다 지워져서 다시 비었거나) 항상 입력줄이 열려있어야 함 — 렌더 중 파생
  const effectiveDraft: Draft = blocks.length === 0 ? { afterId: null } : draft;

  const canDeleteAll = !!memo && (role === 'professor' || memo.authorAdminId === currentAdminId);

  const commitLine = async (type: MemoBlockType, content: string, insertAfterBlockId: number | null) => {
    const { memo: updated } = await dispatch(
      addMemoLine({ ...target, visibility, type, content, insertAfterBlockId }),
    ).unwrap();
    const newBlockId = Math.max(...updated.blocks.map((b) => b.id));
    setDraft({ afterId: newBlockId });
  };

  return (
    <div>
      {memo && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
          marginBottom: 8, paddingBottom: 8, borderBottom: '1px solid #f2f0fa',
        }}>
          <span style={{ fontSize: 10.5, fontWeight: 700, color: '#a29fc0' }}>
            {visibility === 'private'
              ? (isKo ? '내 메모' : '自分のメモ')
              : (isKo ? '공유 메모' : '共有メモ')}
          </span>
          {canDeleteAll && (
            <button
              type="button"
              onClick={() => {
                dispatch(removeMemoDocThunk({ ...target, visibility, memoId: memo.id }));
                setDraft(null);
              }}
              style={{
                border: 'none', background: 'transparent', color: '#c9a3a3',
                fontSize: 10.5, fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 3, padding: 0,
              }}
            >
              <DeleteIcon sx={{ fontSize: 11 }} />
              {isKo ? '전체 삭제' : '全て削除'}
            </button>
          )}
        </div>
      )}

      {blocks.map((block) => (
        <div key={block.id}>
          <MemoBlockRow
            block={block}
            onToggleCheck={() => dispatch(toggleMemoLine({ ...target, visibility, blockId: block.id }))}
            onCommitEdit={(content) => dispatch(editMemoLine({ ...target, visibility, blockId: block.id, content }))}
            onEnterAfter={() => setDraft({ afterId: block.id })}
          />
          {effectiveDraft?.afterId === block.id && (
            <MemoNewLineInput
              autoFocus
              isKo={isKo}
              onCommit={(type, content) => commitLine(type, content, block.id)}
              onEmptyBlur={() => setDraft(null)}
            />
          )}
        </div>
      ))}

      {effectiveDraft?.afterId === null && (
        <MemoNewLineInput
          autoFocus={blocks.length > 0}
          isKo={isKo}
          placeholder={emptyHint}
          onCommit={(type, content) => commitLine(type, content, null)}
          onEmptyBlur={blocks.length > 0 ? () => setDraft(null) : undefined}
        />
      )}
    </div>
  );
};

export default MemoDoc;
