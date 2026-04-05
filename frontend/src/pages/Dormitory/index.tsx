import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import NightsStayIcon from '@mui/icons-material/NightsStay';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import LocalLaundryServiceIcon from '@mui/icons-material/LocalLaundryService';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BlockIcon from '@mui/icons-material/Block';
import KeyIcon from '@mui/icons-material/Key';
import RecyclingIcon from '@mui/icons-material/Recycling';
import LockIcon from '@mui/icons-material/Lock';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import BottomTab from '../../components/BottomTab';
import { mockFloorSections, mockCategorySections } from '../../mock/dormitoryData';
import { mockSettings } from '../../mock/mainData';

const FLOOR_BADGE_STYLE: Record<string, { bg: string; color: string }> = {
  B1:  { bg: '#e8eaf6', color: '#3949ab' },
  '1F': { bg: '#e8f5e9', color: '#2e7d32' },
  '2F': { bg: '#e3f2fd', color: '#1565c0' },
  '3F': { bg: '#fff8e1', color: '#f57f17' },
  '4F': { bg: '#fce4ec', color: '#c2185b' },
  ALL: { bg: '#f3e5f5', color: '#6a1b9a' },
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  '쓰레기 버리기': <DeleteOutlineIcon sx={{ fontSize: 16, color: '#000000' }} />,
  '규칙':        <BlockIcon sx={{ fontSize: 16, color: '#c0392b' }} />,
};

