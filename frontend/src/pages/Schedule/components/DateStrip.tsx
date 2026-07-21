import { useRef, useEffect } from 'react';
import type { Schedule } from '../../../api/schedule';
import { DAY_KO, DAY_JA, TODAY, isRollCallItem } from '../utils';

interface DateStripProps {
  programDates: string[];
  selectedDate: string;
  onSelect: (date: string) => void;
  allSchedules: Schedule[];
  freeDays: Set<string>;
  isKo: boolean;
}

// 날짜 스트립 (가로 스크롤 날짜 선택)
const DateStrip = ({ programDates, selectedDate, onSelect, allSchedules, freeDays, isKo }: DateStripProps) => {
  const stripRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // 날짜 선택 시 버튼이 스트립 가운데로 오도록 스크롤
  const handleSelect = (date: string) => {
    onSelect(date);
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

  return (
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
  );
};

export default DateStrip;
