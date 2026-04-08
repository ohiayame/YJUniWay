import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PageLayout from '../../components/PageLayout';
import { mockStudents } from '../../mock/studentData';
import type { Student } from '../../types';

type SortKey = 'id' | 'room';

const StudentListPage = () => {
  const { i18n } = useTranslation();
  const isKo = i18n.language === 'ko';
  const [sort, setSort] = useState<SortKey>('id');
  const [expanded, setExpanded] = useState<number | null>(null);

  const sorted = [...mockStudents].sort((a, b) => {
    if (sort === 'room') {
      return (a.room_number ?? '').localeCompare(b.room_number ?? '');
    }
    return a.id - b.id;
  });

  return (
    <PageLayout titleKo="명단" titleJa="名簿">

      {/* 정렬 토글 + 인원 수 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
        <SortButton label={isKo ? 'ID순' : 'ID順'} active={sort === 'id'} onClick={() => setSort('id')} />
        <SortButton label={isKo ? '방 번호순' : '部屋順'} active={sort === 'room'} onClick={() => setSort('room')} />
        <span style={{ marginLeft: 'auto', fontSize: 11, color: '#aaa' }}>
          {isKo ? `총 ${mockStudents.length}명` : `全${mockStudents.length}名`}
        </span>
      </div>

      {/* 테이블 헤더 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '28px 1fr 44px 28px',
        padding: '5px 12px',
        background: '#f5f5f5',
        borderRadius: '8px 8px 0 0',
        border: '1px solid #eee',
        borderBottom: 'none',
      }}>
        <ColHead label={isKo ? 'ID' : 'ID'} active={sort === 'id'} />
        <ColHead label={isKo ? '이름' : '名前'} paddingLeft={4} />
        <ColHead label={isKo ? '방' : '部屋'} center />
        <ColHead label={isKo ? '성별' : '性別'} center />
      </div>

      {/* 학생 리스트 */}
      <div style={{ border: '1px solid #eee', borderRadius: '0 0 8px 8px', overflow: 'hidden' }}>
        {sorted.map((student, idx) => (
          <StudentRow
            key={student.id}
            student={student}
            index={idx + 1}
            isKo={isKo}
            isLast={idx === sorted.length - 1}
            expanded={expanded === student.id}
            onToggle={() => setExpanded(expanded === student.id ? null : student.id)}
          />
        ))}
      </div>

    </PageLayout>
  );
};

/* ─── 서브 컴포넌트 ─── */

const SortButton = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    style={{
      padding: '5px 14px',
      borderRadius: 20,
      border: active ? 'none' : '1px solid #ddd',
      background: active ? '#1a1a2e' : 'white',
      color: active ? 'white' : '#888',
      fontSize: 12,
      fontWeight: active ? 'bold' : 'normal',
      cursor: 'pointer',
    }}
  >
    {label}
  </button>
);

const ColHead = ({ label, active, center, paddingLeft }: { label: string; active?: boolean; center?: boolean; paddingLeft?: number }) => (
  <div style={{
    fontSize: 10,
    fontWeight: active ? 'bold' : 'normal',
    color: active ? '#1a1a2e' : '#aaa',
    textAlign: center ? 'center' : 'left',
    paddingLeft: paddingLeft ?? 0,
  }}>
    {label}{active ? ' ▲' : ''}
  </div>
);

const StudentRow = ({
  student, isKo, isLast, expanded, onToggle,
}: {
  student: Student;
  isKo: boolean;
  isLast: boolean;
  expanded: boolean;
  onToggle: () => void;
}) => {
  const isMale = student.gender === 'M';

  return (
    <div style={{ borderBottom: isLast ? 'none' : '1px solid #f5f5f5' }}>
      {/* 메인 행 */}
      <div
        onClick={onToggle}
        style={{
          display: 'grid',
          gridTemplateColumns: '28px 1fr 44px 28px',
          alignItems: 'center',
          padding: '10px 12px',
          cursor: 'pointer',
          background: expanded ? '#fafafa' : 'white',
        }}
      >
        {/* 순번 */}
        <div style={{ fontSize: 11, color: '#aaa', textAlign: 'center' }}>{student.id}</div>

        {/* 이름 */}
        <div style={{ paddingLeft: 4 }}>
          <div style={{ fontSize: 13, fontWeight: 'bold', color: '#111' }}>
            {isKo ? (student.name_ko ?? student.name_ja) :student.name_ja}
          </div>
          <div style={{ fontSize: 10, color: '#aaa', marginTop: 2 }}>
            {student.name_en}
            {student.notes && (
              <span style={{
                marginLeft: 6,
                fontSize: 10,
                color: '#e65100',
                background: '#fff3e0',
                borderRadius: 8,
                padding: '1px 5px',
              }}>
                {isKo ? '주의' : '注意'}
              </span>
            )}
          </div>
        </div>

        {/* 방 번호 */}
        <div style={{ fontSize: 11, fontWeight: 'bold', color: '#1a1a2e', textAlign: 'center' }}>
          {student.room_number ?? '-'}
        </div>

        {/* 성별 */}
        <div style={{
          fontSize: 12,
          textAlign: 'center',
          color: isMale ? '#1565c0' : '#880e4f',
        }}>
          {isKo ? (isMale ? '남' : '여') : (isMale ? '男' : '女')}
        </div>
      </div>

      {/* 상세 정보 (펼침) */}
      {expanded && (
        <div style={{
          padding: '8px 12px 12px 44px',
          background: '#fafafa',
          borderTop: '1px solid #f0f0f0',
          fontSize: 12,
          color: '#555',
        }}>
          {student.name_ko && (
            <div style={{ marginBottom: 4 }}>
              <span style={{ color: '#aaa', marginRight: 8 }}>{isKo ? '일본어 이름' : '韓国語名'}</span>
              {isKo ? student.name_ja : student.name_ko}
            </div>
          )}
          {student.name_en && (
            <div style={{ marginBottom: 4 }}>
              <span style={{ color: '#aaa', marginRight: 8 }}>{isKo ? '영어 이름' : '英語名'}</span>
              {student.name_en}
            </div>
          )}
          {student.notes ? (
            <div style={{
              marginTop: 6,
              background: '#fff3e0',
              borderRadius: 8,
              padding: '6px 10px',
              color: '#e65100',
              fontSize: 12,
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

export default StudentListPage;
