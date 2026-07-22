import CloseIcon from '@mui/icons-material/Close';

// 모달 공통 컴포넌트: Overlay, ModalBox, ModalHeader
// Overlay: 모달 배경 (클릭 시 onClose 호출)
export const Overlay = ({ children, onClose }: { children: React.ReactNode; onClose: () => void }) => (
  <div
    onClick={onClose}
    style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000,
    }}
  >
    <div
      onClick={e => e.stopPropagation()}
      style={{
        width: 'calc(100% - 40px)', maxWidth: 300,
        maxHeight: '85vh', overflowY: 'auto',
      }}
    >
      {children}
    </div>
  </div>
);

// ModalBox: 모달 내부 박스 (배경 흰색, 그림자, 패딩)
export const ModalBox = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{
    background: 'white', borderRadius: 20,
    padding: '24px 20px', width: '100%',
    boxSizing: 'border-box',
    boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
    ...style,
  }}>
    {children}
  </div>
);

// ModalHeader: 모달 상단 헤더 (제목 + 닫기 버튼)
export const ModalHeader = ({ title, onClose }: { title: string; onClose: () => void }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
    <div style={{ fontSize: 15, fontWeight: 'bold', color: '#111' }}>{title}</div>
    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', padding: 4 }}>
      <CloseIcon sx={{ fontSize: 20 }} />
    </button>
  </div>
);
