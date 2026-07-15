import LocationOnIcon from '@mui/icons-material/LocationOn';
import InboxIcon from '@mui/icons-material/Inbox';
import type { Schedule } from '../../../api/schedule';
import SectionLabel from './SectionLabel';

interface TomorrowGatheringCardProps {
  tomorrowGathering: Schedule | null;
  isKo: boolean;
}

// 내일 집합 시간 및 장소 카드
const TomorrowGatheringCard = ({ tomorrowGathering, isKo }: TomorrowGatheringCardProps) => (
  <>
    <SectionLabel>{isKo ? '내일 집합' : '明日の集合'}</SectionLabel>
    {tomorrowGathering ? (
      <div style={{
        background: '#FFF5EC',
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}>
        <LocationOnIcon sx={{ fontSize: 28, color: '#f39c12' }} />
        <div>
          {/* 장소 */}
          <div style={{ fontSize: 15, fontWeight: 'bold', color: '#111' }}>
            {isKo ? tomorrowGathering.locationKo : tomorrowGathering.locationJa}
          </div>
          {/* 시간 */}
          <div style={{ fontSize: 14, color: '#383838', marginTop: 2 }}>
            {tomorrowGathering.timeStart} {isKo ? '집합' : '集合'}
          </div>
        </div>
      </div>
    ) : (
      // == 내일 집합 일정이 없을 경우 '미정' 표시 ==
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        background: '#f7f7f7',
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
      }}>
        <InboxIcon sx={{ fontSize: 22, color: '#ccc' }} />
        <div style={{ fontSize: 13, color: '#bbb' }}>
          {isKo ? '미정' : '未定'}
        </div>
      </div>
    )}
  </>
);

export default TomorrowGatheringCard;
