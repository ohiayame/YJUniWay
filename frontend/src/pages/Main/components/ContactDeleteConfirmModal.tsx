import DeleteIcon from '@mui/icons-material/Delete';
import type { EmergencyContact } from '../../../api/settings';
import { Overlay, ModalBox, ModalHeader } from '../../../components/ModalShell';

// 긴급 연락처 삭제 확인 모달
const ContactDeleteConfirmModal = ({
  contact, isKo, onConfirm, onClose,
}: {
  contact: EmergencyContact; isKo: boolean; onConfirm: () => void; onClose: () => void;
}) => (
  <Overlay onClose={onClose}>
    <ModalBox>
      <ModalHeader title={isKo ? '연락처 삭제' : '連絡先削除'} onClose={onClose} />
      <div style={{ textAlign: 'center', padding: '12px 0 20px' }}>
        <DeleteIcon sx={{ fontSize: 36, color: '#c62828', marginBottom: 1.5 }} />

        <div style={{ fontSize: 15, fontWeight: 'bold', color: '#111', marginBottom: 6 }}>
          {isKo ? contact.labelKo : contact.labelJa}
        </div>

        <div style={{ fontSize: 12, color: '#999' }}>
          {isKo ? '이 연락처를 삭제하시겠습니까?' : 'この連絡先を削除しますか？'}
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

export default ContactDeleteConfirmModal;
