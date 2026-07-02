import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../store';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CloseIcon from '@mui/icons-material/Close';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import PageLayout from '../../components/PageLayout';
import { getStudents, createStudent, updateStudent, removeStudent, parseStudentDocument } from '../../api/student';
import type { Student, ParsedStudent } from '../../api/student';

type SortKey = 'id' | 'room';

// ─── 메인 페이지 ────────────────────────────────────────────────────────────────

const StudentListPage = () => {
  const { i18n } = useTranslation();
  const isKo = i18n.language === 'ko';
  const { isAdmin } = useAppSelector((state) => state.auth);

  const [students, setStudents] = useState<Student[]>([]);
  const [sort, setSort] = useState<SortKey>('id');
  const [expanded, setExpanded] = useState<number | null>(null);

  // 모달 상태
  const [editTarget, setEditTarget] = useState<Student | null>(null); // null = 추가, Student = 수정
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);
  const [showImport, setShowImport] = useState(false);

  useEffect(() => {
    getStudents().then(setStudents).catch(() => setStudents([]));
  }, []);

  const sorted = [...students].sort((a, b) =>
    sort === 'room'
      ? (a.roomNumber ?? '').localeCompare(b.roomNumber ?? '')
      : a.id - b.id,
  );

  // ─── CRUD 핸들러 ───────────────────────────────────────────────────────────

  const handleSave = async (form: Omit<Student, 'id'>) => {
    try {
      if (editTarget) {
        const updated = await updateStudent(editTarget.id, form);
        setStudents(prev => prev.map(s => s.id === editTarget.id ? updated : s));
      } else {
        const created = await createStudent(form);
        setStudents(prev => [...prev, created]);
      }
    } catch {
      // API 오류 시 상태 변경 없이 모달만 닫음
    }
    setShowForm(false);
    setEditTarget(null);
  };

  const handleDelete = async (student: Student) => {
    try {
      await removeStudent(student.id);
      setStudents(prev => prev.filter(s => s.id !== student.id));
    } catch {
      // API 오류 시 목록 유지
    }
    setDeleteTarget(null);
  };

  const handleImportConfirm = async (parsed: ParsedStudent[]) => {
    const added: Student[] = [];
    for (const item of parsed) {
      try {
        const created = await createStudent(item);
        added.push(created);
      } catch {
        // 개별 항목 등록 실패 시 건너뜀
      }
    }
    setStudents(prev => [...prev, ...added]);
    setShowImport(false);
  };

  // ─── 렌더 ──────────────────────────────────────────────────────────────────

  return (
    <PageLayout titleKo="명단" titleJa="名簿">

      {/* 상단 컨트롤 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
        <SortButton label={isKo ? 'ID순' : 'ID順'} active={sort === 'id'} onClick={() => setSort('id')} />
        <SortButton label={isKo ? '방 번호순' : '部屋順'} active={sort === 'room'} onClick={() => setSort('room')} />
        <span style={{ marginLeft: 'auto', fontSize: 11, color: '#aaa' }}>
          {isKo ? `총 ${students.length}명` : `全${students.length}名`}
        </span>
        {isAdmin && (
          <>
            <button onClick={() => setShowImport(true)} style={iconBtnStyle('#e3f2fd', '#1565c0')}>
              <UploadFileIcon sx={{ fontSize: 16 }} />
            </button>
            <button onClick={() => { setEditTarget(null); setShowForm(true); }} style={iconBtnStyle('#e8f5e9', '#2e7d32')}>
              <AddIcon sx={{ fontSize: 16 }} />
            </button>
          </>
        )}
      </div>

      {/* 테이블 헤더 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isAdmin ? '28px 1fr 44px 28px 56px' : '28px 1fr 44px 28px',
        padding: '5px 12px',
        background: '#f5f5f5',
        borderRadius: '8px 8px 0 0',
        border: '1px solid #eee',
        borderBottom: 'none',
      }}>
        <ColHead label="ID" active={sort === 'id'} />
        <ColHead label={isKo ? '이름' : '名前'} paddingLeft={4} />
        <ColHead label={isKo ? '방' : '部屋'} center />
        <ColHead label={isKo ? '성별' : '性別'} center />
        {isAdmin && <ColHead label="" center />}
      </div>

      {/* 학생 리스트 */}
      <div style={{ border: '1px solid #eee', borderRadius: '0 0 8px 8px', overflow: 'hidden' }}>
        {sorted.map((student, idx) => (
          <StudentRow
            key={student.id}
            student={student}
            isKo={isKo}
            isLast={idx === sorted.length - 1}
            isAdmin={isAdmin}
            expanded={expanded === student.id}
            onToggle={() => setExpanded(expanded === student.id ? null : student.id)}
            onEdit={() => { setEditTarget(student); setShowForm(true); }}
            onDelete={() => setDeleteTarget(student)}
          />
        ))}
      </div>

      {/* 모달들 */}
      {showForm && (
        <StudentFormModal
          initial={editTarget ?? undefined}
          isKo={isKo}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditTarget(null); }}
        />
      )}
      {deleteTarget && (
        <DeleteConfirmModal
          student={deleteTarget}
          isKo={isKo}
          onConfirm={() => handleDelete(deleteTarget)}
          onClose={() => setDeleteTarget(null)}
        />
      )}
      {showImport && (
        <ImportModal
          isKo={isKo}
          onConfirm={handleImportConfirm}
          onClose={() => setShowImport(false)}
        />
      )}

    </PageLayout>
  );
};