const DormitoryPage = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const isKo = i18n.language === 'ko';

  return (
    <div style={{ paddingBottom: 64, maxWidth: 480, margin: '0 auto', background: 'white', minHeight: '100vh' }}>
      {/* 헤더 */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 18px', borderBottom: '1px solid #f0f0f0',
        background: 'white', position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ fontSize: 17, fontWeight: 'bold', color: '#111' }}>
          {isKo ? '기숙사 안내' : '寮のご案内'}
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

        {/* 통금 배너 */}
        <div style={{
          background: '#1a1a2e', borderRadius: 14, padding: '14px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 16,
        }}>
          <div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 2 }}>
              {isKo ? '통금 / 점호' : '門限 / 点呼'}
            </div>
            <div style={{ fontSize: 26, fontWeight: 'bold', color: 'white', letterSpacing: -1 }}>
              {mockSettings.curfew_time ?? '--:--'}
            </div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
              {isKo ? '잠김' : '施錠'} 24:00 ~ 6:00
            </div>
          </div>
          <NightsStayIcon sx={{ fontSize: 56, color: 'rgba(255,255,255,0.15)' }} />
        </div>

        {/* 층별 안내 */}
        <div style={{ fontSize: 11, fontWeight: 'bold', color: '#bbb', letterSpacing: 1, marginBottom: 10 }}>
          {isKo ? '층별 안내' : 'フロアガイド'}
        </div>

        {/* 타임라인 */}
        <div style={{ position: 'relative', paddingLeft: 16 }}>
          {/* 세로 선 */}
          <div style={{
            position: 'absolute', left: 17, top: 8, bottom: 8,
            width: 2, background: '#eee',
          }} />

          {mockFloorSections.map((floor) => {
            const badge = FLOOR_BADGE_STYLE[floor.section_key];
            return (
              <div key={floor.section_key} style={{ position: 'relative', display: 'flex', gap: 12, marginBottom: 10 }}>
                {/* 타임라인 점 */}
                <div style={{
                  position: 'absolute', left: -7, top: 10,
                  width: 12, height: 12, borderRadius: '50%',
                  background: 'white', border: '2px solid #ddd',
                }} />

                {/* 카드 */}
                <div style={{
                  flex: 1, background: '#fafafa', border: '1px solid #eee',
                  borderRadius: 14, overflow: 'hidden', marginLeft: 18,
                }}>
                  {/* 카드 헤더 (층 + 층 이름 + subtitle) */}
                  <div style={{ padding: '11px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 9,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 'bold', flexShrink: 0,
                      background: badge.bg, color: badge.color,
                    }}>
                      {floor.section_key}
                    </div>
                      <div style={{ fontSize: 14, fontWeight: 'bold', color: '#111' }}>
                        {isKo ? floor.title_ko : floor.title_ja}
                      </div>
                      {(floor.subtitle_ko || floor.subtitle_ja) && (
                        <div style={{ fontSize: 11, color: '#aaa', }}>
                          {isKo ? floor.subtitle_ko : floor.subtitle_ja}
                        </div>
                      )}
                  </div>

                  {/* 카드 바디 (floor 가이트 + 주의사항)*/}
                  {floor.items.length > 0 && (
                    <div style={{ padding: '0 14px 12px' }}>
                      {floor.items.map((item, i) => (
                        <div key={i} style={{
                          fontSize: 11, color: '#555', lineHeight: 1.5,
                          padding: '6px 0', borderTop: '1px solid #eee',
                          textAlign: 'left',
                        }}>
                          ・{isKo ? item.text_ko : item.text_ja}
                          {item.warning_ko && (
                            <div style={{ marginTop: 4 }}>
                              <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: 3,
                                fontSize: 10, color: '#e67e22',
                                background: '#fff3e0', borderRadius: 20,
                                padding: '2px 8px',
                              }}>
                                <WarningAmberIcon sx={{ fontSize: 11, flexShrink: 0 }} />
                                {isKo ? item.warning_ko : item.warning_ja}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 세탁기 링크 */}
        <button
          onClick={() => navigate('/dormitory/laundry')}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: '#e3f2fd', borderRadius: 10, padding: '10px 12px',
            marginTop: 4, marginBottom: 14, border: 'none', cursor: 'pointer',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#1565c0', fontWeight: 500 }}>
            <LocalLaundryServiceIcon sx={{ fontSize: 18, color: '#1565c0' }} />
            {isKo ? '세탁기 사용법 보기' : '洗濯機の使い方を見る'}
          </span>
          <ArrowForwardIosIcon sx={{ fontSize: 12, color: '#1565c0' }} />
        </button>

        <hr style={{ border: 'none', borderTop: '1px solid #f0f0f0', margin: '0 0 14px' }} />

        {/* ---------------  기타 카테고리  --------------- */}
        <div style={{ fontSize: 11, fontWeight: 'bold', color: '#bbb', letterSpacing: 1, marginBottom: 10 }}>
          {isKo ? '기타' : 'その他'}
        </div>

        {mockCategorySections.map((cat, ci) => (
          <div key={ci} style={{ border: '1px solid #eee', borderRadius: 14, overflow: 'hidden', marginBottom: 10 }}>
            {/* 카테고리 헤더 */}
            <div style={{
              padding: '11px 14px', background: 'white',
              display: 'flex', alignItems: 'center', gap: 8,
              fontWeight: 'bold', fontSize: 14, color: '#111',
            }}>
              {/* title_ko을 key값로 CATEGORY_ICONS에 정의헌 mui 아이콘 출력 */}
              {CATEGORY_ICONS[cat.title_ko]}
              {isKo ? cat.title_ko : cat.title_ja}
            </div>

            {/* 카테고리 바디 */}
            <div style={{ background: '#fafafa', padding: '0 14px 12px' }}>
              {cat.items.map((item, ii) => (
                <div key={ii} style={{
                  fontSize: 13, lineHeight: 1.5,
                  padding: '6px 0', borderTop: '1px solid #eee',
                  display: 'flex', gap: 8, alignItems: 'flex-start',
                  color: item.is_danger ? '#c0392b' : '#555',
                  fontWeight: item.is_danger ? 500 : 'normal',
                }}>
                  {item.is_danger
                    ? <BlockIcon sx={{ fontSize: 14, color: '#c0392b', mt: '3px', flexShrink: 0 }} />
                    : item.pin
                      ? <LockIcon sx={{ fontSize: 14, color: '#856404', mt: '4px', flexShrink: 0 }} />
                      : ci === 0 && ii === 0
                        ? <LocationOnIcon sx={{ fontSize: 14, color: '#888', mt: '3px', flexShrink: 0 }} />
                        : <RecyclingIcon sx={{ fontSize: 14, color: '#888', mt: '3px', flexShrink: 0 }} />
                  }
                  <div>
                    {isKo ? item.text_ko : item.text_ja}
                    {item.pin && (
                      <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        background: '#fff3cd', borderRadius: 8,
                        padding: '2px 5px', fontSize: 12, color: '#856404',
                        marginLeft: 3,
                      }}>
                        <KeyIcon sx={{ fontSize: 12 }} />
                        <b style={{ fontSize: 12, letterSpacing: 3, color: '#d35400' }}>{item.pin}</b>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

      </main>

      <BottomTab />
    </div>
  );
};

export default DormitoryPage;
