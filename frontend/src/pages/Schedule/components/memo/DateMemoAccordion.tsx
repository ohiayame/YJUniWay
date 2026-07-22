import { useState } from 'react';
import NotesIcon from '@mui/icons-material/Notes';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useAppSelector } from '../../../../store';
import { selectMemo, selectBlockCount } from '../../../../store/slices/memoSlice';
import { formatLabel } from '../../utils';
import MemoPanel from './MemoPanel';

const countTagStyle = (bg: string, color: string): React.CSSProperties => ({
  fontSize: 10, fontWeight: 700, borderRadius: 8, padding: '2px 6px', background: bg, color,
});

// 날짜 기준(target_type='date') 관리자 메모 — 기본 접힘, 배지로 줄 수만 알림
const DateMemoAccordion = ({ selectedDate, isKo }: { selectedDate: string; isKo: boolean }) => {
  const [open, setOpen] = useState(false);

  const target = { targetType: 'date' as const, targetDate: selectedDate, scheduleId: null };
  const sharedMemo = useAppSelector((state) => selectMemo(state, { ...target, visibility: 'shared' }));
  const sharedCount = useAppSelector((state) => selectBlockCount(state, sharedMemo?.id));
  const privateMemo = useAppSelector((state) => selectMemo(state, { ...target, visibility: 'private' }));
  const privateCount = useAppSelector((state) => selectBlockCount(state, privateMemo?.id));

  return (
    <div style={{ border: '1px solid #ece9f2', background: '#f8f7fc', borderRadius: 12, marginBottom: 14, overflow: 'hidden' }}>
      <div
        onClick={() => setOpen((o) => !o)}
        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', cursor: 'pointer', userSelect: 'none' }}
      >
        <NotesIcon sx={{ fontSize: 15, color: '#4d4a7a', flexShrink: 0 }} />
        <span style={{ flex: 1, fontSize: 12.5, fontWeight: 600, color: '#2c2a44' }}>
          {formatLabel(selectedDate, isKo)} {isKo ? '메모' : 'のメモ'}
        </span>
        <span style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
          <span style={countTagStyle('#e3f2fd', '#1565c0')}>
            {isKo ? `공유 ${sharedCount}줄` : `共有 ${sharedCount}行`}
          </span>
          <span style={countTagStyle('#eceefa', '#4d4a7a')}>
            {isKo ? `나 ${privateCount}줄` : `自分 ${privateCount}行`}
          </span>
        </span>
        <ExpandMoreIcon sx={{
          fontSize: 16, color: '#b4b0c8', flexShrink: 0,
          transition: 'transform .18s ease', transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
        }} />
      </div>
      <div style={{
        maxHeight: open ? 720 : 0, opacity: open ? 1 : 0, overflow: 'hidden',
        transition: 'max-height .22s ease, opacity .18s ease',
        borderTop: open ? '1px solid #ece9f2' : 'none',
        padding: open ? '10px 12px 12px' : '0 12px',
      }}>
        <MemoPanel targetType="date" targetDate={selectedDate} scheduleId={null} isKo={isKo} />
      </div>
    </div>
  );
};

export default DateMemoAccordion;
