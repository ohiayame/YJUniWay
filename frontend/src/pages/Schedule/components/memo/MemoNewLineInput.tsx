import { useState } from 'react';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import type { MemoBlockType } from '../../../../store/slices/memoSlice';

const trackStyle: React.CSSProperties = {
  position: 'relative', width: 42, height: 21, borderRadius: 11, flexShrink: 0,
  background: '#ece9f5', border: '1px solid #e2dff0', padding: 0, cursor: 'pointer',
  display: 'flex', alignItems: 'center',
};

const thumbStyle = (type: MemoBlockType): React.CSSProperties => ({
  position: 'absolute', top: 1, left: type === 'checkbox' ? 22 : 1,
  width: 18, height: 18, borderRadius: '50%', background: '#3d3a63',
  boxShadow: '0 1px 2px rgba(0,0,0,.18)', transition: 'left .18s ease',
});

const optStyle = (side: 'left' | 'right', type: MemoBlockType): React.CSSProperties => ({
  position: 'relative', width: 20, height: 19, flexShrink: 0,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontSize: 10, fontWeight: 700, pointerEvents: 'none',
  color: side === 'left'
    ? (type === 'text' ? 'white' : '#8a87a3')
    : (type === 'checkbox' ? 'white' : '#8a87a3'),
});

// 메모장 스타일 입력줄 — 타이핑 후 Enter로 저장, 왼쪽 스위치로 본문/체크박스 전환
// 저장 후에도 스위치 상태는 유지(체크리스트를 연달아 쓸 때 매번 다시 누르지 않도록)
const MemoNewLineInput = ({
  isKo, placeholder, autoFocus, onCommit, onEmptyBlur,
}: {
  isKo: boolean;
  placeholder?: string;
  autoFocus?: boolean;
  onCommit: (type: MemoBlockType, content: string) => void;
  onEmptyBlur?: () => void;
}) => {
  const [type, setType] = useState<MemoBlockType>('text');
  const [value, setValue] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    onCommit(type, trimmed);
    setValue(''); // 스위치(type)는 초기화하지 않고 그대로 유지
  };

  const handleBlur = () => {
    if (!value.trim()) onEmptyBlur?.();
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '4px 0' }}>
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setType((t) => (t === 'checkbox' ? 'text' : 'checkbox'))}
        style={trackStyle}
      >
        <span style={thumbStyle(type)} />
        <span style={optStyle('left', type)}>A</span>
        <span style={optStyle('right', type)}>
          <PlaylistAddCheckIcon sx={{ fontSize: 12 }} />
        </span>
      </button>
      <input
        autoFocus={autoFocus}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={placeholder ?? (isKo ? '새 줄 입력…' : '新しい行を入力…')}
        style={{
          flex: 1, border: 'none', outline: 'none', background: 'transparent',
          fontSize: 12, color: '#333', fontFamily: 'inherit',
        }}
      />
    </div>
  );
};

export default MemoNewLineInput;
