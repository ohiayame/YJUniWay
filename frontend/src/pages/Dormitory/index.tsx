import { useState, useEffect } from 'react';
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
import PageLayout from '../../components/PageLayout';
import { getFloorSections, getCategorySections } from '../../api/dormitory';
import { getSettings } from '../../api/settings';
import type { DormitorySection } from '../../api/dormitory';
import type { AppSettings } from '../../api/settings';

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

  const [floorSections, setFloorSections] = useState<DormitorySection[]>([]);
  const [categorySections, setCategorySections] = useState<DormitorySection[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);

  useEffect(() => {
    // 층별 섹션, 카테고리 섹션, 앱 설정을 병렬로 조회
    getFloorSections().then(setFloorSections).catch(() => setFloorSections([]));
    getCategorySections().then(setCategorySections).catch(() => setCategorySections([]));
    getSettings().then(setSettings).catch(() => setSettings(null));
  }, []);

  return (
    <PageLayout titleKo="기숙사 안내" titleJa="寮のご案内">

      {/* 통금 배너 */}
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
            {settings?.curfewTime ?? '--:--'}
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

        {floorSections.map((floor) => {
          const badge = FLOOR_BADGE_STYLE[floor.sectionKey] ?? { bg: '#f5f5f5', color: '#666' };
          return (
            <div key={floor.sectionKey} style={{ position: 'relative', display: 'flex', gap: 12, marginBottom: 10 }}>
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
                {/* 카드 헤더 */}
                <div style={{ padding: '11px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 9,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 'bold', flexShrink: 0,
                    background: badge.bg, color: badge.color,
                  }}>
                    {floor.sectionKey}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 'bold', color: '#111' }}>
                    {isKo ? floor.titleKo : floor.titleJa}
                  </div>
                  {(floor.subtitleKo || floor.subtitleJa) && (
                    <div style={{ fontSize: 11, color: '#aaa' }}>
                      {isKo ? floor.subtitleKo : floor.subtitleJa}
                    </div>
                  )}
                </div>

                {/* 카드 바디 */}
                {floor.items.length > 0 && (
                  <div style={{ padding: '0 14px 12px' }}>
                    {floor.items.map((item) => (
                      <div key={item.id} style={{
                        fontSize: 13, color: '#555', lineHeight: 1.5,
                        padding: '6px 0', borderTop: '1px solid #eee',
                        textAlign: 'left',
                      }}>
                        ・{isKo ? item.textKo : item.textJa}
                        {item.warningKo && (
                          <div style={{ marginTop: 4 }}>
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: 3,
                              fontSize: 11, color: '#e67e22',
                              background: '#fff3e0', borderRadius: 20,
                              padding: '2px 8px',
                            }}>
                              <WarningAmberIcon sx={{ fontSize: 12, flexShrink: 0 }} />
                              {isKo ? item.warningKo : item.warningJa}
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
          background: '#e3f2fd', borderRadius: 10, padding: '18px 12px',
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

      {/* 기타 카테고리 */}
      <div style={{ fontSize: 11, fontWeight: 'bold', color: '#bbb', letterSpacing: 1, marginBottom: 10 }}>
        {isKo ? '기타' : 'その他'}
      </div>

      {categorySections.map((cat) => (
        <div key={cat.id} style={{ border: '1px solid #eee', borderRadius: 14, overflow: 'hidden', marginBottom: 10 }}>
          <div style={{
            padding: '11px 14px', background: 'white',
            display: 'flex', alignItems: 'center', gap: 8,
            fontWeight: 'bold', fontSize: 14, color: '#111',
          }}>
            {CATEGORY_ICONS[cat.titleKo]}
            {isKo ? cat.titleKo : cat.titleJa}
          </div>

          <div style={{ background: '#fafafa', padding: '0 14px 12px' }}>
            {cat.items.map((item, ii) => (
              <div key={item.id} style={{
                fontSize: 13, lineHeight: 1.5,
                padding: '6px 0', borderTop: '1px solid #eee',
                display: 'flex', gap: 8, alignItems: 'flex-start',
                color: item.isDanger ? '#c0392b' : '#555',
                fontWeight: item.isDanger ? 500 : 'normal',
              }}>
                {item.isDanger
                  ? <BlockIcon sx={{ fontSize: 14, color: '#c0392b', mt: '3px', flexShrink: 0 }} />
                  : item.pin
                    ? <LockIcon sx={{ fontSize: 14, color: '#856404', mt: '4px', flexShrink: 0 }} />
                    : ii === 0
                      ? <LocationOnIcon sx={{ fontSize: 14, color: '#888', mt: '3px', flexShrink: 0 }} />
                      : <RecyclingIcon sx={{ fontSize: 14, color: '#888', mt: '3px', flexShrink: 0 }} />
                }
                <div>
                  {isKo ? item.textKo : item.textJa}
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

    </PageLayout>
  );
};

export default DormitoryPage;
