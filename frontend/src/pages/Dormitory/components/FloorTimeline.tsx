import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import type { DormitorySection } from '../../../api/dormitory';

const FLOOR_BADGE_STYLE: Record<string, { bg: string; color: string }> = {
  B1:  { bg: '#e8eaf6', color: '#3949ab' },
  '1F': { bg: '#e8f5e9', color: '#2e7d32' },
  '2F': { bg: '#e3f2fd', color: '#1565c0' },
  '3F': { bg: '#fff8e1', color: '#f57f17' },
  '4F': { bg: '#fce4ec', color: '#c2185b' },
  ALL: { bg: '#f3e5f5', color: '#6a1b9a' },
};

interface FloorTimelineProps {
  floorSections: DormitorySection[];
  isKo: boolean;
}

// 층별 안내 타임라인
const FloorTimeline = ({ floorSections, isKo }: FloorTimelineProps) => (
  <>
    <div style={{ fontSize: 11, fontWeight: 'bold', color: '#bbb', letterSpacing: 1, marginBottom: 10 }}>
      {isKo ? '층별 안내' : 'フロアガイド'}
    </div>

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
                {/* 층별 배지 */}
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

                {/* 층별 부제목 */}
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

                      {/* 경고 메시지 */}
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
  </>
);

export default FloorTimeline;
