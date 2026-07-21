import DeleteIcon from '@mui/icons-material/Delete';
import type { Student } from '../../../api/student';
import { Overlay, ModalBox, ModalHeader } from './ModalShell';

// 학생 삭제 확인 모달
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

      {/* 취소/삭제 버튼 */}
      <div style={{ display: 'flex', gap: 10 }}>
        {/* 취소 -> index.tsx의 onClose 함수 호출 (모달 닫기) */}
        <button onClick={onClose} style={{ flex: 1, padding: 12, borderRadius: 12, border: '1px solid #ddd', background: 'white', fontSize: 13, cursor: 'pointer' }}>
          {isKo ? '취소' : 'キャンセル'}
        </button>
        {/* 삭제 -> index.tsx의 onConfirm 함수 호출 (학생 삭제 후 모달 닫기) */}
        <button onClick={onConfirm} style={{ flex: 1, padding: 12, borderRadius: 12, border: 'none', background: '#c62828', color: 'white', fontSize: 13, fontWeight: 'bold', cursor: 'pointer' }}>
          {isKo ? '삭제' : '削除'}
        </button>
      </div>
    </ModalBox>
  </Overlay>
);

export default DeleteConfirmModal;
