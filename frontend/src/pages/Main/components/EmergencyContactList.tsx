import CallIcon from '@mui/icons-material/Call';
import type { EmergencyContact } from '../../../api/settings';
import SectionLabel from './SectionLabel';

interface EmergencyContactListProps {
  contacts: EmergencyContact[];
  isKo: boolean;
}

// 긴급 연락처 리스트
const EmergencyContactList = ({ contacts, isKo }: EmergencyContactListProps) => (
  <>
    <SectionLabel>{isKo ? '긴급 연락처' : '緊急連絡先'}</SectionLabel>
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
      ))}
    </div>
  </>
);

export default EmergencyContactList;
