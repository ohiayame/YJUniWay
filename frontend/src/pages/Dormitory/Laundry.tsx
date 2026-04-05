import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import LocalLaundryServiceIcon from '@mui/icons-material/LocalLaundryService';
import AirIcon from '@mui/icons-material/Air';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import SmartphoneIcon from '@mui/icons-material/Smartphone';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ImageIcon from '@mui/icons-material/Image';
import ManIcon from '@mui/icons-material/Man';
import WomanIcon from '@mui/icons-material/Woman';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import BottomTab from '../../components/BottomTab';

const STEPS_KO = [
  '앱 「메타클럽」 다운로드',
  '현금으로 충전 (편의점 · 프런트)',
  '세탁기 QR코드 스캔',
  '코스 선택 후 앱으로 결제',
  '세탁 완료 후 바로 꺼내기',
];
const STEPS_JA = [
  'アプリ「メタクラブ」をダウンロード',
  '現金でチャージ（コンビニ・フロント）',
  '洗濯機のQRコードをスキャン',
  'コースを選択してアプリで決済',
  '洗濯終了後は速やかに取り出す',
];

const LaundryPage = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const isKo = i18n.language === 'ko';
  const steps = isKo ? STEPS_KO : STEPS_JA;

  return (
    <div style={{ paddingBottom: 64, maxWidth: 480, margin: '0 auto', background: 'white', minHeight: '100vh' }}>
      {/* 헤더 */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 18px', borderBottom: '1px solid #f0f0f0',
        background: 'white', position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
            <ArrowBackIosNewIcon sx={{ fontSize: 18, color: '#aaa' }} />
          </button>
          <div style={{ fontSize: 17, fontWeight: 'bold', color: '#111' }}>
            {isKo ? '세탁기 사용법' : '洗濯機の使い方'}
          </div>
        </div>
        <button
          onClick={() => i18n.changeLanguage(isKo ? 'ja' : 'ko')}
          style={{
            background: 'transparent', border: '1px solid #ddd', borderRadius: 20,
            padding: '4px 10px', fontSize: 12, color: '#555', cursor: 'pointer',
          }}
        >
          {isKo ? '日本語' : '한국어'}
        </button>
      </header>

      <main style={{ padding: '16px 16px 20px' }}>

        {/* 요금 */}
        <div style={{ fontSize: 11, fontWeight: 'bold', color: '#bbb', letterSpacing: 1, marginBottom: 10 }}>
          {isKo ? '요금' : '料金'}
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          <div style={{ flex: 1, background: '#1a1a2e', borderRadius: 14, padding: 14, textAlign: 'center' }}>
            <LocalLaundryServiceIcon sx={{ fontSize: 22, color: 'rgba(255,255,255,0.7)' }} />
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 6 }}>
              {isKo ? '세탁기 1회' : '洗濯機 1回'}
            </div>
            <div style={{ fontSize: 22, fontWeight: 'bold', color: 'white', marginTop: 4 }}>700원</div>
          </div>
          <div style={{ flex: 1, background: '#f7f7f7', borderRadius: 14, padding: 14, textAlign: 'center' }}>
            <AirIcon sx={{ fontSize: 22, color: '#888' }} />
            <div style={{ fontSize: 11, color: '#aaa', marginTop: 6 }}>
              {isKo ? '건조기 1회' : '乾燥機 1回'}
            </div>
            <div style={{ fontSize: 22, fontWeight: 'bold', color: '#111', marginTop: 4 }}>700원~</div>
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

        {/* MetaClub 앱 링크 */}
        <a
          href="https://www.metaclub.im/"
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
                {isKo ? '메타클럽' : 'メタクラブ'}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 1 }}>metaclub.im</div>
            </div>
          </div>
          <ArrowForwardIosIcon sx={{ fontSize: 14, color: 'white' }} />
        </a>

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

        {/* 앱 사용법 영상 */}
        <div style={{ fontSize: 11, fontWeight: 'bold', color: '#bbb', letterSpacing: 1, marginBottom: 10 }}>
          {isKo ? '앱 사용법' : 'アプリの使い方'}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
          <div style={{
            background: '#111', borderRadius: 14, width: '55%', aspectRatio: '9/16',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            <div style={{
              width: 44, height: 44, background: 'rgba(255,255,255,0.15)',
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <PlayArrowIcon sx={{ fontSize: 22, color: 'white', ml: '2px' }} />
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>
              {isKo ? '영상 재생' : '動画を再生'}
            </div>
          </div>
        </div>

        {/* 세제 넣는 곳 */}
        <div style={{ fontSize: 11, fontWeight: 'bold', color: '#bbb', letterSpacing: 1, marginBottom: 10 }}>
          {isKo ? '세제 넣는 곳' : '洗剤の入れ方'}
        </div>
        <div style={{
          background: '#f5f5f5', borderRadius: 14, aspectRatio: '4/3',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 8, marginBottom: 14,
        }}>
          <ImageIcon sx={{ fontSize: 36, color: '#bbb' }} />
          <div style={{ fontSize: 12, color: '#bbb' }}>{isKo ? '이미지 준비 중' : '画像準備中'}</div>
        </div>

        {/* 사용 순서 */}
        <div style={{ fontSize: 11, fontWeight: 'bold', color: '#bbb', letterSpacing: 1, marginBottom: 10 }}>
          {isKo ? '사용 순서' : '使い方'}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
          {steps.map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{
                width: 26, height: 26, borderRadius: '50%',
                background: '#1a1a2e', color: 'white',
                fontSize: 12, fontWeight: 'bold',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                {i + 1}
              </div>
              <div style={{ fontSize: 13, color: '#333', lineHeight: 1.5, paddingTop: 4 }}>
                {step}
              </div>
            </div>
          ))}
        </div>

        {/* 주의사항 */}
        <div style={{
          background: '#fffbe6', borderLeft: '3px solid #f39c12',
          borderRadius: '0 10px 10px 0', padding: '10px 12px',
          fontSize: 12, color: '#555', lineHeight: 1.6,
        }}>
          <WarningAmberIcon sx={{ fontSize: 13, color: '#f39c12', verticalAlign: 'middle', mr: 0.5 }} />
          {isKo ? '세탁물을 방치하지 말아 주세요.' : '洗濯物の放置はご遠慮ください。'}
        </div>

      </main>

      <BottomTab />
    </div>
  );
};

export default LaundryPage;
