import { useEffect, useState } from 'react';
import GroupIcon from '@mui/icons-material/Group';
import LockIcon from '@mui/icons-material/Lock';
import { useAppDispatch } from '../../../../store';
import { fetchMemosByTarget } from '../../../../store/slices/memoSlice';
import type { MemoTargetType, MemoVisibility } from '../../../../store/slices/memoSlice';
import MemoDoc from './MemoDoc';

const tabStyle = (active: boolean, color: string): React.CSSProperties => ({
  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
  padding: '6px 0', borderRadius: 8, fontSize: 11.5, fontWeight: 700, cursor: 'pointer',
  border: `1px solid ${active ? color : '#e2dff0'}`,
  background: active ? color : 'white',
  color: active ? 'white' : '#8a87a3',
});

interface MemoPanelProps {
  targetType: MemoTargetType;
  targetDate: string | null;
  scheduleId: number | null;
  isKo: boolean;
}

// 관리자 메모 패널 — 공유 / 나만보기 탭 + 각각의 MemoDoc
// 날짜 기준(targetDate)과 일정 기준(scheduleId) 어느 쪽이든 이 컴포넌트 하나로 처리
const MemoPanel = ({ targetType, targetDate, scheduleId, isKo }: MemoPanelProps) => {
  const [tab, setTab] = useState<MemoVisibility>('shared');
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchMemosByTarget({ targetType, targetDate, scheduleId }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetType, targetDate, scheduleId]);

  return (
    <div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
        <button type="button" onClick={() => setTab('shared')} style={tabStyle(tab === 'shared', '#1565c0')}>
          <GroupIcon sx={{ fontSize: 12 }} />
          {isKo ? '공유' : '共有'}
        </button>
        <button type="button" onClick={() => setTab('private')} style={tabStyle(tab === 'private', '#3d3a63')}>
          <LockIcon sx={{ fontSize: 12 }} />
          {isKo ? '내 메모' : '自分のメモ'}
        </button>
      </div>

      <div style={{ display: tab === 'shared' ? 'block' : 'none' }}>
        <MemoDoc
          targetType={targetType}
          targetDate={targetDate}
          scheduleId={scheduleId}
          visibility="shared"
          isKo={isKo}
          emptyHint={isKo ? '아직 공유 메모가 없습니다 — 눌러서 입력' : 'まだ共有メモがありません — タップして入力'}
        />
      </div>
      <div style={{ display: tab === 'private' ? 'block' : 'none' }}>
        <MemoDoc
          targetType={targetType}
          targetDate={targetDate}
          scheduleId={scheduleId}
          visibility="private"
          isKo={isKo}
          emptyHint={isKo ? '아직 내 메모가 없습니다 — 눌러서 입력' : 'まだ自分のメモがありません — タップして入力'}
        />
      </div>
    </div>
  );
};

export default MemoPanel;
