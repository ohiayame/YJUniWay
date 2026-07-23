import { useRef, useState } from 'react';
import CheckIcon from '@mui/icons-material/Check';
import type { MemoBlock } from '../../../../store/slices/memoSlice';

// 저장된 메모 한 줄 (텍스트 줄엔 아무 표시 없음, 체크박스 줄만 사각 체크박스)
// 더블클릭하면 그 자리에서 바로 수정, 다른 곳을 누르면 저장, Enter를 누르면 저장 후 다음 줄이 이어짐
const MemoBlockRow = ({
  block, onToggleCheck, onCommitEdit, onEnterAfter,
}: {
  block: MemoBlock;
  onToggleCheck: () => void;
  onCommitEdit: (content: string) => void;
  onEnterAfter: () => void;
}) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(block.content);
  const committedRef = useRef(false);
  const lastTapRef = useRef(0);

  const startEdit = () => {
    setDraft(block.content);
    setEditing(true);
  };

  // 네이티브 dblclick 대신 클릭 간격을 직접 재서 판정 — 모바일에서는 더블탭이 확대 제스처와
  // 겹쳐 dblclick이 잘 안 잡히는 경우가 있어, 마우스/터치 모두에서 안정적으로 동작하도록 함
  const handleTextClick = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 350) {
      lastTapRef.current = 0;
      startEdit();
    } else {
      lastTapRef.current = now;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return;
    committedRef.current = true;
    onCommitEdit(draft);
    setEditing(false);
    onEnterAfter();
  };

  const handleBlur = () => {
    if (committedRef.current) {
      committedRef.current = false;
      return;
    }
    onCommitEdit(draft);
    setEditing(false);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '4px 0', fontSize: 12, lineHeight: 1.55 }}>
      {block.type === 'checkbox' && (
        <button
          type="button"
          onClick={onToggleCheck}
          style={{
            width: 15, height: 15, borderRadius: 4, flexShrink: 0, padding: 0, cursor: 'pointer',
            border: `1.6px solid ${block.isChecked ? '#3d3a63' : '#c8c5da'}`,
            background: block.isChecked ? '#3d3a63' : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {block.isChecked ? <CheckIcon sx={{ fontSize: 11, color: 'white' }} /> : null}
        </button>
      )}

      {editing ? (
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          style={{
            flex: 1, border: 'none', outline: 'none', fontSize: 12, color: '#333',
            background: '#faf9fd', borderRadius: 4, padding: '1px 5px', margin: '-1px -5px',
            boxShadow: '0 0 0 1.4px #cfccdf inset', fontFamily: 'inherit',
          }}
        />
      ) : (
        <span
          onClick={handleTextClick}
          style={{
            flex: 1, cursor: 'text',
            color: block.isChecked ? '#b7b4c9' : '#333',
            textDecoration: block.isChecked ? 'line-through' : 'none',
          }}
        >
          {block.content}
        </span>
      )}
    </div>
  );
};

export default MemoBlockRow;
