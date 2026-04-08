import { useTranslation } from 'react-i18next';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import InboxIcon from '@mui/icons-material/Inbox';
import NightsStayIcon from '@mui/icons-material/NightsStay';
import AssignmentIcon from '@mui/icons-material/Assignment';
import WifiIcon from '@mui/icons-material/Wifi';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import CallIcon from '@mui/icons-material/Call';
import campusMapKR from '../../assets/campus-map_KR.png';
import campusMapJP from '../../assets/campus-map_JP.png';
import yjuLogo from '../../assets/yju.png';
import PageLayout from '../../components/PageLayout';
import { mockTodaySchedules, mockTomorrowGathering, mockSettings, mockEmergencyContacts } from '../../mock/mainData';

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <div style={{
    fontSize: 11,
    fontWeight: 'bold',
    color: '#bbb',
    letterSpacing: 1,
    textTransform: 'uppercase' as const,
    margin: '0 0 8px',
  }}>
    {children}
  </div>
);

const MainPage = () => {
  const { i18n } = useTranslation();
  const isKo = i18n.language === 'ko';

  return (
    <PageLayout titleKo="YJUniWay" titleJa="YJUniWay">

      {/* 오늘의 일정 */}
      <SectionLabel>{isKo ? '오늘의 일정' : '今日のスケジュール'}</SectionLabel>
      <div style={{
        background: '#1a1a2e',
        borderRadius: 16,
        padding: 16,
        marginBottom: 10,
      }}>

        {mockTodaySchedules.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#27ae60', flexShrink: 0 }} />
            <span style={{ fontSize: 14, color: 'white' }}>
              {isKo ? '자유 탐방' : '自由探索'}
            </span>
          </div>
        ) : mockTodaySchedules.length === 1 ? (
          /* 일정 1개 — 크게 표시 */
          <>
            <div style={{ fontSize: 18, fontWeight: 'bold', color: 'white' }}>
              {isKo ? mockTodaySchedules[0].title_ko : mockTodaySchedules[0].title_ja}
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>
              {mockTodaySchedules[0].time_start}
              {mockTodaySchedules[0].time_end ? ` – ${mockTodaySchedules[0].time_end}` : ''}
              {' · '}
              {isKo ? mockTodaySchedules[0].location_ko : mockTodaySchedules[0].location_ja}
            </div>
          </>
        ) : (
          /* 일정 여러 개 — 타임라인 */
          <>
            <div style={{
              marginTop: 0,
              maxHeight: 150,
              overflowY: 'auto',
              scrollbarWidth: 'thin' as const,
            }}>
              {mockTodaySchedules.map((s, i) => (
                <div key={s.id} style={{
                  display: 'flex',
                  gap: 10,
                  alignItems: 'flex-start',
                  padding: '8px 0',
                  borderBottom: i < mockTodaySchedules.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none',
                }}>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', minWidth: 44, paddingTop: 2 }}>
                    {s.time_start ?? ''}
                  </div>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'rgba(255,255,255,0.4)', flexShrink: 0, marginTop: 4 }} />
                  <div>
                    <div style={{ fontSize: 13, color: 'white', fontWeight: 500, lineHeight: 1.4 }}>
                      {isKo ? s.title_ko : s.title_ja}
                    </div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 1 }}>
                      {isKo ? s.location_ko : s.location_ja}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center', fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 6, letterSpacing: 1 }}>
              ▼ {isKo ? '스크롤' : 'スクロール'}
            </div>
          </>
        )}
      </div>

      {/* 내일 집합 */}
      <SectionLabel>{isKo ? '내일 집합' : '明日の集合'}</SectionLabel>
      {mockTomorrowGathering ? (
        <div style={{
          background: '#FFF5EC',
          borderRadius: 14,
          padding: 14,
          marginBottom: 10,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}>
          <LocationOnIcon sx={{ fontSize: 28, color: '#f39c12' }} />
          <div>
            <div style={{ fontSize: 15, fontWeight: 'bold', color: '#111' }}>
              {isKo ? mockTomorrowGathering.location_ko : mockTomorrowGathering.location_ja}
            </div>
            <div style={{ fontSize: 13, color: '#aaa', marginTop: 2 }}>
              {mockTomorrowGathering.time} {isKo ? '집합' : '集合'}
            </div>
          </div>
        </div>
      ) : (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: '#f7f7f7',
          borderRadius: 14,
          padding: 14,
          marginBottom: 10,
        }}>
          <InboxIcon sx={{ fontSize: 22, color: '#ccc' }} />
          <div style={{ fontSize: 13, color: '#bbb' }}>
            {isKo ? '미정' : '未定'}
          </div>
        </div>
      )}

      {/* 공지 */}
      {(isKo ? mockSettings.notice_ko : mockSettings.notice_ja) && (
        <div style={{
          background: '#fffbe6',
          borderLeft: '3px solid #f39c12',
          borderRadius: '0 10px 10px 0',
          padding: '10px 12px',
          fontSize: 13,
          color: '#555',
          lineHeight: 1.6,
          marginBottom: 10,
        }}>
          <WarningAmberIcon sx={{ fontSize: 14, color: '#f39c12', verticalAlign: 'middle', mr: 0.5 }} />
          {isKo ? mockSettings.notice_ko : mockSettings.notice_ja}
        </div>
      )}

      {/* 통금 / 점호 */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        <div style={{
          flex: 1, textAlign: 'center', padding: '12px 8px',
          background: 'white', border: '1px solid #eee', borderRadius: 14,
          boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
        }}>
          <AssignmentIcon sx={{ fontSize: 20, color: '#555' }} />
          <div style={{ fontSize: 14, fontWeight: 'bold', marginTop: 4 }}>
            {mockSettings.curfew_time ?? (isKo ? '미정' : '未定')}
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
          <NightsStayIcon sx={{ fontSize: 20, color: '#555' }} />
          <div style={{ fontSize: 14, fontWeight: 'bold', marginTop: 4 }}>
            24:00 ~ 6:00
          </div>
          <div style={{ fontSize: 10, color: '#aaa', marginTop: 2 }}>
            {isKo ? '잠김' : '施錠'}
          </div>
        </div>
      </div>

      {/* WiFi */}
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
          <div style={{ fontSize: 13, fontWeight: 'bold', color: '#111' }}>{isKo ? '생활관' : '生活館'} WIFI : {mockSettings.wifi_ssid}</div>
          <div style={{ fontSize: 12, color: '#aaa', marginTop: 1 }}>password : {mockSettings.wifi_password}</div>
        </div>
        <button
          className="copy-btn"
          onClick={() => navigator.clipboard.writeText(mockSettings.wifi_password ?? '')}
        >
          {isKo ? '복사' : 'コピー'}
        </button>
      </div>

      {/* 교내 지도 */}
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

      {/* 학교 주소 */}
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
            {isKo ? mockSettings.school_address_ko : mockSettings.school_address_ja}
          </div>
        </div>
      </div>

      {/* 긴급 연락처 */}
      <SectionLabel>{isKo ? '긴급 연락처' : '緊急連絡先'}</SectionLabel>
      <div style={{
        background: 'white',
        border: '1px solid #f0f0f0',
        borderRadius: 14,
        padding: '4px 14px',
      }}>
        {mockEmergencyContacts.map((contact, i) => (
          <div key={contact.id} style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '9px 0',
            borderBottom: i < mockEmergencyContacts.length - 1 ? '1px solid #f5f5f5' : 'none',
          }}>
            <div>
              <div style={{ fontSize: 12, color: '#999' }}>
                {isKo ? contact.label_ko : contact.label_ja}
              </div>
              <div style={{ fontSize: 13, fontWeight: 'bold', color: '#1a1a2e', marginTop: 1 }}>
                {contact.phone}
              </div>
            </div>
            <a
              href={`tel:${contact.phone}`}
              style={{
                background: '#edfaf3',
                color: '#27ae60',
                border: 'none',
                padding: '5px 12px',
                borderRadius: 20,
                fontSize: 12,
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              <CallIcon sx={{ fontSize: 12, verticalAlign: 'middle', mr: 0.5 }} />
              {isKo ? '전화' : '電話'}
            </a>
          </div>
        ))}
      </div>

    </PageLayout>
  );
};

export default MainPage;
