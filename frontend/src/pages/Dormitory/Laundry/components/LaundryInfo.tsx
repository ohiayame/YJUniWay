import LocalLaundryServiceIcon from '@mui/icons-material/LocalLaundryService';
import AirIcon from '@mui/icons-material/Air';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import SmartphoneIcon from '@mui/icons-material/Smartphone';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ManIcon from '@mui/icons-material/Man';
import WomanIcon from '@mui/icons-material/Woman';
import type { LaundrySettings } from '../../../../api/laundry';

interface LaundryInfoProps {
  settings: LaundrySettings | null;
  isKo: boolean;
}

// 요금 + 충전 안내 + 결제 앱 링크 + 위치 안내
const LaundryInfo = ({ settings, isKo }: LaundryInfoProps) => (
  <>
    {/* 요금 */}
    <div style={{ fontSize: 11, fontWeight: 'bold', color: '#bbb', letterSpacing: 1, marginBottom: 10 }}>
      {isKo ? '요금' : '料金'}
    </div>
    
    <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
      
      {/* 세탁기 요금 */}
      <div style={{ flex: 1, background: '#1a1a2e', borderRadius: 14, padding: 14, textAlign: 'center' }}>
        <LocalLaundryServiceIcon sx={{ fontSize: 22, color: 'rgba(255,255,255,0.7)' }} />
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 6 }}>
          {isKo ? '세탁기(하단) 1회' : '洗濯機(下段) 1回'}
        </div>
        <div style={{ fontSize: 22, fontWeight: 'bold', color: 'white', marginTop: 4 }}>
          {settings?.washPrice ?? '--'}
        </div>
      </div>

      {/* 건조기 요금 */}
      <div style={{ flex: 1, background: '#f7f7f7', borderRadius: 14, padding: 14, textAlign: 'center' }}>
        <AirIcon sx={{ fontSize: 22, color: '#888' }} />
        <div style={{ fontSize: 11, color: '#aaa', marginTop: 6 }}>
          {isKo ? '건조기(상단) 1회' : '乾燥機(上段) 1回'}
        </div>
        <div style={{ fontSize: 22, fontWeight: 'bold', color: '#111', marginTop: 4 }}>
          {settings?.dryPrice ?? '--'}
        </div>
      </div>
    </div>

    {/* 충전 안내 */}
    <div style={{
      background: '#fff8e1', borderRadius: 12, padding: '12px 14px',
      marginBottom: 14, display: 'flex', gap: 10, alignItems: 'center',
    }}>
      <CreditCardIcon sx={{ fontSize: 20, color: '#b26a00', flexShrink: 0 }} />
      <div>
        <div style={{ fontSize: 13, fontWeight: 'bold', color: '#b26a00' }}>
          {isKo ? '충전은 현금만 가능' : 'チャージは現金のみ'}
        </div>
        <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
          {isKo ? '편의점에서 충전 가능 (5,000원~)' : 'コンビニでチャージ可能（5,000원〜）'}
        </div>
      </div>
    </div>

    {/* 결제 앱 링크 */}
    {settings && (
      <a
        href={settings.appUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: '#6c3ce1', borderRadius: 12, padding: '12px 16px',
          marginBottom: 14, textDecoration: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <SmartphoneIcon sx={{ fontSize: 22, color: 'white' }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 'bold', color: 'white' }}>
              {isKo ? `${settings.appName} 가입` : `${settings.appName} 登録`}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 1 }}>
              {settings.appUrl.replace(/^https?:\/\//, '')}
            </div>
          </div>
        </div>
        <ArrowForwardIosIcon sx={{ fontSize: 14, color: 'white' }} />
      </a>
    )}

    {/* 위치 */}
    <div style={{ fontSize: 11, fontWeight: 'bold', color: '#bbb', letterSpacing: 1, marginBottom: 10 }}>
      {isKo ? '위치' : '場所'}
    </div>
    <div style={{
      background: '#f7f7f7', borderRadius: 12, padding: '10px 14px',
      marginBottom: 14, display: 'flex',
    }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
        <ManIcon sx={{ fontSize: 16, color: '#1565c0' }} />
        <span style={{ fontSize: 13, color: '#1565c0', fontWeight: 'bold' }}>{isKo ? '남성' : '男性'}</span>
        <span style={{ fontSize: 12, color: '#aaa' }}>2F</span>
      </div>
      <div style={{ width: 1, background: '#e0e0e0', margin: '0 12px' }} />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
        <WomanIcon sx={{ fontSize: 16, color: '#c2185b' }} />
        <span style={{ fontSize: 13, color: '#c2185b', fontWeight: 'bold' }}>{isKo ? '여성' : '女性'}</span>
        <span style={{ fontSize: 12, color: '#aaa' }}>4F</span>
      </div>
    </div>
  </>
);

export default LaundryInfo;
