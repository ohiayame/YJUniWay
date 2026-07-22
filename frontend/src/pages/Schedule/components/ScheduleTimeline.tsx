import { useState } from 'react';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import NotesIcon from '@mui/icons-material/Notes';
import type { Schedule } from '../../../api/schedule';
import { isRollCallItem, formatLabel } from '../utils';
import MemoPanel from './memo/MemoPanel';
import ScheduleMemoBadge from './memo/ScheduleMemoBadge';

const DOT_COLORS = ['#1a1a2e', '#f39c12', '#27ae60', '#8e44ad', '#2980b9'];
const ROLLCALL_COLOR = '#e74c3c';

const itemBtnStyle = (color: string): React.CSSProperties => ({
  width: 22, height: 22, borderRadius: 6, border: 'none',
  background: `${color}18`, color, cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
});

interface ScheduleTimelineProps {
  timelineItems: Schedule[];
  isFreeDay: boolean;
  mainCount: number;
  selectedDate: string;
  isKo: boolean;
  isAdmin: boolean;
  onEdit: (item: Schedule) => void;
  onDelete: (item: Schedule) => void;
}

// 날짜 레이블 + 자유탐방 카드 + 일정 타임라인
const ScheduleTimeline = ({ timelineItems, isFreeDay, mainCount, selectedDate, isKo, isAdmin, onEdit, onDelete }: ScheduleTimelineProps) => {
  const [openMemos, setOpenMemos] = useState<Record<number, boolean>>({});
  const [openAdminMemos, setOpenAdminMemos] = useState<Record<number, boolean>>({});

  const toggleMemo = (id: number) => {
    setOpenMemos((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleAdminMemo = (id: number) => {
    setOpenAdminMemos((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div>

      {/* ── 날짜 레이블 ── */}
      {selectedDate && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <span style={{ fontSize: 15, fontWeight: 'bold', color: '#111' }}>
            {formatLabel(selectedDate, isKo)}
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
                  {(() => {
                    const memoText = isKo ? item.notesKo : (item.notesJa ?? item.notesKo);
                    const isMemoOpen = !!openMemos[item.id];
                    return (
                      <div style={{ background: '#f8f7f5', borderRadius: 10, padding: '14px 16px' }}>

                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                          {/* 일정 제목 */}
                          <div style={{
                            fontSize: 14, fontWeight: 600, lineHeight: 1.4,
                            color: isRC ? ROLLCALL_COLOR : '#111', marginBottom: 5,
                          }}>
                            {isKo ? item.titleKo : item.titleJa}
                          </div>

                          {/* 편집/삭제/메모 버튼 */}
                          {isAdmin && (
                            <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                              <button
                                onClick={() => toggleAdminMemo(item.id)}
                                style={{
                                  width: 22, height: 22, borderRadius: 6, border: 'none', cursor: 'pointer',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  flexShrink: 0, position: 'relative',
                                  background: openAdminMemos[item.id] ? '#4d4a7a' : '#4d4a7a18',
                                  color: openAdminMemos[item.id] ? 'white' : '#4d4a7a',
                                }}
                              >
                                <NotesIcon sx={{ fontSize: 12 }} />
                                <ScheduleMemoBadge scheduleId={item.id} active={!!openAdminMemos[item.id]} />
                              </button>
                              <button onClick={() => onEdit(item)} style={itemBtnStyle('#1a1a2e')}>
                                <EditIcon sx={{ fontSize: 12 }} />
                              </button>
                              <button onClick={() => onDelete(item)} style={itemBtnStyle('#c62828')}>
                                <DeleteIcon sx={{ fontSize: 12 }} />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* 위치 */}
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: 2,
                          fontSize: 12, color: '#bbb',
                        }}>
                          <LocationOnIcon sx={{ fontSize: 13, color: '#ccc' }} />
                          {isKo ? item.locationKo : (item.locationJa ?? item.locationKo)}
                        </div>

                        {/* 관리자 메모 (공유/나만보기) — 학생도 보는 위 공지와는 별개 */}
                        {isAdmin && openAdminMemos[item.id] && (
                          <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px dashed #e6e2f0' }}>
                            <MemoPanel targetType="schedule" targetDate={null} scheduleId={item.id} isKo={isKo} />
                          </div>
                        )}

                        {memoText && (
                          <>
                          {/* 메모 내용 */}
                            <div style={{
                              maxHeight: isMemoOpen ? 60 : 0, opacity: isMemoOpen ? 1 : 0,
                              overflow: 'hidden', transition: 'max-height .2s ease, opacity .2s ease',
                            }}>
                              <div style={{
                                fontSize: 11, color: '#999', lineHeight: 1.5,
                                borderTop: '1px solid rgba(0,0,0,.06)', marginTop: 8, paddingTop: 7,
                              }}>
                                <span style={{
                                  display: 'inline-block', fontSize: 10, fontWeight: 700,
                                  color: '#2e7d32', background: '#e8f5e9',
                                  borderRadius: 4, padding: '1px 6px', marginRight: 6,
                                }}>
                                  {isKo ? '공지' : 'お知らせ'}
                                </span>
                                {memoText}
                              </div>
                            </div>

                            {/* 메모 토글 버튼 */}
                            <div
                              onClick={() => toggleMemo(item.id)}
                              style={{
                                cursor: 'pointer', color: '#a39d92', fontSize: 11,
                                display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                                gap: 3, userSelect: 'none', marginTop: 4,
                              }}
                            >
                              {isKo ? '메모' : 'メモ'}
                              <ArrowDropDownIcon sx={{
                                fontSize: 18,
                                transition: 'transform .15s',
                                transform: isMemoOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                              }} />
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })()}
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
  );
};

export default ScheduleTimeline;
