import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { Overlay, ModalBox, ModalHeader } from '../../../components/ModalShell';

// 일정 전체 삭제 확인 모달
const ScheduleDeleteAllConfirmModal = ({
  count, isKo, onConfirm, onClose,
}: {
  count: number; isKo: boolean; onConfirm: () => void; onClose: () => void;
}) => (
  <Overlay onClose={onClose}>
    <ModalBox>
      <ModalHeader title={isKo ? '일정 전체 삭제' : '予定を全て削除'} onClose={onClose} />
      <div style={{ textAlign: 'center', padding: '12px 0 20px' }}>
        <WarningAmberIcon sx={{ fontSize: 36, color: '#c62828', marginBottom: 1.5 }} />

        <div style={{ fontSize: 15, fontWeight: 'bold', color: '#111', marginBottom: 6 }}>
          {isKo ? `등록된 일정 전체 ${count}건을 삭제하시겠습니까?` : `登録済みの予定全${count}件を削除しますか？`}
        </div>

        <div style={{ fontSize: 12, color: '#999' }}>
          {isKo ? '이 작업은 되돌릴 수 없습니다.' : 'この操作は元に戻せません。'}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onClose} style={{ flex: 1, padding: 12, borderRadius: 12, border: '1px solid #ddd', background: 'white', fontSize: 13, cursor: 'pointer' }}>
          {isKo ? '취소' : 'キャンセル'}
        </button>
        <button onClick={onConfirm} style={{ flex: 1, padding: 12, borderRadius: 12, border: 'none', background: '#c62828', color: 'white', fontSize: 13, fontWeight: 'bold', cursor: 'pointer' }}>
          {isKo ? '전체 삭제' : '全て削除'}
        </button>
      </div>
    </ModalBox>
  </Overlay>
);

export default ScheduleDeleteAllConfirmModal;
