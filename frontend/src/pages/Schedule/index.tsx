import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PageLayout from '../../components/PageLayout';
import { getSchedules } from '../../api/schedule';
import type { Schedule } from '../../api/schedule';

const DAY_KO = ['일', '월', '화', '수', '목', '금', '토'];
const DAY_JA = ['日', '月', '火', '水', '木', '金', '土'];

const DOT_COLORS = ['#1a1a2e', '#f39c12', '#27ae60', '#8e44ad', '#2980b9'];
const ROLLCALL_COLOR = '#e74c3c';

const TODAY = new Date().toISOString().slice(0, 10);

// 점호 여부 판단 (titleJa 기준)
const isRollCallItem = (s: Schedule) => s.titleJa === '点呼' || s.titleKo === '점호';

const SchedulePage = () => {
  const { i18n } = useTranslation();
  const isKo = i18n.language === 'ko';

  const [allSchedules, setAllSchedules] = useState<Schedule[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(TODAY);
  const stripRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    // 전체 일정을 한 번 로드하여 날짜 스트립과 타임라인 모두에 사용
    getSchedules()
      .then((data) => {
        setAllSchedules(data);
        // 오늘 날짜가 프로그램 기간에 없으면 첫 번째 날짜로 초기화
        const dates = [...new Set(data.map((s) => s.date))].sort();
        if (dates.length > 0 && !dates.includes(TODAY)) {
          setSelectedDate(dates[0]);
        }
      })
      .catch(() => setAllSchedules([]));
  }, []);

  // 전체 일정에서 고유 날짜 목록 추출 (오름차순)
  const programDates = [...new Set(allSchedules.map((s) => s.date))].sort();

  // 점호만 있는 날 = 자유 탐방일
  const freeDays = new Set(
    programDates.filter((date) => {
      const daySchedules = allSchedules.filter((s) => s.date === date);
      return daySchedules.length > 0 && daySchedules.every(isRollCallItem);
    }),
  );

  // 선택된 날짜의 일정
  const schedules = allSchedules.filter((s) => s.date === selectedDate);
  const isFreeDay = freeDays.has(selectedDate);
  const mainCount = schedules.filter((s) => !isRollCallItem(s)).length;
  const rollCall = schedules.find(isRollCallItem);
  const timelineItems = isFreeDay ? (rollCall ? [rollCall] : []) : schedules;

  // 날짜 선택 시 버튼이 스트립 가운데로 오도록 스크롤
  const handleSelect = (date: string) => {
    setSelectedDate(date);
    const btn = btnRefs.current[date];
    const strip = stripRef.current;
    if (!btn || !strip) return;
    strip.scrollTo({ left: btn.offsetLeft - strip.offsetWidth / 2 + btn.offsetWidth / 2, behavior: 'smooth' });
  };

  // 초기 로드 후 선택 날짜 버튼으로 스크롤
  useEffect(() => {
    if (programDates.length === 0) return;
    const btn = btnRefs.current[selectedDate];
    const strip = stripRef.current;
    if (!btn || !strip) return;
    strip.scrollLeft = btn.offsetLeft - strip.offsetWidth / 2 + btn.offsetWidth / 2;
  }, [programDates.length, selectedDate]);

  const formatLabel = (dateStr: string) => {
    const d = new Date(dateStr);
    const day = isKo ? DAY_KO[d.getDay()] : DAY_JA[d.getDay()];
    return isKo
      ? `${d.getMonth() + 1}월 ${d.getDate()}일 (${day})`
      : `${d.getMonth() + 1}月${d.getDate()}日 (${day})`;
  };

  return (
    <PageLayout titleKo="일정" titleJa="スケジュール">

      {/* ── 날짜 스트립 ── */}
      <div
        ref={stripRef}
        className="date-strip"
        style={{ display: 'flex', gap: 4, marginBottom: 14, overflowX: 'auto' }}
      >
        {programDates.map((date) => {
          const d = new Date(date);
          const dow = d.getDay();
          const isActive = date === selectedDate;
          const isToday = date === TODAY;
          const isFree = freeDays.has(date);
          const hasEvent = allSchedules
            .filter((s) => s.date === date)
            .some((s) => !isRollCallItem(s));

          const weekendColor = dow === 6 ? '#4a90d9' : dow === 0 ? '#e74c3c' : null;
          const dayName = isKo ? DAY_KO[dow] : DAY_JA[dow];

          const bg = isActive ? '#1a1a2e' : isToday ? '#fff8e1' : 'transparent';
          const nameColor = isActive ? 'rgba(255,255,255,0.55)' : (weekendColor ?? '#bbb');
          const numColor = isActive ? 'white' : isToday ? '#f39c12' : (weekendColor ?? '#333');
          const dotBg = isActive ? '#f39c12' : isFree ? '#27ae60' : hasEvent ? '#1a1a2e' : 'transparent';

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

      <div>

        {/* ── 날짜 레이블 ── */}
        {selectedDate && (
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
        )}

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
              const isLast = i === timelineItems.length - 1;
              const isRC = isRollCallItem(item);
              const dotColor = isRC ? ROLLCALL_COLOR : DOT_COLORS[i % DOT_COLORS.length];

              return (
                <div key={item.id} style={{ display: 'flex', alignItems: 'stretch' }}>

                  {/* 시간 열 */}
                  <div style={{
                    width: 52, flexShrink: 0,
                    display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
                    paddingRight: 12, paddingTop: 3,
                  }}>
                    <span style={{ fontSize: 11, color: '#999', textAlign: 'right', lineHeight: 1.5 }}>
                      {item.timeStart ?? ''}
                      {item.timeEnd && <><br />{item.timeEnd}</>}
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
                      color: isRC ? ROLLCALL_COLOR : '#111',
                    }}>
                      {isKo ? item.titleKo : item.titleJa}
                    </div>
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2,
                      fontSize: 12, color: '#bbb', marginTop: 3,
                    }}>
                      <LocationOnIcon sx={{ fontSize: 13, color: '#ccc' }} />
                      {isKo ? item.locationKo : (item.locationJa ?? item.locationKo)}
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
    </PageLayout>
  );
};

export default SchedulePage;
