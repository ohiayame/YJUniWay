import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import type { LaundryStep } from '../../../../api/laundry';
import laundryVideo from '../../../../assets/laundry.mov';
import laundryImage from '../../../../assets/laundry.png';

interface LaundryHowToUseProps {
  steps: LaundryStep[];
  isKo: boolean;
  isAdmin?: boolean;
  onAddStep?: () => void;
  onEditStep?: (step: LaundryStep) => void;
  onDeleteStep?: (step: LaundryStep) => void;
  onMoveStep?: (step: LaundryStep, direction: 'up' | 'down') => void;
}

const moveBtnStyle = (disabled: boolean): React.CSSProperties => ({
  background: 'none', border: 'none', padding: 2, display: 'flex',
  color: disabled ? '#ddd' : '#888',
  cursor: disabled ? 'default' : 'pointer',
});

// 앱 사용법 영상 + 세제 넣는 곳 이미지 + 사용 순서
const LaundryHowToUse = ({ steps, isKo, isAdmin, onAddStep, onEditStep, onDeleteStep, onMoveStep }: LaundryHowToUseProps) => (
  <>
    {/* 앱 사용법 영상 */}
    <div style={{ fontSize: 11, fontWeight: 'bold', color: '#bbb', letterSpacing: 1, marginBottom: 10 }}>
      {isKo ? '앱 사용법' : 'アプリの使い方'}
    </div>
    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
      <video
        src={laundryVideo}
        controls
        style={{ width: '55%', borderRadius: 14 }}
      />
    </div>

    {/* 세제 넣는 곳 */}
    <div style={{ fontSize: 11, fontWeight: 'bold', color: '#bbb', letterSpacing: 1, marginBottom: 10 }}>
      {isKo ? '세제 넣는 곳・코스 선택' : '洗剤の入れ方・コース選択'}
    </div>
    <div style={{ borderRadius: 14, overflow: 'hidden', marginBottom: 14 }}>
      <img
        src={laundryImage}
        alt={isKo ? '세제 넣는 곳' : '洗剤の入れ方'}
        style={{ width: '100%', display: 'block' }}
      />
    </div>

    {/* 사용 순서 */}
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
      <div style={{ fontSize: 11, fontWeight: 'bold', color: '#bbb', letterSpacing: 1 }}>
        {isKo ? '사용 순서' : '使い方'}
      </div>
      {isAdmin && (
        <button
          onClick={onAddStep}
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '4px 10px', borderRadius: 20, border: 'none',
            background: '#e8f5e9', color: '#2e7d32', fontSize: 11, cursor: 'pointer',
          }}
        >
          <AddIcon sx={{ fontSize: 13 }} />
          {isKo ? '추가' : '追加'}
        </button>
      )}
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
      {steps.map((step, i) => (
        <div key={step.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div style={{
            width: 26, height: 26, borderRadius: '50%',
            background: '#1a1a2e', color: 'white',
            fontSize: 12, fontWeight: 'bold',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            {i + 1}
          </div>
          <div style={{ fontSize: 13, color: '#333', lineHeight: 1.5, paddingTop: 4, flex: 1 }}>
            {isKo ? step.textKo : step.textJa}
          </div>

          {/* 관리자 전용 순서이동/수정/삭제 버튼 */}
          {isAdmin && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0, paddingTop: 2 }}>
              <button onClick={() => onMoveStep?.(step, 'up')} disabled={i === 0} style={moveBtnStyle(i === 0)}>
                <ArrowUpwardIcon sx={{ fontSize: 14 }} />
              </button>
              <button onClick={() => onMoveStep?.(step, 'down')} disabled={i === steps.length - 1} style={moveBtnStyle(i === steps.length - 1)}>
                <ArrowDownwardIcon sx={{ fontSize: 14 }} />
              </button>
              <button onClick={() => onEditStep?.(step)} style={{ background: 'none', border: 'none', color: '#888', padding: 2, cursor: 'pointer', display: 'flex' }}>
                <EditIcon sx={{ fontSize: 14 }} />
              </button>
              <button onClick={() => onDeleteStep?.(step)} style={{ background: 'none', border: 'none', color: '#c62828', padding: 2, cursor: 'pointer', display: 'flex' }}>
                <DeleteIcon sx={{ fontSize: 14 }} />
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  </>
);

export default LaundryHowToUse;
