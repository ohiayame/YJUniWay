import { useState } from 'react';
import { shallowEqual } from 'react-redux';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAppDispatch, useAppSelector } from '../../../../store';
import {
  addBlock, updateBlockContent, toggleBlockChecked, removeMemo,
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
const MemoDoc = ({ targetType, targetDate, scheduleId, visibility, isKo, emptyHint }: MemoDocProps) => {
  const dispatch = useAppDispatch();
  const { name, role } = useAppSelector((state) => state.auth);
  const target = { targetType, targetDate, scheduleId, visibility };
  const memo = useAppSelector((state) => selectMemo(state, target));
  const blocks = useAppSelector((state) => selectBlocks(state, memo?.id), shallowEqual);
  const nextBlockId = useAppSelector((state) => state.memo.nextBlockId);

  const [draft, setDraft] = useState<Draft>(null);
  // 줄이 하나도 없으면(처음이거나, 다 지워져서 다시 비었거나) 항상 입력줄이 열려있어야 함 — 렌더 중 파생
  const effectiveDraft: Draft = blocks.length === 0 ? { afterId: null } : draft;

  // 임시: 실제 author_admin_id 연동 전까지는 로그인 이름으로 "작성자 본인" 여부를 판단
  const authorName = name ?? (isKo ? '관리자' : '管理者');
  const canDeleteAll = !!memo && (role === 'professor' || memo.authorName === authorName);

  const commitLine = (type: MemoBlockType, content: string, insertAfterBlockId: number | null) => {
    dispatch(addBlock({ ...target, authorName, type, content, insertAfterBlockId }));
    setDraft({ afterId: nextBlockId });
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
              : (isKo ? `${memo.authorName}님이 시작` : `${memo.authorName}さんが開始`)}
          </span>
          {canDeleteAll && (
            <button
              type="button"
              onClick={() => { dispatch(removeMemo({ memoId: memo.id })); setDraft(null); }}
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
            onToggleCheck={() => dispatch(toggleBlockChecked({ blockId: block.id }))}
            onCommitEdit={(content) => dispatch(updateBlockContent({ blockId: block.id, content }))}
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
