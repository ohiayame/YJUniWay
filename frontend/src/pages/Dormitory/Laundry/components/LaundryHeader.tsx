import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';

interface LaundryHeaderProps {
  isKo: boolean;
  onBack: () => void;
  onToggleLanguage: () => void;
}

// 뒤로가기 + 언어토글 헤더
const LaundryHeader = ({ isKo, onBack, onToggleLanguage }: LaundryHeaderProps) => (
  <header style={{
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '12px 18px', borderBottom: '1px solid #f0f0f0',
    background: 'white', position: 'sticky', top: 0, zIndex: 50,
  }}>
    {/* 뒤로가기 버튼 */}
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
        <ArrowBackIosNewIcon sx={{ fontSize: 18, color: '#aaa' }} />
      </button>
      <div style={{ fontSize: 17, fontWeight: 'bold', color: '#111' }}>
        {isKo ? '세탁기 사용법' : '洗濯機の使い方'}
      </div>
    </div>

    {/* 언어 토글 버튼 */}
    <button
      onClick={onToggleLanguage}
      style={{
        background: 'transparent', border: '1px solid #ddd', borderRadius: 20,
        padding: '4px 10px', fontSize: 12, color: '#555', cursor: 'pointer',
      }}
    >
      {isKo ? '日本語' : '한국어'}
    </button>
  </header>
);

export default LaundryHeader;
