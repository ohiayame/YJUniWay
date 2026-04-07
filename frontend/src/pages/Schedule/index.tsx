import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BottomTab from '../../components/BottomTab';
import { getScheduleByDate, FREE_DAYS, PROGRAM_DATES } from '../../mock/scheduleData';

const DAY_KO = ['일', '월', '화', '수', '목', '금', '토'];
const DAY_JA = ['日', '月', '火', '水', '木', '金', '土'];

const DOT_COLORS = ['#1a1a2e', '#f39c12', '#27ae60', '#8e44ad', '#2980b9'];
const ROLLCALL_COLOR = '#e74c3c';

const TODAY = new Date().toISOString().slice(0, 10);
const initialDate = PROGRAM_DATES.includes(TODAY) ? TODAY : PROGRAM_DATES[0];

const SchedulePage = () => {
  const { i18n } = useTranslation();
  const isKo = i18n.language === 'ko';

  const [selectedDate, setSelectedDate] = useState(initialDate);
  const stripRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // 초기 마운트 시 선택된 날짜로 스크롤 (initialDate는 모듈 레벨 상수)
  useEffect(() => {
    const btn = btnRefs.current[initialDate];
    const strip = stripRef.current;
    if (!btn || !strip) return;
    const btnLeft = btn.offsetLeft;
    const btnWidth = btn.offsetWidth;
    const stripWidth = strip.offsetWidth;
    strip.scrollLeft = btnLeft - stripWidth / 2 + btnWidth / 2;
  }, []);

  const schedules    = getScheduleByDate(selectedDate);
  const isFreeDay    = FREE_DAYS.has(selectedDate);
  const mainCount    = schedules.filter(
    (s) => s.title_ko !== '점호' && s.title_ja !== '点呼',
  ).length;
  const rollCall     = schedules.find(
    (s) => s.title_ko === '점호' || s.title_ja === '点呼',
  );
  const timelineItems = isFreeDay
    ? rollCall ? [rollCall] : []
    : schedules;

  const handleSelect = (date: string) => {
    setSelectedDate(date);
    // 선택한 날짜 버튼을 스트립 중앙으로 스크롤
    const btn = btnRefs.current[date];
    const strip = stripRef.current;
    if (!btn || !strip) return;
    const btnLeft = btn.offsetLeft;
    const btnWidth = btn.offsetWidth;
    const stripWidth = strip.offsetWidth;
    strip.scrollTo({ left: btnLeft - stripWidth / 2 + btnWidth / 2, behavior: 'smooth' });
  };

  const formatLabel = (dateStr: string) => {
    const d   = new Date(dateStr);
    const day = isKo ? DAY_KO[d.getDay()] : DAY_JA[d.getDay()];
    return isKo
      ? `${d.getMonth() + 1}월 ${d.getDate()}일 (${day})`
      : `${d.getMonth() + 1}月${d.getDate()}日 (${day})`;
  };

  return (
    <div style={{ paddingBottom: 64, maxWidth: 480, background: 'white', minHeight: '100vh' }}>

      {/* 헤더 */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 18px', borderBottom: '1px solid #f0f0f0',
        background: 'white', position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ fontSize: 17, fontWeight: 'bold', color: '#111' }}>
          {isKo ? '일정' : 'スケジュール'}
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

      <main style={{ padding: '12px 0 20px' }}>

        {/* ── 날짜 스트립 ── */}
        <div
          ref={stripRef}
          className="date-strip"
          style={{
            display: 'flex', gap: 4,
            padding: '0 16px 4px',
            marginBottom: 14,
          }}
        >
          {PROGRAM_DATES.map((date) => {
            const d        = new Date(date);
            const dow      = d.getDay();
            const isActive = date === selectedDate;
            const isToday  = date === TODAY;
            const isFree   = FREE_DAYS.has(date);
            const hasEvent = getScheduleByDate(date).some(
              (s) => s.title_ko !== '점호' && s.title_ja !== '点呼',
            );

            const weekendColor = dow === 6 ? '#4a90d9' : dow === 0 ? '#e74c3c' : null;
            const dayName      = isKo ? DAY_KO[dow] : DAY_JA[dow];

            const bg        = isActive ? '#1a1a2e' : isToday ? '#fff8e1' : 'transparent';
            const nameColor = isActive ? 'rgba(255,255,255,0.55)' : (weekendColor ?? '#bbb');
            const numColor  = isActive ? 'white' : isToday ? '#f39c12' : (weekendColor ?? '#333');
            const dotBg     = isActive ? '#f39c12' : isFree ? '#27ae60' : hasEvent ? '#1a1a2e' : 'transparent';

            return (
              <button
                key={date}
                ref={(el) => { btnRefs.current[date] = el; }}
                onClick={() => handleSelect(date)}
                style={{
                  width: 40, padding: '7px 0', flexShrink: 0,
                  borderRadius: 12, border: 'none', cursor: 'pointer',
                  background: bg,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                }}
              >
                <span style={{ fontSize: 10, color: nameColor }}>{dayName}</span>
                <span style={{ fontSize: 15, fontWeight: 'bold', color: numColor }}>{d.getDate()}</span>
                <span style={{ width: 4, height: 4, borderRadius: '50%', background: dotBg }} />
              </button>
            );
          })}
        </div>

        <div style={{ padding: '0 16px' }}>

          {/* ── 날짜 레이블 ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <span style={{ fontSize: 15, fontWeight: 'bold', color: '#111' }}>
              {formatLabel(selectedDate)}
            </span>
            {isFreeDay ? (
              <span style={{
                fontSize: 11, background: '#e8f5e9', color: '#2e7d32',
                borderRadius: 20, padding: '2px 8px', fontWeight: 500,
              }}>
                {isKo ? '자유 탐방' : '自由散策'}
              </span>
            ) : mainCount > 0 && (
              <span style={{
                fontSize: 11, background: '#f0f0f0', color: '#888',
                borderRadius: 20, padding: '2px 8px',
              }}>
                {isKo ? `${mainCount}건` : `${mainCount}件`}
              </span>
            )}
          </div>

          {/* ── 자유 탐방 카드 ── */}
          {isFreeDay && (
            <div style={{
              background: 'linear-gradient(135deg, #e8f5e9, #f1f8e9)',
              borderRadius: 16, padding: '16px 18px',
              display: 'flex', alignItems: 'center', gap: 14,
              marginBottom: 16,
            }}>
              <span style={{ fontSize: 36, flexShrink: 0 }}>🗺️</span>
              <div>
                <div style={{ fontSize: 15, fontWeight: 'bold', color: '#2e7d32' }}>
                  {isKo ? '자유 탐방' : '自由散策'}
                </div>
                <div style={{ fontSize: 12, color: '#555', marginTop: 4, lineHeight: 1.7 }}>
                  {isKo ? '시간 제한 없이 자유롭게' : '自由に過ごせます'}<br />
                  {isKo ? '통금 시간을 반드시 지켜주세요' : '門限時間を必ず守ること'}
                </div>
              </div>
            </div>
          )}

          {/* ── 타임라인 ── */}
          {timelineItems.length > 0 ? (
            <div>
              {timelineItems.map((item, i) => {
                const isLast     = i === timelineItems.length - 1;
                const isRollCall = item.title_ko === '점호' || item.title_ja === '点呼';
                const dotColor   = isRollCall ? ROLLCALL_COLOR : DOT_COLORS[i % DOT_COLORS.length];

                return (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'stretch' }}>

                    {/* 시간 열 */}
                    <div style={{
                      width: 52, flexShrink: 0,
                      display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
                      paddingRight: 12, paddingTop: 3,
                    }}>
                      <span style={{ fontSize: 11, color: '#999', textAlign: 'right', lineHeight: 1.5 }}>
                        {item.time_start ?? ''}
                        {item.time_end && <><br />{item.time_end}</>}
                      </span>
                    </div>

                    {/* 점 + 선 */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                      <div style={{
                        width: 10, height: 10, borderRadius: '50%',
                        background: dotColor, marginTop: 4, flexShrink: 0,
                        boxShadow: `0 0 0 3px ${dotColor}22`,
                      }} />
                      {!isLast && (
                        <div style={{ width: 2, flex: 1, minHeight: 24, background: '#eee', margin: '3px 0' }} />
                      )}
                    </div>

                    {/* 내용 */}
                    <div style={{ flex: 1, paddingLeft: 12, paddingBottom: isLast ? 4 : 20 }}>
                      <div style={{
                        fontSize: 14, fontWeight: 500, lineHeight: 1.4, textAlign: 'center',
                        color: isRollCall ? ROLLCALL_COLOR : '#111',
                      }}>
                        {isKo ? item.title_ko : item.title_ja}
                      </div>
                      <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2,
                        fontSize: 12, color: '#bbb', marginTop: 3,
                      }}>
                        <LocationOnIcon sx={{ fontSize: 13, color: '#ccc' }} />
                        {isKo ? item.location_ko : (item.location_ja ?? item.location_ko)}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          ) : !isFreeDay && (
            <div style={{ textAlign: 'center', color: '#ccc', fontSize: 13, marginTop: 60, lineHeight: 2 }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>📭</div>
              {isKo ? '일정이 없습니다' : '予定はありません'}
            </div>
          )}

        </div>
      </main>

      <BottomTab />
    </div>
  );
};

export default SchedulePage;
