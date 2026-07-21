import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import type { Student } from '../../../api/student';

const rowBtnStyle = (color: string): React.CSSProperties => ({
  width: 24, height: 24, borderRadius: 6, border: 'none',
  background: `${color}18`, color, cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
});

// 학생 한 명의 행 (테이블의 한 줄)
const StudentRow = ({
  student, displayNo, isKo, isLast, isAdmin, expanded, onToggle, onEdit, onDelete,
}: {
  student: Student; displayNo: number; isKo: boolean; isLast: boolean; isAdmin: boolean;
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
        {/* 1. 순번 (표시 위치 기반, 실제 id 아님) */}
        <div style={{ fontSize: 11, color: '#aaa', textAlign: 'center' }}>{displayNo}</div>

        {/* 2. 한/일 이름 */}
        <div style={{ paddingLeft: 4 }}>
          {/* 한/일 이름 */}
          <div style={{ fontSize: 13, fontWeight: 'bold', color: '#111' }}>
            {isKo ? (student.nameKo ?? student.nameJa) : student.nameJa}
          </div>

          {/* 회색으로 표시되는 추가 정보 */}
          <div style={{ fontSize: 10, color: '#aaa', marginTop: 2 }}>
            {/* 영어 이름 */}
            {student.nameEn}

            {/* 주의 사항이 있는 경우 태그 표시 */}
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

        {/* 3. 방 번호 */}
        <div style={{ fontSize: 11, fontWeight: 'bold', color: '#1a1a2e', textAlign: 'center' }}>
          {student.roomNumber ?? '-'}
        </div>

        {/* 4. 성별 */}
        <div style={{ fontSize: 12, textAlign: 'center', color: isMale ? '#1565c0' : '#880e4f' }}>
          {isKo ? (isMale ? '남' : '여') : (isMale ? '男' : '女')}
        </div>
        
        {/* 5. 편집/삭제 버튼 */}
        {isAdmin && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 4 }} onClick={e => e.stopPropagation()}>
            {/* 편집 버튼 */}
            <button onClick={onEdit} style={rowBtnStyle('#1a1a2e')}>
              <EditIcon sx={{ fontSize: 13 }} />
            </button>
            {/* 삭제 버튼 */}
            <button onClick={onDelete} style={rowBtnStyle('#c62828')}>
              <DeleteIcon sx={{ fontSize: 13 }} />
            </button>
          </div>
        )}
      </div>

      {/* 사용자가 학생을 선택한 경우 추가 정보 출력 */}
      {expanded && (
        <div style={{
          padding: '8px 12px 12px 44px',
          background: '#fafafa',
          borderTop: '1px solid #f0f0f0',
          fontSize: 12, color: '#555',
        }}>
          {/* 1. 한/일 이름 */}
          {student.nameKo && (
            <div style={{ marginBottom: 4 }}>
              <span style={{ color: '#aaa', marginRight: 8 }}>{isKo ? '일본어 이름' : '韓国語名'}</span>
              {isKo ? student.nameJa : student.nameKo}
            </div>
          )}
          {/* 2. 영어 이름 */}
          {student.nameEn && (
            <div style={{ marginBottom: 4 }}>
              <span style={{ color: '#aaa', marginRight: 8 }}>{isKo ? '영어 이름' : '英語名'}</span>
              {student.nameEn}
            </div>
          )}
          {/* 3. 주의 사항 */}
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

export default StudentRow;