// ─── 학생 행 ─────────────────────────────────────────────────────────────────

const StudentRow = ({
  student, isKo, isLast, isAdmin, expanded, onToggle, onEdit, onDelete,
}: {
  student: Student; isKo: boolean; isLast: boolean; isAdmin: boolean;
  expanded: boolean; onToggle: () => void; onEdit: () => void; onDelete: () => void;
}) => {
  const isMale = student.gender === 'M';

  return (
    <div style={{ borderBottom: isLast ? 'none' : '1px solid #f5f5f5' }}>
      <div
        onClick={onToggle}
        style={{
          display: 'grid',
          gridTemplateColumns: isAdmin ? '28px 1fr 44px 28px 56px' : '28px 1fr 44px 28px',
          alignItems: 'center',
          padding: '10px 12px',
          cursor: 'pointer',
          background: expanded ? '#fafafa' : 'white',
        }}
      >
        <div style={{ fontSize: 11, color: '#aaa', textAlign: 'center' }}>{student.id}</div>

        <div style={{ paddingLeft: 4 }}>
          <div style={{ fontSize: 13, fontWeight: 'bold', color: '#111' }}>
            {isKo ? (student.nameKo ?? student.nameJa) : student.nameJa}
          </div>
          <div style={{ fontSize: 10, color: '#aaa', marginTop: 2 }}>
            {student.nameEn}
            {student.notes && (
              <span style={{
                marginLeft: 6, fontSize: 10, color: '#e65100',
                background: '#fff3e0', borderRadius: 8, padding: '1px 5px',
              }}>
                {isKo ? '주의' : '注意'}
              </span>
            )}
          </div>
        </div>

        <div style={{ fontSize: 11, fontWeight: 'bold', color: '#1a1a2e', textAlign: 'center' }}>
          {student.roomNumber ?? '-'}
        </div>

        <div style={{ fontSize: 12, textAlign: 'center', color: isMale ? '#1565c0' : '#880e4f' }}>
          {isKo ? (isMale ? '남' : '여') : (isMale ? '男' : '女')}
        </div>

        {isAdmin && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 4 }} onClick={e => e.stopPropagation()}>
            <button onClick={onEdit} style={rowBtnStyle('#1a1a2e')}>
              <EditIcon sx={{ fontSize: 13 }} />
            </button>
            <button onClick={onDelete} style={rowBtnStyle('#c62828')}>
              <DeleteIcon sx={{ fontSize: 13 }} />
            </button>
          </div>
        )}
      </div>

      {expanded && (
        <div style={{
          padding: '8px 12px 12px 44px',
          background: '#fafafa',
          borderTop: '1px solid #f0f0f0',
          fontSize: 12, color: '#555',
        }}>
          {student.nameKo && (
            <div style={{ marginBottom: 4 }}>
              <span style={{ color: '#aaa', marginRight: 8 }}>{isKo ? '일본어 이름' : '韓国語名'}</span>
              {isKo ? student.nameJa : student.nameKo}
            </div>
          )}
          {student.nameEn && (
            <div style={{ marginBottom: 4 }}>
              <span style={{ color: '#aaa', marginRight: 8 }}>{isKo ? '영어 이름' : '英語名'}</span>
              {student.nameEn}
            </div>
          )}
          {student.notes ? (
            <div style={{
              marginTop: 6, background: '#fff3e0', borderRadius: 8,
              padding: '6px 10px', color: '#e65100', fontSize: 12,
            }}>
              {isKo ? '주의사항: ' : '注意事項: '}{student.notes}
            </div>
          ) : (
            <div style={{ color: '#ccc', fontSize: 11 }}>
              {isKo ? '주의사항 없음' : '注意事項なし'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── 추가/수정 모달 ──────────────────────────────────────────────────────────

const StudentFormModal = ({
  initial, isKo, onSave, onClose,
}: {
  initial?: Student; isKo: boolean;
  onSave: (form: Omit<Student, 'id'>) => void;
  onClose: () => void;
}) => {
  const [form, setForm] = useState<Omit<Student, 'id'>>({
    nameJa: initial?.nameJa ?? '',
    nameKo: initial?.nameKo ?? '',
    nameEn: initial?.nameEn ?? '',
    gender: initial?.gender ?? 'M',
    roomNumber: initial?.roomNumber ?? '',
    notes: initial?.notes ?? '',
  });

  const set = (key: keyof typeof form, val: string) =>
    setForm(prev => ({ ...prev, [key]: (key === 'nameJa' || key === 'gender') ? val : (val || null) }));

  const isEdit = !!initial;
  const [showConfirm, setShowConfirm] = useState(false);

  const hasJa = (v: string) => /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\u3400-\u4DBF]/.test(v);
  const hasNonJaChars = (v: string) => /[^\u3040-\u30FF\u4E00-\u9FFF\u3400-\u4DBF\u3000\s]/.test(v);
  const hasKo = (v: string) => /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/.test(v);
  const hasNonKoChars = (v: string) => /[^\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F\s]/.test(v);
  // eslint-disable-next-line no-control-regex
  const hasNonEn = (v: string) => /[^\x00-\x7F\s]/.test(v);

  const warnJa = form.nameJa.trim().length > 0 && (!hasJa(form.nameJa) || hasNonJaChars(form.nameJa));
  const warnKo = (form.nameKo ?? '').trim().length > 0 && (!hasKo(form.nameKo ?? '') || hasNonKoChars(form.nameKo ?? ''));
  const warnEn = (form.nameEn ?? '').trim().length > 0 && hasNonEn(form.nameEn ?? '');

  const canSubmit = form.nameJa.trim().length > 0 && !warnJa && !warnKo && !warnEn;

  if (showConfirm) {
    const isMale = form.gender === 'M';
    const rows: { label: string; value: string | null | undefined }[] = [
      { label: isKo ? '일본어 이름' : '日本語名', value: form.nameJa },
      { label: isKo ? '한국어 이름' : '韓国語名', value: form.nameKo },
      { label: isKo ? '영어 이름' : '英語名', value: form.nameEn },
      { label: isKo ? '성별' : '性別', value: isKo ? (isMale ? '남성' : '여성') : (isMale ? '男性' : '女性') },
      { label: isKo ? '방 번호' : '部屋番号', value: form.roomNumber || '-' },
      { label: isKo ? '주의사항' : '注意事項', value: form.notes || (isKo ? '없음' : 'なし') },
    ];
    return (
      <Overlay onClose={onClose}>
        <ModalBox>
          <ModalHeader title={isEdit ? (isKo ? '수정 내용 확인' : '更新内容の確認') : (isKo ? '추가 내용 확인' : '追加内容の確認')} onClose={onClose} />
          <div style={{ fontSize: 12, color: '#888', marginBottom: 12 }}>
            {isEdit
              ? (isKo ? '아래 내용으로 수정하시겠습니까?' : '以下の内容で更新しますか？')
              : (isKo ? '아래 내용으로 추가하시겠습니까?' : '以下の内容で追加しますか？')}
          </div>
          <div style={{ border: '1px solid #eee', borderRadius: 10, overflow: 'hidden', marginBottom: 16 }}>
            {rows.map((row, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '9px 14px',
                borderBottom: i < rows.length - 1 ? '1px solid #f5f5f5' : 'none',
                background: i % 2 === 0 ? 'white' : '#fafafa',
              }}>
                <span style={{ fontSize: 11, color: '#aaa', minWidth: 72 }}>{row.label}</span>
                <span style={{ fontSize: 13, fontWeight: 'bold', color: '#111', textAlign: 'right' }}>{row.value || '-'}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setShowConfirm(false)} style={{ flex: 1, padding: 12, borderRadius: 12, border: '1px solid #ddd', background: 'white', fontSize: 13, cursor: 'pointer' }}>
              {isKo ? '돌아가기' : '戻る'}
            </button>
            <button onClick={() => onSave(form)} style={{ flex: 1, padding: 12, borderRadius: 12, border: 'none', background: '#1a1a2e', color: 'white', fontSize: 13, fontWeight: 'bold', cursor: 'pointer' }}>
              {isEdit ? (isKo ? '수정하기' : '更新する') : (isKo ? '추가하기' : '追加する')}
            </button>
          </div>
        </ModalBox>
      </Overlay>
    );
  }

  return (
    <Overlay onClose={onClose}>
      <ModalBox>
        <ModalHeader title={isEdit ? (isKo ? '학생 수정' : '学生編集') : (isKo ? '학생 추가' : '学生追加')} onClose={onClose} />

        <Field label={isKo ? '일본어 이름 *' : '日本語名 *'}>
          <input style={{ ...inputStyle, borderColor: warnJa ? '#e65100' : '#e0e0e0' }} value={form.nameJa} onChange={e => set('nameJa', e.target.value)} placeholder="田中 雄太" />
          {warnJa && <div style={warnStyle}>{isKo ? '일본어(히라가나·가타카나·한자)를 입력해주세요' : '日本語（ひらがな・カタカナ・漢字）を入力してください'}</div>}
        </Field>
        <Field label={isKo ? '한국어 이름' : '韓国語名'}>
          <input style={{ ...inputStyle, borderColor: warnKo ? '#e65100' : '#e0e0e0' }} value={form.nameKo ?? ''} onChange={e => set('nameKo', e.target.value)} placeholder="다나카 유타" />
          {warnKo && <div style={warnStyle}>{isKo ? '한글을 입력해주세요' : '韓国語（ハングル）を入力してください'}</div>}
        </Field>
        <Field label={isKo ? '영어 이름' : '英語名'}>
          <input style={{ ...inputStyle, borderColor: warnEn ? '#e65100' : '#e0e0e0' }} value={form.nameEn ?? ''} onChange={e => set('nameEn', e.target.value)} placeholder="TANAKA Yuta" />
          {warnEn && <div style={warnStyle}>{isKo ? '영문(알파벳)만 입력해주세요' : 'アルファベットのみ入力してください'}</div>}
        </Field>

        <div style={{ display: 'flex', gap: 12 }}>
          <Field label={isKo ? '성별' : '性別'} style={{ flex: 1 }}>
            <select
              style={{ ...inputStyle, cursor: 'pointer' }}
              value={form.gender}
              onChange={e => setForm(prev => ({ ...prev, gender: e.target.value as 'M' | 'F' }))}
            >
              <option value="M">{isKo ? '남성' : '男性'}</option>
              <option value="F">{isKo ? '여성' : '女性'}</option>
            </select>
          </Field>
          <Field label={isKo ? '방 번호' : '部屋番号'} style={{ flex: 1 }}>
            <input style={inputStyle} value={form.roomNumber ?? ''} onChange={e => set('roomNumber', e.target.value)} placeholder="101" />
          </Field>
        </div>

        <Field label={isKo ? '주의사항' : '注意事項'}>
          <input style={inputStyle} value={form.notes ?? ''} onChange={e => set('notes', e.target.value)} placeholder={isKo ? '알레르기 있음' : 'アレルギーあり'} />
        </Field>

        <button
          onClick={() => {
            if (!canSubmit) return;
            setShowConfirm(true);
          }}
          disabled={!canSubmit}
          style={{
            width: '100%', padding: 14, marginTop: 8,
            background: canSubmit ? '#1a1a2e' : '#ccc',
            color: 'white', border: 'none', borderRadius: 12,
            fontSize: 14, fontWeight: 'bold', cursor: canSubmit ? 'pointer' : 'default',
          }}
        >
          {isEdit ? (isKo ? '수정하기' : '更新する') : (isKo ? '추가하기' : '追加する')}
        </button>
      </ModalBox>
    </Overlay>
  );
};

// ─── 삭제 확인 모달 ──────────────────────────────────────────────────────────

const DeleteConfirmModal = ({
  student, isKo, onConfirm, onClose,
}: {
  student: Student; isKo: boolean; onConfirm: () => void; onClose: () => void;
}) => (
  <Overlay onClose={onClose}>
    <ModalBox>
      <ModalHeader title={isKo ? '학생 삭제' : '学生削除'} onClose={onClose} />
      <div style={{ textAlign: 'center', padding: '12px 0 20px' }}>
        <DeleteIcon sx={{ fontSize: 36, color: '#c62828', marginBottom: 1.5 }} />
        <div style={{ fontSize: 15, fontWeight: 'bold', color: '#111', marginBottom: 6 }}>
          {isKo ? (student.nameKo ?? student.nameJa) : student.nameJa}
        </div>
        <div style={{ fontSize: 12, color: '#999' }}>
          {isKo ? '이 학생을 삭제하시겠습니까?' : 'この学生を削除しますか？'}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onClose} style={{ flex: 1, padding: 12, borderRadius: 12, border: '1px solid #ddd', background: 'white', fontSize: 13, cursor: 'pointer' }}>
          {isKo ? '취소' : 'キャンセル'}
        </button>
        <button onClick={onConfirm} style={{ flex: 1, padding: 12, borderRadius: 12, border: 'none', background: '#c62828', color: 'white', fontSize: 13, fontWeight: 'bold', cursor: 'pointer' }}>
          {isKo ? '삭제' : '削除'}
        </button>
      </div>
    </ModalBox>
  </Overlay>
);

// ─── PDF/이미지 가져오기 모달 ─────────────────────────────────────────────────

const ImportModal = ({
  isKo, onConfirm, onClose,
}: {
  isKo: boolean;
  onConfirm: (students: ParsedStudent[]) => void;
  onClose: () => void;
}) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'preview' | 'error'>('idle');
  const [parsed, setParsed] = useState<ParsedStudent[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

  const handleFile = async (file: File) => {
    setStatus('loading');
    setErrorMsg('');

    try {
      const result = await parseStudentDocument(file);
      setParsed(result);
      setStatus('preview');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg || (isKo ? '파싱에 실패했습니다.' : 'パース失敗'));
      setStatus('error');
    }
  };

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

        {status === 'loading' && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#888' }}>
            <HourglassEmptyIcon sx={{ fontSize: 32, color: '#888', marginBottom: 1.5 }} />
            <div style={{ fontSize: 13 }}>
              {isKo ? 'Claude AI가 분석 중...' : 'Claude AIが分析中...'}
            </div>
          </div>
        )}

        {status === 'error' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <WarningAmberIcon sx={{ fontSize: 32, color: '#c62828', marginBottom: 1.25 }} />
            <div style={{ fontSize: 12, color: '#c62828', marginBottom: 16 }}>{errorMsg}</div>
            <button onClick={() => setStatus('idle')} style={{ padding: '10px 24px', borderRadius: 10, border: '1px solid #ddd', background: 'white', cursor: 'pointer', fontSize: 13 }}>
              {isKo ? '다시 시도' : 'もう一度'}
            </button>
          </div>
        )}

        {status === 'preview' && (
          <>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 10 }}>
              {isKo ? `${parsed.length}명 인식됨 — 확인 후 등록하세요` : `${parsed.length}名認識 — 確認して登録`}
            </div>
            <div style={{ maxHeight: 260, overflowY: 'auto', border: '1px solid #eee', borderRadius: 10, marginBottom: 14 }}>
              {parsed.map((s, i) => (
                <div key={i} style={{
                  display: 'grid', gridTemplateColumns: '1fr 44px 28px',
                  padding: '8px 12px', borderBottom: i < parsed.length - 1 ? '1px solid #f5f5f5' : 'none',
                  alignItems: 'center',
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 'bold' }}>{s.nameJa}</div>
                    <div style={{ fontSize: 10, color: '#aaa' }}>{s.nameEn}</div>
                  </div>
                  <div style={{ fontSize: 11, color: '#1a1a2e', textAlign: 'center' }}>{s.roomNumber ?? '-'}</div>
                  <div style={{ fontSize: 11, textAlign: 'center', color: s.gender === 'M' ? '#1565c0' : '#880e4f' }}>
                    {s.gender === 'M' ? (isKo ? '남' : '男') : (isKo ? '여' : '女')}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setStatus('idle')} style={{ flex: 1, padding: 12, borderRadius: 12, border: '1px solid #ddd', background: 'white', fontSize: 13, cursor: 'pointer' }}>
                {isKo ? '다시 선택' : '選び直す'}
              </button>
              <button onClick={() => onConfirm(parsed)} style={{ flex: 1, padding: 12, borderRadius: 12, border: 'none', background: '#1a1a2e', color: 'white', fontSize: 13, fontWeight: 'bold', cursor: 'pointer' }}>
                {isKo ? `${parsed.length}명 등록` : `${parsed.length}名登録`}
              </button>
            </div>
          </>
        )}
      </ModalBox>
    </Overlay>
  );
};

