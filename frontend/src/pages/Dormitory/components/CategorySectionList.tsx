import BlockIcon from '@mui/icons-material/Block';
import KeyIcon from '@mui/icons-material/Key';
import LockIcon from '@mui/icons-material/Lock';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import type { DormitorySection, DormitoryItem } from '../../../api/dormitory';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  '쓰레기 버리기': <DeleteOutlineIcon sx={{ fontSize: 16, color: '#000000' }} />,
  '규칙':        <BlockIcon sx={{ fontSize: 16, color: '#c0392b' }} />,
};

interface CategorySectionListProps {
  categorySections: DormitorySection[];
  isKo: boolean;
  isAdmin?: boolean;
  onAddItem?: (section: DormitorySection) => void;
  onEditItem?: (section: DormitorySection, item: DormitoryItem) => void;
  onDeleteItem?: (item: DormitoryItem) => void;
}

// 기타 카테고리 섹션 목록
// 카테고리(쓰레기 버리기/규칙) 자체도 고정 구조라 관리자가 추가·수정·삭제할 수 없음(쓰레기통이 없어지는 일은 없으므로) — 항목 추가/수정/삭제만 지원
const CategorySectionList = ({
  categorySections, isKo, isAdmin,
  onAddItem, onEditItem, onDeleteItem,
}: CategorySectionListProps) => (
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
                  // "쓰레기 버리기" 섹션의 첫 항목은 버리는 장소 안내로 고정 — 이 한 곳만 위치 아이콘, 나머지는 경고 아이콘
                  : (cat.sectionKey === 'trash' && ii === 0)
                    ? <LocationOnIcon sx={{ fontSize: 14, color: '#888', mt: '3px', flexShrink: 0 }} />
                    : <WarningAmberIcon sx={{ fontSize: 14, color: '#888', mt: '3px', flexShrink: 0 }} />
              }
              <div style={{ flex: 1 }}>
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

              {/* 관리자 전용 항목 수정/삭제 버튼 */}
              {isAdmin && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
                  <button onClick={() => onEditItem?.(cat, item)} style={{ background: 'none', border: 'none', color: '#888', padding: 2, cursor: 'pointer', display: 'flex' }}>
                    <EditIcon sx={{ fontSize: 14 }} />
                  </button>
                  <button onClick={() => onDeleteItem?.(item)} style={{ background: 'none', border: 'none', color: '#c62828', padding: 2, cursor: 'pointer', display: 'flex' }}>
                    <DeleteIcon sx={{ fontSize: 14 }} />
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* 관리자 전용 항목 추가 버튼 */}
          {isAdmin && (
            <button
              onClick={() => onAddItem?.(cat)}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                marginTop: 8, padding: '4px 10px', borderRadius: 20, border: 'none',
                background: '#e3f2fd', color: '#1565c0', fontSize: 11, cursor: 'pointer',
              }}
            >
              <AddIcon sx={{ fontSize: 13 }} />
              {isKo ? '항목 추가' : '項目追加'}
            </button>
          )}
        </div>
      </div>
    ))}
  </>
);

export default CategorySectionList;
