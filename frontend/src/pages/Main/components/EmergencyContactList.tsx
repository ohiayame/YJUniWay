import CallIcon from '@mui/icons-material/Call';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import type { EmergencyContact } from '../../../api/settings';
import SectionLabel from './SectionLabel';

interface EmergencyContactListProps {
  contacts: EmergencyContact[];
  isKo: boolean;
  isAdmin?: boolean;
  onAdd?: () => void;
  onEdit?: (contact: EmergencyContact) => void;
  onDelete?: (contact: EmergencyContact) => void;
}

// 긴급 연락처 리스트
const EmergencyContactList = ({ contacts, isKo, isAdmin, onAdd, onEdit, onDelete }: EmergencyContactListProps) => (
  <>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <SectionLabel>{isKo ? '긴급 연락처' : '緊急連絡先'}</SectionLabel>
      {isAdmin && (
        <button
          onClick={onAdd}
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '4px 10px', borderRadius: 20, border: 'none',
            background: '#e8f5e9', color: '#2e7d32', fontSize: 11, cursor: 'pointer',
            marginBottom: 8,
          }}
        >
          <AddIcon sx={{ fontSize: 13 }} />
          {isKo ? '추가' : '追加'}
        </button>
      )}
    </div>
    <div style={{
      background: 'white',
      border: '1px solid #f0f0f0',
      borderRadius: 14,
      padding: '4px 14px',
    }}>
      {contacts.map((contact, i) => (
        // 연락처 항목
        <div key={contact.id} style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '9px 0',
          gap: 8,
          borderBottom: i < contacts.length - 1 ? '1px solid #f5f5f5' : 'none',
        }}>

          {/* 연락처 정보 */}
          <div>
            <div style={{ fontSize: 12, color: '#999' }}>
              {isKo ? contact.labelKo : contact.labelJa}
            </div>
            <div style={{ fontSize: 13, fontWeight: 'bold', color: '#1a1a2e', marginTop: 1 }}>
              {contact.phone}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
            {/* 관리자 전용 수정/삭제 버튼 */}
            {isAdmin && (
              <>
                <button
                  onClick={() => onEdit?.(contact)}
                  style={{ background: 'none', border: 'none', color: '#888', padding: 4, cursor: 'pointer', display: 'flex' }}
                >
                  <EditIcon sx={{ fontSize: 16 }} />
                </button>
                <button
                  onClick={() => onDelete?.(contact)}
                  style={{ background: 'none', border: 'none', color: '#c62828', padding: 4, cursor: 'pointer', display: 'flex' }}
                >
                  <DeleteIcon sx={{ fontSize: 16 }} />
                </button>
              </>
            )}

            {/* 전화 걸기 버튼 */}
            <a
              href={`tel:${contact.phone}`}
              style={{
                background: '#edfaf3',
                color: '#27ae60',
                border: 'none',
                padding: '5px 12px',
                borderRadius: 20,
                fontSize: 12,
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              <CallIcon sx={{ fontSize: 12, verticalAlign: 'middle', mr: 0.5 }} />
              {isKo ? '전화' : '電話'}
            </a>
          </div>

        </div>
      ))}
    </div>
  </>
);

export default EmergencyContactList;