// ─── 공용 컴포넌트 / 스타일 ───────────────────────────────────────────────────

const Overlay = ({ children, onClose }: { children: React.ReactNode; onClose: () => void }) => (
  <div
    onClick={onClose}
    style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, 
    }}
  >
    <div onClick={e => e.stopPropagation()} style={{ width: 'calc(100% - 40px)', maxWidth: 300, marginRight:40}}>
      {children}
    </div>
  </div>
);

const ModalBox = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{
    background: 'white', borderRadius: 20,
    padding: '24px 20px', width: '100%',
    boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
    ...style,
  }}>
    {children}
  </div>
);

const ModalHeader = ({ title, onClose }: { title: string; onClose: () => void }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
    <div style={{ fontSize: 15, fontWeight: 'bold', color: '#111' }}>{title}</div>
    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', padding: 4 }}>
      <CloseIcon sx={{ fontSize: 20 }} />
    </button>
  </div>
);

const Field = ({ label, children, style }: { label: string; children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{ marginBottom: 12, ...style }}>
    <div style={{ fontSize: 11, color: '#888', marginBottom: 5 }}>{label}</div>
    {children}
  </div>
);

const SortButton = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
  <button onClick={onClick} style={{
    padding: '5px 14px', borderRadius: 20,
    border: active ? 'none' : '1px solid #ddd',
    background: active ? '#1a1a2e' : 'white',
    color: active ? 'white' : '#888',
    fontSize: 12, fontWeight: active ? 'bold' : 'normal', cursor: 'pointer',
  }}>
    {label}
  </button>
);

const ColHead = ({ label, active, center, paddingLeft }: { label: string; active?: boolean; center?: boolean; paddingLeft?: number }) => (
  <div style={{
    fontSize: 10, fontWeight: active ? 'bold' : 'normal',
    color: active ? '#1a1a2e' : '#aaa',
    textAlign: center ? 'center' : 'left',
    paddingLeft: paddingLeft ?? 0,
  }}>
    {label}{active ? ' ▲' : ''}
  </div>
);

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', borderRadius: 10,
  border: '1.5px solid #e0e0e0', fontSize: 13, outline: 'none',
  boxSizing: 'border-box',
};

const warnStyle: React.CSSProperties = {
  fontSize: 11, color: '#e65100', marginTop: 4,
};

const iconBtnStyle = (bg: string, color: string): React.CSSProperties => ({
  width: 30, height: 30, borderRadius: 8, border: 'none',
  background: bg, color, cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
});

const rowBtnStyle = (color: string): React.CSSProperties => ({
  width: 24, height: 24, borderRadius: 6, border: 'none',
  background: `${color}18`, color, cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
});

export default StudentListPage;
