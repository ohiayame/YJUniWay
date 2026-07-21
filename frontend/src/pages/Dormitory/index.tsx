import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import LocalLaundryServiceIcon from '@mui/icons-material/LocalLaundryService';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import PageLayout from '../../components/PageLayout';
import { getFloorSections, getCategorySections } from '../../api/dormitory';
import { getSettings } from '../../api/settings';
import type { DormitorySection } from '../../api/dormitory';
import type { AppSettings } from '../../api/settings';
import CurfewBanner from './components/CurfewBanner';
import FloorTimeline from './components/FloorTimeline';
import CategorySectionList from './components/CategorySectionList';

// 기숙사 안내 페이지
const DormitoryPage = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const isKo = i18n.language === 'ko';

  const [floorSections, setFloorSections] = useState<DormitorySection[]>([]);
  const [categorySections, setCategorySections] = useState<DormitorySection[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);

  useEffect(() => {
    // 층별 섹션, 카테고리 섹션, 앱 설정을 병렬로 조회
    getFloorSections().then(setFloorSections).catch(() => setFloorSections([]));
    getCategorySections().then(setCategorySections).catch(() => setCategorySections([]));
    getSettings().then(setSettings).catch(() => setSettings(null));
  }, []);

  return (
    <PageLayout titleKo="기숙사 안내" titleJa="寮のご案内">
      {/* 통금/점호 배너 */}
      <CurfewBanner curfewTime={settings?.curfewTime} isKo={isKo} />
      {/* 층별 타임라인 */}
      <FloorTimeline floorSections={floorSections} isKo={isKo} />

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
      <CategorySectionList categorySections={categorySections} isKo={isKo} />

    </PageLayout>
  );
};

export default DormitoryPage;
