import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import type { LaundrySettings } from '../../../../api/laundry';

interface LaundryWarningNoticeProps {
  settings: LaundrySettings | null;
  isKo: boolean;
}

// 주의사항
const LaundryWarningNotice = ({ settings, isKo }: LaundryWarningNoticeProps) => {
  const warning = isKo ? settings?.warningKo : settings?.warningJa;
  if (!settings || !warning) return null;

  return (
    <div style={{
      background: '#fffbe6', borderLeft: '3px solid #f39c12',
      borderRadius: '0 10px 10px 0', padding: '10px 12px',
      fontSize: 12, color: '#555', lineHeight: 1.6,
    }}>
      <WarningAmberIcon sx={{ fontSize: 13, color: '#f39c12', verticalAlign: 'middle', mr: 0.5 }} />
      {warning}
    </div>
  );
};

export default LaundryWarningNotice;
