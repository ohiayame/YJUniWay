import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import type { DormitorySection, DormitoryItem } from '../../../api/dormitory';

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
  isAdmin?: boolean;
  onEditSection?: (section: DormitorySection) => void;
  onAddItem?: (section: DormitorySection) => void;
  onEditItem?: (section: DormitorySection, item: DormitoryItem) => void;
  onDeleteItem?: (item: DormitoryItem) => void;
}

// 층별 안내 타임라인
// 층(floor) 자체는 건물 구조상 고정이라 관리자가 새로 "추가"하거나 "삭제"하는 기능은 두지 않음 — 항목 추가/수정/삭제와 기존 층 정보 수정만 지원
const FloorTimeline = ({
  floorSections, isKo, isAdmin,
  onEditSection,
  onAddItem, onEditItem, onDeleteItem,
}: FloorTimelineProps) => (
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

                {/* 관리자 전용 섹션 수정 버튼 (층 자체는 삭제 불가) */}
                {isAdmin && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginLeft: 'auto', flexShrink: 0 }}>
                    <button onClick={() => onEditSection?.(floor)} style={{ background: 'none', border: 'none', color: '#888', padding: 4, cursor: 'pointer', display: 'flex' }}>
                      <EditIcon sx={{ fontSize: 15 }} />
                    </button>
                  </div>
                )}
              </div>

              {/* 카드 바디 */}
              {(floor.items.length > 0 || isAdmin) && (
                <div style={{ padding: '0 14px 12px' }}>
                  {floor.items.map((item) => (
                    <div key={item.id} style={{
                      fontSize: 13, color: '#555', lineHeight: 1.5,
                      padding: '6px 0', borderTop: '1px solid #eee',
                      textAlign: 'left', display: 'flex', alignItems: 'flex-start', gap: 6,
                    }}>
                      <div style={{ flex: 1 }}>
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

                      {/* 관리자 전용 항목 수정/삭제 버튼 */}
                      {isAdmin && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
                          <button onClick={() => onEditItem?.(floor, item)} style={{ background: 'none', border: 'none', color: '#888', padding: 2, cursor: 'pointer', display: 'flex' }}>
                            <EditIcon sx={{ fontSize: 14 }} />
                          </button>
                          <button onClick={() => onDeleteItem?.(item)} style={{ background: 'none', border: 'none', color: '#c62828', padding: 2, cursor: 'pointer', display: 'flex' }}>
                            <DeleteIcon sx={{ fontSize: 14 }} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* 관리자 전용 항목 추가 버튼 */}
                  {isAdmin && (
                    <button
                      onClick={() => onAddItem?.(floor)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        marginTop: 8, padding: '4px 10px', borderRadius: 20, border: 'none',
                        background: '#e3f2fd', color: '#1565c0', fontSize: 11, cursor: 'pointer',
                      }}
                    >
                      <AddIcon sx={{ fontSize: 13 }} />
                      {isKo ? '항목 추가' : '項目追加'}
                    </button>
                  )}
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
