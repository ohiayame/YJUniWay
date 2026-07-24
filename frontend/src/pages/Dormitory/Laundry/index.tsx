import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import BottomTab from '../../../components/BottomTab';
import { useAppSelector } from '../../../store';
import {
  getLaundrySettings, getLaundrySteps, updateLaundrySettings,
  createLaundryStep, updateLaundryStep, removeLaundryStep,
} from '../../../api/laundry';
import type { LaundrySettings, LaundryStep } from '../../../api/laundry';
import LaundryHeader from './components/LaundryHeader';
import LaundryInfo from './components/LaundryInfo';
import LaundryHowToUse from './components/LaundryHowToUse';
import LaundryWarningNotice from './components/LaundryWarningNotice';
import LaundrySettingsFormModal from './components/LaundrySettingsFormModal';
import LaundryStepFormModal from './components/LaundryStepFormModal';
import LaundryStepDeleteConfirmModal from './components/LaundryStepDeleteConfirmModal';

const LaundryPage = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const isKo = i18n.language === 'ko';
  const { isAdmin } = useAppSelector((state) => state.auth);

  const [settings, setSettings] = useState<LaundrySettings | null>(null);
  const [steps, setSteps] = useState<LaundryStep[]>([]);

  // 모달 상태
  const [showSettingsForm, setShowSettingsForm] = useState(false);
  const [stepEditTarget, setStepEditTarget] = useState<LaundryStep | null>(null); // null = 추가
  const [showStepForm, setShowStepForm] = useState(false);
  const [stepDeleteTarget, setStepDeleteTarget] = useState<LaundryStep | null>(null);

  useEffect(() => {
    // 세탁기 설정과 사용 순서를 병렬로 조회
    getLaundrySettings().then(setSettings).catch(() => setSettings(null));
    getLaundrySteps().then(setSteps).catch(() => setSteps([]));
  }, []);

  // ─── 설정 수정 핸들러 ───────────────────────────────────────────────────────
  const handleSettingsSave = async (form: Partial<Omit<LaundrySettings, 'id' | 'updatedAt'>>) => {
    try {
      const updated = await updateLaundrySettings(form);
      setSettings(updated);
    } catch {
      // API 오류 시 상태 변경 없이 모달만 닫음
    }
    setShowSettingsForm(false);
  };

  // ─── 사용 순서 CRUD 핸들러 ──────────────────────────────────────────────────
  const handleStepSave = async (form: Omit<LaundryStep, 'id' | 'sortOrder'>) => {
    try {
      if (stepEditTarget) {
        const updated = await updateLaundryStep(stepEditTarget.id, form);
        setSteps(prev => prev.map(s => (s.id === stepEditTarget.id ? updated : s)));
      } else {
        const created = await createLaundryStep({ ...form, sortOrder: steps.length });
        setSteps(prev => [...prev, created]);
      }
    } catch {
      // API 오류 시 상태 변경 없이 모달만 닫음
    }
    setShowStepForm(false);
    setStepEditTarget(null);
  };

  const handleStepDelete = async () => {
    if (!stepDeleteTarget) return;
    try {
      await removeLaundryStep(stepDeleteTarget.id);
      setSteps(prev => prev.filter(s => s.id !== stepDeleteTarget.id));
    } catch {
      // API 오류 시 목록 유지
    }
    setStepDeleteTarget(null);
  };

  // 인접한 두 항목의 sortOrder를 맞바꿔 순서를 이동
  const handleStepMove = async (step: LaundryStep, direction: 'up' | 'down') => {
    const index = steps.findIndex(s => s.id === step.id);
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (index === -1 || targetIndex < 0 || targetIndex >= steps.length) return;
    const target = steps[targetIndex];

    try {
      const [updatedStep, updatedTarget] = await Promise.all([
        updateLaundryStep(step.id, { sortOrder: target.sortOrder }),
        updateLaundryStep(target.id, { sortOrder: step.sortOrder }),
      ]);
      setSteps(prev => prev
        .map(s => (s.id === updatedStep.id ? updatedStep : s.id === updatedTarget.id ? updatedTarget : s))
        .sort((a, b) => a.sortOrder - b.sortOrder));
    } catch {
      // API 오류 시 목록 유지
    }
  };

  return (
    <div style={{ paddingBottom: 64, maxWidth: 480, margin: '0 auto', background: 'white', minHeight: '100vh' }}>
      {/* 세탁기 헤더 */}
      <LaundryHeader
        isKo={isKo}
        onBack={() => navigate(-1)}
        onToggleLanguage={() => i18n.changeLanguage(isKo ? 'ja' : 'ko')}
      />

      <main style={{ padding: '16px 16px 20px' }}>
        {/* 관리자 전용 설정 편집 버튼 */}
        {isAdmin && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
            <button
              onClick={() => setShowSettingsForm(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '5px 12px', borderRadius: 20, border: 'none',
                background: '#e3f2fd', color: '#1565c0', fontSize: 12, cursor: 'pointer',
              }}
            >
              <EditIcon sx={{ fontSize: 15 }} />
              {isKo ? '설정 편집' : '設定編集'}
            </button>
          </div>
        )}

        {/* 세탁기 정보, 사용 방법, 주의 사항 */}
        <LaundryInfo settings={settings} isKo={isKo} />
        <LaundryHowToUse
          steps={steps}
          isKo={isKo}
          isAdmin={isAdmin}
          onAddStep={() => { setStepEditTarget(null); setShowStepForm(true); }}
          onEditStep={(step) => { setStepEditTarget(step); setShowStepForm(true); }}
          onDeleteStep={(step) => setStepDeleteTarget(step)}
          onMoveStep={handleStepMove}
        />
        <LaundryWarningNotice settings={settings} isKo={isKo} />
      </main>

      {/* 모달들 */}
      {showSettingsForm && (
        <LaundrySettingsFormModal
          initial={settings}
          isKo={isKo}
          onSave={handleSettingsSave}
          onClose={() => setShowSettingsForm(false)}
        />
      )}
      {showStepForm && (
        <LaundryStepFormModal
          initial={stepEditTarget ?? undefined}
          isKo={isKo}
          onSave={handleStepSave}
          onClose={() => { setShowStepForm(false); setStepEditTarget(null); }}
        />
      )}
      {stepDeleteTarget && (
        <LaundryStepDeleteConfirmModal
          step={stepDeleteTarget}
          isKo={isKo}
          onConfirm={handleStepDelete}
          onClose={() => setStepDeleteTarget(null)}
        />
      )}

      <BottomTab />
    </div>
  );
};

export default LaundryPage;
