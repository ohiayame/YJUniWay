import BlockIcon from '@mui/icons-material/Block';
import KeyIcon from '@mui/icons-material/Key';
import RecyclingIcon from '@mui/icons-material/Recycling';
import LockIcon from '@mui/icons-material/Lock';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import type { DormitorySection } from '../../../api/dormitory';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  '쓰레기 버리기': <DeleteOutlineIcon sx={{ fontSize: 16, color: '#000000' }} />,
  '규칙':        <BlockIcon sx={{ fontSize: 16, color: '#c0392b' }} />,
};

interface CategorySectionListProps {
  categorySections: DormitorySection[];
  isKo: boolean;
}

// 기타 카테고리 섹션 목록
const CategorySectionList = ({ categorySections, isKo }: CategorySectionListProps) => (
  <>
    <hr style={{ border: 'none', borderTop: '1px solid #f0f0f0', margin: '0 0 14px' }} />

    <div style={{ fontSize: 11, fontWeight: 'bold', color: '#bbb', letterSpacing: 1, marginBottom: 10 }}>
      {isKo ? '기타' : 'その他'}
    </div>

    {categorySections.map((cat) => (
      <div key={cat.id} style={{ border: '1px solid #eee', borderRadius: 14, overflow: 'hidden', marginBottom: 10 }}>
        {/* 카테고리 제목 */}
        <div style={{
          padding: '11px 14px', background: 'white',
          display: 'flex', alignItems: 'center', gap: 8,
          fontWeight: 'bold', fontSize: 14, color: '#111',
        }}>
          {CATEGORY_ICONS[cat.titleKo]}
          {isKo ? cat.titleKo : cat.titleJa}
        </div>

        {/* 카테고리 아이템 */}
        <div style={{ background: '#fafafa', padding: '0 14px 12px' }}>
          {cat.items.map((item, ii) => (
            <div key={item.id} style={{
              fontSize: 13, lineHeight: 1.5,
              padding: '6px 0', borderTop: '1px solid #eee',
              display: 'flex', gap: 8, alignItems: 'flex-start',
              color: item.isDanger ? '#c0392b' : '#555',
              fontWeight: item.isDanger ? 500 : 'normal',
            }}>
              {item.isDanger
                ? <BlockIcon sx={{ fontSize: 14, color: '#c0392b', mt: '3px', flexShrink: 0 }} />
                : item.pin
                  ? <LockIcon sx={{ fontSize: 14, color: '#856404', mt: '4px', flexShrink: 0 }} />
                  : ii === 0
                    ? <LocationOnIcon sx={{ fontSize: 14, color: '#888', mt: '3px', flexShrink: 0 }} />
                    : <RecyclingIcon sx={{ fontSize: 14, color: '#888', mt: '3px', flexShrink: 0 }} />
              }
              <div>
                {isKo ? item.textKo : item.textJa}

                {/* 음식물쓰레기 통 비밀번호 */}
                {item.pin && (
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    background: '#fff3cd', borderRadius: 8,
                    padding: '2px 5px', fontSize: 12, color: '#856404',
                    marginLeft: 3,
                  }}>
                    <KeyIcon sx={{ fontSize: 12 }} />
                    <b style={{ fontSize: 12, letterSpacing: 3, color: '#d35400' }}>{item.pin}</b>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    ))}
  </>
);

export default CategorySectionList;
