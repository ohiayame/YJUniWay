import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import BottomTab from '../../../components/BottomTab';
import { getLaundrySettings, getLaundrySteps } from '../../../api/laundry';
import type { LaundrySettings, LaundryStep } from '../../../api/laundry';
import LaundryHeader from './components/LaundryHeader';
import LaundryInfo from './components/LaundryInfo';
import LaundryHowToUse from './components/LaundryHowToUse';
import LaundryWarningNotice from './components/LaundryWarningNotice';

const LaundryPage = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const isKo = i18n.language === 'ko';

  const [settings, setSettings] = useState<LaundrySettings | null>(null);
  const [steps, setSteps] = useState<LaundryStep[]>([]);

  useEffect(() => {
    // 세탁기 설정과 사용 순서를 병렬로 조회
    getLaundrySettings().then(setSettings).catch(() => setSettings(null));
    getLaundrySteps().then(setSteps).catch(() => setSteps([]));
  }, []);

  return (
    <div style={{ paddingBottom: 64, maxWidth: 480, margin: '0 auto', background: 'white', minHeight: '100vh' }}>
      {/* 세탁기 헤더 */}
      <LaundryHeader
        isKo={isKo}
        onBack={() => navigate(-1)}
        onToggleLanguage={() => i18n.changeLanguage(isKo ? 'ja' : 'ko')}
      />

      <main style={{ padding: '16px 16px 20px' }}>
        {/* 세탁기 정보, 사용 방법, 주의 사항 */}
        <LaundryInfo settings={settings} isKo={isKo} />
        <LaundryHowToUse steps={steps} isKo={isKo} />
        <LaundryWarningNotice settings={settings} isKo={isKo} />
      </main>

      <BottomTab />
    </div>
  );
};

export default LaundryPage;
