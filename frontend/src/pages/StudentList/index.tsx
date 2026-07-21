import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toHiragana } from 'wanakana';
import { useAppSelector } from '../../store';
import AddIcon from '@mui/icons-material/Add';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import PageLayout from '../../components/PageLayout';
import { getStudents, createStudent, updateStudent, removeStudent } from '../../api/student';
import type { Student, ParsedStudent } from '../../api/student';
import StudentRow from './components/StudentRow';
import StudentFormModal from './components/StudentFormModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import ImportModal from './components/ImportModal';

type SortKey = 'name' | 'room';

// 이름 정렬 키 생성: 영어 이름(성+이름, 로마자)을 히라가나로 변환해 발음 순 정렬에 사용
// nameEn이 없는 경우에만 nameJa로 대체 (한자 코드값 순이라 발음 순서와 다를 수 있음)
const nameSortKey = (s: Student): string =>
  s.nameEn ? toHiragana(s.nameEn) : s.nameJa;

// ─── 메인 페이지 ────────────────────────────────────────────────────────────────

const StudentListPage = () => {
  const { i18n } = useTranslation();
  const isKo = i18n.language === 'ko';
  const { isAdmin } = useAppSelector((state) => state.auth);

  const [students, setStudents] = useState<Student[]>([]);
  const [sort, setSort] = useState<SortKey>('name');
  const [expanded, setExpanded] = useState<number | null>(null);

  // 모달 상태
  const [editTarget, setEditTarget] = useState<Student | null>(null); // null = 추가, Student = 수정
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);
  const [showImport, setShowImport] = useState(false);

  useEffect(() => {
    getStudents().then(setStudents).catch(() => setStudents([]));
  }, []);

  // 정렬된 학생 목록 room/이름(발음) 순으로 정렬
  const sorted = [...students].sort((a, b) =>
    sort === 'room'
      ? (a.roomNumber ?? '').localeCompare(b.roomNumber ?? '')
      : nameSortKey(a).localeCompare(nameSortKey(b)),
  );

  // ─── CRUD 핸들러 ───────────────────────────────────────────────────────────
  // 학생 추가/수정/삭제 후 상태를 업데이트하고 모달을 닫음
  const handleSave = async (form: Omit<Student, 'id'>) => {
    try {
      // 수정의 경우
      if (editTarget) {
        // API 호출 후 상태 업데이트
        const updated = await updateStudent(editTarget.id, form);
        setStudents(prev => prev.map(s => s.id === editTarget.id ? updated : s));
      } else {
        // 추가의 경우 저장 후 상태 업데이트
        const created = await createStudent(form);
        setStudents(prev => [...prev, created]);
      }
    } catch {
      // API 오류 시 상태 변경 없이 모달만 닫음
    }
    // 모달 닫기, 편집 대상 초기화
    setShowForm(false);
    setEditTarget(null);
  };

  // 삭제 처리: API 호출 후 상태 업데이트, 모달 닫기
  const handleDelete = async (student: Student) => {
    try {
      await removeStudent(student.id);
      setStudents(prev => prev.filter(s => s.id !== student.id));
    } catch {
      // API 오류 시 목록 유지
    }
    // 삭제 대상 초기화
    setDeleteTarget(null);
  };

  // 엑셀 가져오기 처리: 각 항목을 API로 등록 후 상태 업데이트
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
        <SortButton label={isKo ? '이름순' : '名前順'} active={sort === 'name'} onClick={() => setSort('name')} />
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
        <ColHead label={isKo ? '순번' : 'No.'} />
        <ColHead label={isKo ? '이름' : '名前'} active={sort === 'name'} paddingLeft={4} />
        <ColHead label={isKo ? '방' : '部屋'} active={sort === 'room'} center />
        <ColHead label={isKo ? '성별' : '性別'} center />
        {isAdmin && <ColHead label="" center />}
      </div>

      {/* 학생 리스트 */}
      <div style={{ border: '1px solid #eee', borderRadius: '0 0 8px 8px', overflow: 'hidden' }}>
        {sorted.map((student, idx) => (
          <StudentRow
            key={student.id}
            student={student}
            displayNo={idx + 1}
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
      {/* 1. 학생 추가/편집 폼 모달 */}
      {showForm && (
        <StudentFormModal
          initial={editTarget ?? undefined}
          isKo={isKo}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditTarget(null); }}
        />
      )}
      {/* 2. 학생 삭제 확인 모달 */}
      {deleteTarget && (
        <DeleteConfirmModal
          student={deleteTarget}
          isKo={isKo}
          onConfirm={() => handleDelete(deleteTarget)}
          onClose={() => setDeleteTarget(null)}
        />
      )}
      {/* 3. 파일에서 학생 가져오기 모달 */}
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

// ─── 상단 컨트롤 / 테이블 헤더 (이 페이지에서만 사용) ────────────────────────────
// 정렬 버튼 (id/room)
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

// 테이블 헤더 컬럼 ( active 존재 시 ▲ 표시 )
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

// 명단 업로드/입력 아이콘 버튼 스타일 (배경색, 글자색)
const iconBtnStyle = (bg: string, color: string): React.CSSProperties => ({
  width: 30, height: 30, borderRadius: 8, border: 'none',
  background: bg, color, cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
});

export default StudentListPage;
