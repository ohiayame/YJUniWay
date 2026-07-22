import { useState, useRef } from 'react';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { parseStudentDocument } from '../../../api/student';
import type { ParsedStudent } from '../../../api/student';
import { Overlay, ModalBox, ModalHeader } from '../../../components/ModalShell';

const rowInputStyle: React.CSSProperties = {
  width: '100%', padding: '6px 8px', borderRadius: 8,
  border: '1px solid #e0e0e0', fontSize: 12, outline: 'none',
  boxSizing: 'border-box', background: 'white',
};

// 학생 명단 가져오기 모달 (파일 업로드 후 파싱)
const ImportModal = ({
  isKo, onConfirm, onClose,
}: {
  isKo: boolean;
  onConfirm: (students: ParsedStudent[]) => void;
  onClose: () => void;
}) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'preview' | 'error'>('idle');
  const [rows, setRows] = useState<(ParsedStudent & { selected: boolean })[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

  // 파일 파싱 (백앤드에서 Claude AI를 이용해 PDF/이미지에서 학생 명단 추출)
  const handleFile = async (file: File) => {
    setStatus('loading');
    setErrorMsg('');

    try {
      const result = await parseStudentDocument(file);
      setRows(result.map(s => ({ ...s, selected: true })));
      setStatus('preview');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg || (isKo ? '파싱에 실패했습니다.' : 'パース失敗'));
      setStatus('error');
    }
  };

  // 미리보기 항목 필드 수정 (텍스트 교정)
  const updateRow = (i: number, patch: Partial<ParsedStudent>) =>
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
              {isKo ? 'Claude AI가 분석 중...' : 'Claude AIが分析中...'}
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
              {isKo ? `${rows.length}명 인식됨 — 내용을 확인·수정 후 등록하세요` : `${rows.length}名認識 — 内容を確認・修正して登録`}
            </div>
            <div style={{ maxHeight: 320, overflowY: 'auto', border: '1px solid #eee', borderRadius: 10, marginBottom: 14 }}>
              {rows.map((row, i) => (
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
                    <input
                      value={row.nameJa}
                      onChange={e => updateRow(i, { nameJa: e.target.value })}
                      disabled={!row.selected}
                      placeholder={isKo ? '일본어 이름' : '日本語名'}
                      style={rowInputStyle}
                    />
                    <input
                      value={row.nameKo ?? ''}
                      onChange={e => updateRow(i, { nameKo: e.target.value || null })}
                      disabled={!row.selected}
                      placeholder={isKo ? '한국어 이름' : '韓国語名'}
                      style={rowInputStyle}
                    />
                    <input
                      value={row.nameEn ?? ''}
                      onChange={e => updateRow(i, { nameEn: e.target.value || null })}
                      disabled={!row.selected}
                      placeholder={isKo ? '영어 이름' : '英語名'}
                      style={rowInputStyle}
                    />
                    <input
                      value={row.notes ?? ''}
                      onChange={e => updateRow(i, { notes: e.target.value || null })}
                      disabled={!row.selected}
                      placeholder={isKo ? '주의사항' : '注意事項'}
                      style={{ ...rowInputStyle, color: '#888' }}
                    />
                    <div style={{ display: 'flex', gap: 6 }}>
                      <input
                        value={row.roomNumber ?? ''}
                        onChange={e => updateRow(i, { roomNumber: e.target.value || null })}
                        disabled={!row.selected}
                        placeholder={isKo ? '호실' : '部屋'}
                        style={{ ...rowInputStyle, flex: 1 }}
                      />
                      <select
                        value={row.gender}
                        onChange={e => updateRow(i, { gender: e.target.value as 'M' | 'F' })}
                        disabled={!row.selected}
                        style={{
                          ...rowInputStyle, flex: 1, cursor: 'pointer',
                          color: row.gender === 'M' ? '#1565c0' : '#880e4f',
                        }}
                      >
                        <option value="M">{isKo ? '남' : '男'}</option>
                        <option value="F">{isKo ? '여' : '女'}</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setStatus('idle')} style={{ flex: 1, padding: 12, borderRadius: 12, border: '1px solid #ddd', background: 'white', fontSize: 13, cursor: 'pointer' }}>
                {isKo ? '다시 선택' : '選び直す'}
              </button>
              <button
                onClick={() => onConfirm(rows.filter(r => r.selected).map(
                  ({ nameJa, nameKo, nameEn, gender, roomNumber, notes }) =>
                    ({ nameJa, nameKo, nameEn, gender, roomNumber, notes }),
                ))}
                disabled={selectedCount === 0}
                style={{
                  flex: 1, padding: 12, borderRadius: 12, border: 'none',
                  background: selectedCount === 0 ? '#ccc' : '#1a1a2e',
                  color: 'white', fontSize: 13, fontWeight: 'bold',
                  cursor: selectedCount === 0 ? 'default' : 'pointer',
                }}
              >
                {isKo ? `${selectedCount}명 등록` : `${selectedCount}名登録`}
              </button>
            </div>
          </>
        )}
      </ModalBox>
    </Overlay>
  );
};

export default ImportModal;
