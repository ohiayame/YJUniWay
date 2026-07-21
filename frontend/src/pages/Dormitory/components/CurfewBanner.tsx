import NightsStayIcon from '@mui/icons-material/NightsStay';
import LockIcon from '@mui/icons-material/Lock';

interface CurfewBannerProps {
  curfewTime: string | null | undefined;
  isKo: boolean;
}

// 통금/점호 배너
const CurfewBanner = ({ curfewTime, isKo }: CurfewBannerProps) => (
  <div style={{
    background: 'linear-gradient(135deg, #1a1a2e, #2d2d5e)',
    borderRadius: 14, padding: 20,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    position: 'relative', overflow: 'hidden',
    marginBottom: 16,
  }}>
    {/* 장식 원 */}
    <div style={{
      position: 'absolute', right: -20, bottom: -20,
      width: 90, height: 90, borderRadius: '50%',
      background: 'rgba(255,255,255,0.04)',
    }} />

    {/* 왼쪽: 레이블 + 시간 */}
    <div>
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 7, marginTop: -10 }}>
        {isKo ? '통금 / 점호' : '門限 / 点呼'}
      </div>
      <div style={{ fontSize: 34, fontWeight: 'bold', color: 'white', letterSpacing: -1, marginLeft: 20 }}>
        {curfewTime ?? '--:--'}
      </div>
    </div>

    {/* 오른쪽: 달 아이콘 + 잠금 배지 */}
    <div style={{ textAlign: 'right' }}>
      <NightsStayIcon sx={{ fontSize: 22, color: 'rgba(255,255,255,0.2)', display: 'block', marginLeft: 'auto', marginBottom: '18px' }} />
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        background: 'rgba(255,255,255,0.08)', borderRadius: 20,
        padding: '3px 10px',
      }}>
        <LockIcon sx={{ fontSize: 15, color: 'rgba(255,255,255,0.5)' }} />
        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', fontWeight: 'bold' }}>
          24:00~6:00
        </span>
      </div>
    </div>
  </div>
);

export default CurfewBanner;
