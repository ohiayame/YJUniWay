import { useState, useRef, useMemo } from 'react';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { parseScheduleDocument } from '../../../api/schedule';
import type { ParsedSchedule, Schedule } from '../../../api/schedule';
import { Overlay, ModalBox, ModalHeader } from '../../../components/ModalShell';

const rowInputStyle: React.CSSProperties = {
  width: '100%', padding: '6px 8px', borderRadius: 8,
  border: '1px solid #e0e0e0', fontSize: 12, outline: 'none',
  boxSizing: 'border-box', background: 'white',
};

type Row = ParsedSchedule & { selected: boolean };

// 일정 가져오기 모달 (파일 업로드 → Claude AI로 여러 일정 추출/번역 → 확인 후 일괄 등록)
const ScheduleImportModal = ({
  isKo, allSchedules, onConfirm, onClose,
}: {
  isKo: boolean;
  allSchedules: Schedule[];
  onConfirm: (schedules: ParsedSchedule[]) => void;
  onClose: () => void;
}) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'preview' | 'error'>('idle');
  const [rows, setRows] = useState<Row[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  // 날짜별 기존 일정 조회용 맵 (같은 날짜인지만 비교, 최종 등록 여부는 사용자 판단)
  const existingByDate = useMemo(() => {
    const map = new Map<string, Schedule[]>();
    for (const s of allSchedules) {
      if (!map.has(s.date)) map.set(s.date, []);
      map.get(s.date)!.push(s);
    }
    return map;
  }, [allSchedules]);

  // 파일 파싱 (백엔드에서 Claude AI로 추출 + 한→일 번역까지 수행)
  const handleFile = async (file: File) => {
    setStatus('loading');
    setErrorMsg('');

    try {
      const result = await parseScheduleDocument(file);
      const sorted = [...result].sort((a, b) =>
        a.date === b.date
          ? (a.timeStart ?? '').localeCompare(b.timeStart ?? '')
          : a.date.localeCompare(b.date),
      );
      setRows(sorted.map(s => ({ ...s, selected: true })));
      setStatus('preview');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg || (isKo ? '파싱에 실패했습니다.' : 'パース失敗'));
      setStatus('error');
    }
  };

  // 미리보기 항목 필드 수정 (텍스트 교정)
  const updateRow = (i: number, patch: Partial<ParsedSchedule>) =>
    setRows(prev => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  // 미리보기 항목 선택/해제 (등록 대상에서 제외, 값은 유지)
  const toggleRow = (i: number) =>
    setRows(prev => prev.map((r, idx) => (idx === i ? { ...r, selected: !r.selected } : r)));

  const selectedCount = rows.filter(r => r.selected).length;

  // 드래그 앤 드롭으로 파일 업로드
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <Overlay onClose={onClose}>
      <ModalBox>
        <ModalHeader
          title={isKo ? 'PDF / 이미지 가져오기' : 'PDF / 画像から読み込み'}
          onClose={onClose}
        />

        {/* idle 상태의 파일 업로드 영역 */}
        {status === 'idle' && (
          <div
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
            onClick={() => fileRef.current?.click()}
            style={{
              border: '2px dashed #ddd', borderRadius: 12,
              padding: '36px 20px', textAlign: 'center',
              cursor: 'pointer', color: '#aaa', marginBottom: 4,
            }}
          >
            <UploadFileIcon sx={{ fontSize: 40, color: '#ccc', display: 'block', margin: '0 auto 10px' }} />
            <div style={{ fontSize: 13, fontWeight: 500 }}>
              {isKo ? 'PDF 또는 이미지를 드래그하거나 클릭' : 'PDF or 画像をドラッグ or クリック'}
            </div>
            <div style={{ fontSize: 11, marginTop: 6 }}>JPG · PNG · PDF · 최대 20MB</div>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,image/*"
              style={{ display: 'none' }}
              onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
            />
          </div>
        )}

        {/* 로딩 상태 표시 */}
        {status === 'loading' && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#888' }}>
            <HourglassEmptyIcon sx={{ fontSize: 32, color: '#888', marginBottom: 1.5 }} />
            <div style={{ fontSize: 13 }}>
              {isKo ? 'Claude AI가 분석 및 번역 중...' : 'Claude AIが分析・翻訳中...'}
            </div>
          </div>
        )}

        {/* 에러 상태 표시 */}
        {status === 'error' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <WarningAmberIcon sx={{ fontSize: 32, color: '#c62828', marginBottom: 1.25 }} />
            <div style={{ fontSize: 12, color: '#c62828', marginBottom: 16 }}>{errorMsg}</div>
            <button onClick={() => setStatus('idle')} style={{ padding: '10px 24px', borderRadius: 10, border: '1px solid #ddd', background: 'white', cursor: 'pointer', fontSize: 13 }}>
              {isKo ? '다시 시도' : '再試行'}
            </button>
          </div>
        )}

        {/* 파싱 후 미리보기 상태 표시 (체크박스로 선택, 입력창으로 수정 가능) */}
        {status === 'preview' && (
          <>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 10 }}>
              {isKo ? `${rows.length}건 인식됨 — 내용을 확인·수정 후 등록하세요` : `${rows.length}件認識 — 内容を確認・修正して登録`}
            </div>
            <div style={{ maxHeight: 360, overflowY: 'auto', border: '1px solid #eee', borderRadius: 10, marginBottom: 14 }}>
              {rows.map((row, i) => {
                const existing = existingByDate.get(row.date) ?? [];
                return (
                  <div key={i} style={{
                    display: 'flex', gap: 8, alignItems: 'flex-start',
                    padding: '12px', borderBottom: i < rows.length - 1 ? '1px solid #f5f5f5' : 'none',
                    opacity: row.selected ? 1 : 0.4,
                  }}>
                    <input
                      type="checkbox"
                      checked={row.selected}
                      onChange={() => toggleRow(i)}
                      style={{ marginTop: 9, cursor: 'pointer', flexShrink: 0 }}
                    />
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <input
                          type="date"
                          value={row.date}
                          onChange={e => updateRow(i, { date: e.target.value })}
                          disabled={!row.selected}
                          style={{ ...rowInputStyle, flex: 1 }}
                        />
                        <input
                          type="time"
                          value={row.timeStart ?? ''}
                          onChange={e => updateRow(i, { timeStart: e.target.value || null })}
                          disabled={!row.selected}
                          style={{ ...rowInputStyle, flex: 1 }}
                        />
                        <input
                          type="time"
                          value={row.timeEnd ?? ''}
                          onChange={e => updateRow(i, { timeEnd: e.target.value || null })}
                          disabled={!row.selected}
                          style={{ ...rowInputStyle, flex: 1 }}
                        />
                      </div>

                      {existing.length > 0 && (
                        <div>
                          <button
                            type="button"
                            onClick={() => setExpandedIdx(expandedIdx === i ? null : i)}
                            style={{
                              fontSize: 10, color: '#e65100', background: '#fff3e0',
                              border: 'none', borderRadius: 6, padding: '3px 8px', cursor: 'pointer',
                            }}
                          >
                            {isKo
                              ? `이 날짜에 기존 일정 ${existing.length}건`
                              : `この日付に既存の予定${existing.length}件`}
                          </button>
                          {expandedIdx === i && (
                            <div style={{ fontSize: 11, color: '#888', marginTop: 4, paddingLeft: 4 }}>
                              {existing.map(s => (
                                <div key={s.id}>
                                  {s.timeStart ? `${s.timeStart} ` : ''}{isKo ? (s.titleKo || s.titleJa) : s.titleJa}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      <input
                        value={row.titleJa}
                        onChange={e => updateRow(i, { titleJa: e.target.value })}
                        disabled={!row.selected}
                        placeholder={isKo ? '일정명 (일본어) *' : 'タイトル (日本語) *'}
                        style={rowInputStyle}
                      />
                      <input
                        value={row.titleKo ?? ''}
                        onChange={e => updateRow(i, { titleKo: e.target.value || null })}
                        disabled={!row.selected}
                        placeholder={isKo ? '일정명 (한국어)' : 'タイトル (韓国語)'}
                        style={rowInputStyle}
                      />
                      <input
                        value={row.locationKo ?? ''}
                        onChange={e => updateRow(i, { locationKo: e.target.value || null })}
                        disabled={!row.selected}
                        placeholder={isKo ? '장소 (한국어)' : '場所 (韓国語)'}
                        style={rowInputStyle}
                      />
                      <input
                        value={row.locationJa ?? ''}
                        onChange={e => updateRow(i, { locationJa: e.target.value || null })}
                        disabled={!row.selected}
                        placeholder={isKo ? '장소 (일본어)' : '場所 (日本語)'}
                        style={rowInputStyle}
                      />
                      <input
                        value={row.managerName ?? ''}
                        onChange={e => updateRow(i, { managerName: e.target.value || null })}
                        disabled={!row.selected}
                        placeholder={isKo ? '담당자' : '担当者'}
                        style={rowInputStyle}
                      />
                      <input
                        value={row.notesKo ?? ''}
                        onChange={e => updateRow(i, { notesKo: e.target.value || null })}
                        disabled={!row.selected}
                        placeholder={isKo ? '비고 (한국어)' : '備考 (韓国語)'}
                        style={{ ...rowInputStyle, color: '#888' }}
                      />
                      <input
                        value={row.notesJa ?? ''}
                        onChange={e => updateRow(i, { notesJa: e.target.value || null })}
                        disabled={!row.selected}
                        placeholder={isKo ? '비고 (일본어)' : '備考 (日本語)'}
                        style={{ ...rowInputStyle, color: '#888' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setStatus('idle')} style={{ flex: 1, padding: 12, borderRadius: 12, border: '1px solid #ddd', background: 'white', fontSize: 13, cursor: 'pointer' }}>
                {isKo ? '다시 선택' : '選び直す'}
              </button>
              <button
                onClick={() => onConfirm(rows.filter(r => r.selected).map(
                  ({ date, timeStart, timeEnd, titleKo, titleJa, locationKo, locationJa, managerName, notesKo, notesJa }) =>
                    ({ date, timeStart, timeEnd, titleKo, titleJa, locationKo, locationJa, managerName, notesKo, notesJa }),
                ))}
                disabled={selectedCount === 0}
                style={{
                  flex: 1, padding: 12, borderRadius: 12, border: 'none',
                  background: selectedCount === 0 ? '#ccc' : '#1a1a2e',
                  color: 'white', fontSize: 13, fontWeight: 'bold',
                  cursor: selectedCount === 0 ? 'default' : 'pointer',
                }}
              >
                {isKo ? `${selectedCount}건 등록` : `${selectedCount}件登録`}
              </button>
            </div>
          </>
        )}
      </ModalBox>
    </Overlay>
  );
};

export default ScheduleImportModal;
