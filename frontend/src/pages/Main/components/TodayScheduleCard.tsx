import type { Schedule } from '../../../api/schedule';
import SectionLabel from './SectionLabel';
import LocationOnIcon from '@mui/icons-material/LocationOn';

interface TodayScheduleCardProps {
  todaySchedules: Schedule[];
  isKo: boolean;
}

// 오늘 일정 카드
const TodayScheduleCard = ({ todaySchedules, isKo }: TodayScheduleCardProps) => (
  <>
    <SectionLabel>{isKo ? '오늘의 일정' : '今日のスケジュール'}</SectionLabel>
    <div style={{
      background: '#1a1a2e',
      borderRadius: 16,
      padding: 16,
      marginBottom: 10,
    }}>
      {/* 일정 내용이 없을 경우 자유 탐방 출력 */}
      {todaySchedules.length === 0 ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#27ae60', flexShrink: 0 }} />
          <span style={{ fontSize: 14, color: 'white' }}>
            {isKo ? '자유 탐방' : '自由探索'}
          </span>
        </div>
      ) : todaySchedules.length === 1 ? (
        /* 일정 1개 — 크게 표시 */
        <>
          <div style={{ fontSize: 18, fontWeight: 'bold', color: 'white' }}>
            {isKo ? todaySchedules[0].titleKo : todaySchedules[0].titleJa}
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>
            {todaySchedules[0].timeStart}
            {todaySchedules[0].timeEnd ? ` – ${todaySchedules[0].timeEnd}` : ''}
            {' · '}
            {isKo ? todaySchedules[0].locationKo : todaySchedules[0].locationJa}
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
            {todaySchedules.map((s, i) => {
              const memoText = isKo ? s.notesKo : (s.notesJa ?? s.notesKo);

              return (
                <div key={s.id} style={{
                  display: 'flex',
                  gap: 10,
                  alignItems: 'flex-start',
                  padding: '8px 0',
                  borderBottom: i < todaySchedules.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none',
                }}>
                  {/* 시간 */}
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', minWidth: 44, paddingTop: 2 }}>
                    {s.timeStart ?? ''}
                  </div>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'rgba(255,255,255,0.4)', flexShrink: 0, marginTop: 4 }} />
                  {/* 일정 제목과 장소 */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: 'white', fontWeight: 500, lineHeight: 1.4 }}>
                      {isKo ? s.titleKo : s.titleJa}
                    </div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 1 }}>
                      <LocationOnIcon sx={{ fontSize: 13, color: '#8f8f8f', verticalAlign: 'middle', mr: 0.5 }} />
                      {isKo ? s.locationKo : s.locationJa}
                      {memoText ? ' / ' + memoText : ''}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ textAlign: 'center', fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 6, letterSpacing: 1 }}>
            ▼ {isKo ? '스크롤' : 'スクロール'}
          </div>
        </>
      )}
    </div>
  </>
);

export default TodayScheduleCard;
