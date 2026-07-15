import AssignmentIcon from '@mui/icons-material/Assignment';
import NightsStayIcon from '@mui/icons-material/NightsStay';
import WifiIcon from '@mui/icons-material/Wifi';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import campusMapKR from '../../../assets/campus-map_KR.png';
import campusMapJP from '../../../assets/campus-map_JP.png';
import yjuLogo from '../../../assets/yju.png';
import type { AppSettings } from '../../../api/settings';
import SectionLabel from './SectionLabel';

interface SettingsSectionProps {
  settings: AppSettings | null;
  isKo: boolean;
}

// ======== 공지사항 ========
export const NoticeBanner = ({ settings, isKo }: SettingsSectionProps) => {
  const notice = isKo ? settings?.noticeKo : settings?.noticeJa;
  if (!settings || !notice) return null;

  return (
    <div style={{
      background: '#fffbe6',
      borderLeft: '3px solid #f39c12',
      borderRadius: '0 10px 10px 0',
      padding: '10px 12px',
      fontSize: 13,
      color: '#555',
      lineHeight: 1.6,
      marginBottom: 10,
      whiteSpace: 'pre-line',
    }}>
      <WarningAmberIcon sx={{ fontSize: 14, color: '#f39c12', verticalAlign: 'middle', mr: 0.5 }} />
      {notice}
    </div>
  );
};

// ======== 통금/점호, 잠김 시간 카드 ========
export const CurfewStatusCards = ({ settings, isKo }: SettingsSectionProps) => (
  <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>

    <div style={{
      flex: 1, textAlign: 'center', padding: '12px 8px',
      background: 'white', border: '1px solid #eee', borderRadius: 14,
      boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
    }}>
      {/* 통금/점호 시간 */}
      <AssignmentIcon sx={{ fontSize: 20, color: '#555' }} />
      <div style={{ fontSize: 14, fontWeight: 'bold', marginTop: 4 }}>
        {settings?.curfewTime ?? (isKo ? '미정' : '未定')}
      </div>
      <div style={{ fontSize: 10, color: '#aaa', marginTop: 2 }}>
        {isKo ? '통금/점호' : '門限/点呼'}
      </div>
    </div>

    <div style={{
      flex: 1, textAlign: 'center', padding: '12px 8px',
      background: 'white', border: '1px solid #eee', borderRadius: 14,
      boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
    }}>
      {/* 잠김 시간 */}
      <NightsStayIcon sx={{ fontSize: 20, color: '#555' }} />
      <div style={{ fontSize: 14, fontWeight: 'bold', marginTop: 4 }}>
        24:00 ~ 6:00
      </div>
      <div style={{ fontSize: 10, color: '#aaa', marginTop: 2 }}>
        {isKo ? '잠김' : '施錠'}
      </div>
    </div>
  </div>
);

// ======== WIFI 카드 ========
export const WifiCard = ({ settings, isKo }: SettingsSectionProps) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    background: '#f7f7f7',
    borderRadius: 12,
    padding: '12px 14px',
    marginBottom: 10,
  }}>
    <WifiIcon sx={{ fontSize: 22, color: '#555' }} />
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 13, fontWeight: 'bold', color: '#111' }}>{isKo ? '생활관' : '生活館'} WIFI : {settings?.wifiSsid}</div>
      <div style={{ fontSize: 12, color: '#aaa', marginTop: 1 }}>password : {settings?.wifiPassword}</div>
    </div>
    <button
      className="copy-btn"
      onClick={() => navigator.clipboard.writeText(settings?.wifiPassword ?? '')}
    >
      {isKo ? '복사' : 'コピー'}
    </button>
  </div>
);

// ======== 교내 지도 카드 ========
export const CampusMapCard = ({ isKo }: { isKo: boolean }) => (
  <>
    <SectionLabel>{isKo ? '교내 지도' : 'キャンパスマップ'}</SectionLabel>
    <div style={{ borderRadius: 14, overflow: 'hidden', marginBottom: 10, border: '1px solid #eee', position: 'relative' }}>
      <img
        src={isKo ? campusMapKR : campusMapJP}
        alt={isKo ? '교내 지도' : 'キャンパスマップ'}
        style={{ width: '100%', display: 'block', touchAction: 'pinch-zoom' }}
      />
      <div style={{
        position: 'absolute',
        bottom: 8,
        right: 8,
        background: 'rgba(0,0,0,0.45)',
        color: 'white',
        fontSize: 11,
        padding: '4px 9px',
        borderRadius: 20,
        backdropFilter: 'blur(4px)',
      }}>
        <ZoomInIcon sx={{ fontSize: 13, verticalAlign: 'middle' }} /> {isKo ? '핀치로 확대' : 'ピンチで拡大'}
      </div>
    </div>
  </>
);

// ======== 학교 주소 카드 ========
export const SchoolAddressCard = ({ settings, isKo }: SettingsSectionProps) => (
  <>
    <SectionLabel>{isKo ? '학교 주소' : '学校住所'}</SectionLabel>
    <div style={{
      background: '#f7f7f7',
      borderRadius: 12,
      padding: '12px 14px',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      marginBottom: 10,
    }}>
      <img src={yjuLogo} alt="YJU" style={{ width: 36, height: 36, objectFit: 'contain', borderRadius: 8, flexShrink: 0 }} />
      <div>
        <div style={{ fontSize: 16, fontWeight: 'bold', color: '#111' }}>
          {isKo ? '영진전문대학교' : '永進専門大学校'}
        </div>
        <div style={{ fontSize: 12, color: '#888', marginTop: 3 }}>
          {isKo ? settings?.schoolAddressKo : settings?.schoolAddressJa}
        </div>
      </div>
    </div>
  </>
);
