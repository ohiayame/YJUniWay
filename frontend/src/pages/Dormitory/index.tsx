import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import LocalLaundryServiceIcon from '@mui/icons-material/LocalLaundryService';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import PageLayout from '../../components/PageLayout';
import { useAppSelector } from '../../store';
import {
  getFloorSections, getCategorySections,
  updateSection,
  createItem, updateItem, removeItem,
} from '../../api/dormitory';
import { getSettings } from '../../api/settings';
import type { DormitorySection, DormitoryItem } from '../../api/dormitory';
import type { AppSettings } from '../../api/settings';
import CurfewBanner from './components/CurfewBanner';
import FloorTimeline from './components/FloorTimeline';
import CategorySectionList from './components/CategorySectionList';
import SectionFormModal from './components/SectionFormModal';
import ItemFormModal from './components/ItemFormModal';
import ItemDeleteConfirmModal from './components/ItemDeleteConfirmModal';

type ItemFormCtx = { section: DormitorySection; item: DormitoryItem | null }; // item null = 추가 모드

// 기숙사 안내 페이지
const DormitoryPage = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const isKo = i18n.language === 'ko';
  const { isAdmin } = useAppSelector((state) => state.auth);

  const [floorSections, setFloorSections] = useState<DormitorySection[]>([]);
  const [categorySections, setCategorySections] = useState<DormitorySection[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);

  // 모달 상태
  const [sectionForm, setSectionForm] = useState<DormitorySection | null>(null); // 편집 대상 층(floor) — 층만 정보 수정 가능, 카테고리/삭제는 불가
  const [itemForm, setItemForm] = useState<ItemFormCtx | null>(null);
  const [itemDeleteTarget, setItemDeleteTarget] = useState<DormitoryItem | null>(null);

  useEffect(() => {
    // 층별 섹션, 카테고리 섹션, 앱 설정을 병렬로 조회
    getFloorSections().then(setFloorSections).catch(() => setFloorSections([]));
    getCategorySections().then(setCategorySections).catch(() => setCategorySections([]));
    getSettings().then(setSettings).catch(() => setSettings(null));
  }, []);

  // ─── 층 섹션 수정 핸들러 ───────────────────────────────────────────────────
  const handleSectionSave = async (form: Omit<DormitorySection, 'id' | 'items' | 'type' | 'sortOrder'>) => {
    if (!sectionForm) return;
    try {
      const updated = await updateSection(sectionForm.id, form);
      setFloorSections(prev => prev.map(s => (s.id === sectionForm.id ? updated : s)));
    } catch {
      // API 오류 시 상태 변경 없이 모달만 닫음
    }
    setSectionForm(null);
  };

  // ─── 항목 CRUD 핸들러 ───────────────────────────────────────────────────────
  const applyToSectionLists = (updater: (list: DormitorySection[]) => DormitorySection[]) => {
    setFloorSections(updater);
    setCategorySections(updater);
  };

  const handleItemSave = async (form: Omit<DormitoryItem, 'id' | 'sectionId' | 'sortOrder'>) => {
    if (!itemForm) return;
    const { section, item } = itemForm;
    try {
      if (item) {
        const updated = await updateItem(item.id, form);
        applyToSectionLists(list => list.map(s => (
          s.id === section.id ? { ...s, items: s.items.map(i => (i.id === item.id ? updated : i)) } : s
        )));
      } else {
        const created = await createItem({ ...form, sectionId: section.id, sortOrder: section.items.length });
        applyToSectionLists(list => list.map(s => (
          s.id === section.id ? { ...s, items: [...s.items, created] } : s
        )));
      }
    } catch {
      // API 오류 시 상태 변경 없이 모달만 닫음
    }
    setItemForm(null);
  };

  const handleItemDelete = async () => {
    if (!itemDeleteTarget) return;
    const target = itemDeleteTarget;
    try {
      await removeItem(target.id);
      applyToSectionLists(list => list.map(s => ({ ...s, items: s.items.filter(i => i.id !== target.id) })));
    } catch {
      // API 오류 시 목록 유지
    }
    setItemDeleteTarget(null);
  };

  return (
    <PageLayout titleKo="기숙사 안내" titleJa="寮のご案内">
      {/* 통금/점호 배너 */}
      <CurfewBanner curfewTime={settings?.curfewTime} isKo={isKo} />
      {/* 층별 타임라인 */}
      <FloorTimeline
        floorSections={floorSections}
        isKo={isKo}
        isAdmin={isAdmin}
        onEditSection={(section) => setSectionForm(section)}
        onAddItem={(section) => setItemForm({ section, item: null })}
        onEditItem={(section, item) => setItemForm({ section, item })}
        onDeleteItem={(item) => setItemDeleteTarget(item)}
      />

      {/* 세탁기 링크 */}
      <button
        onClick={() => navigate('/dormitory/laundry')}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: '#e3f2fd', borderRadius: 10, padding: '18px 12px',
          marginTop: 4, marginBottom: 14, border: 'none', cursor: 'pointer',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#1565c0', fontWeight: 500 }}>
          <LocalLaundryServiceIcon sx={{ fontSize: 18, color: '#1565c0' }} />
          {isKo ? '세탁기 사용법 보기' : '洗濯機の使い方を見る'}
        </span>
        <ArrowForwardIosIcon sx={{ fontSize: 12, color: '#1565c0' }} />
      </button>

      {/* 카테고리 섹션 리스트 */}
      <CategorySectionList
        categorySections={categorySections}
        isKo={isKo}
        isAdmin={isAdmin}
        onAddItem={(section) => setItemForm({ section, item: null })}
        onEditItem={(section, item) => setItemForm({ section, item })}
        onDeleteItem={(item) => setItemDeleteTarget(item)}
      />

      {/* 모달들 */}
      {sectionForm && (
        <SectionFormModal
          initial={sectionForm}
          isKo={isKo}
          onSave={handleSectionSave}
          onClose={() => setSectionForm(null)}
        />
      )}
      {itemForm && (
        <ItemFormModal
          sectionType={itemForm.section.type}
          initial={itemForm.item ?? undefined}
          pinLocked={itemForm.section.items.some(i => i.pin && i.id !== itemForm.item?.id)}
          isKo={isKo}
          onSave={handleItemSave}
          onClose={() => setItemForm(null)}
        />
      )}
      {itemDeleteTarget && (
        <ItemDeleteConfirmModal
          item={itemDeleteTarget}
          isKo={isKo}
          onConfirm={handleItemDelete}
          onClose={() => setItemDeleteTarget(null)}
        />
      )}
    </PageLayout>
  );
};

export default DormitoryPage;
