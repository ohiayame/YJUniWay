import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import EditIcon from '@mui/icons-material/Edit';
import PageLayout from '../../components/PageLayout';
import { useAppSelector } from '../../store';
import { getScheduleByDate } from '../../api/schedule';
import {
  getSettings, getContacts, updateSettings,
  createContact, updateContact, removeContact,
} from '../../api/settings';
import type { Schedule } from '../../api/schedule';
import type { AppSettings, EmergencyContact } from '../../api/settings';
import TodayScheduleCard from './components/TodayScheduleCard';
import TomorrowGatheringCard from './components/TomorrowGatheringCard';
import EmergencyContactList from './components/EmergencyContactList';
import { NoticeBanner, CurfewStatusCards, WifiCard, CampusMapCard, SchoolAddressCard } from './components/InfoCards';
import SettingsFormModal from './components/SettingsFormModal';
import ContactFormModal from './components/ContactFormModal';
import ContactDeleteConfirmModal from './components/ContactDeleteConfirmModal';

// 오늘/내일 날짜를 'YYYY-MM-DD' 형식으로 반환
const getDateString = (offsetDays: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
};

const MainPage = () => {
  const { i18n } = useTranslation();
  const isKo = i18n.language === 'ko';
  const { isAdmin } = useAppSelector((state) => state.auth);

  const [todaySchedules, setTodaySchedules] = useState<Schedule[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);

  // 모달 상태
  const [showSettingsForm, setShowSettingsForm] = useState(false);
  const [contactEditTarget, setContactEditTarget] = useState<EmergencyContact | null>(null); // null = 추가, EmergencyContact = 수정
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactDeleteTarget, setContactDeleteTarget] = useState<EmergencyContact | null>(null);

  const today = getDateString(0);

  useEffect(() => {
    // 오늘 일정, 앱 설정, 긴급 연락처를 병렬로 조회
    getScheduleByDate(today).then(setTodaySchedules).catch(() => setTodaySchedules([]));
    getSettings().then(setSettings).catch(() => setSettings(null));
    getContacts().then(setContacts).catch(() => setContacts([]));
  }, [today]);

  // ─── 설정 CRUD 핸들러 ───────────────────────────────────────────────────────
  const handleSettingsSave = async (form: Partial<Omit<AppSettings, 'id' | 'updatedAt'>>) => {
    try {
      const updated = await updateSettings(form);
      setSettings(updated);
    } catch {
      // API 오류 시 상태 변경 없이 모달만 닫음
    }
    setShowSettingsForm(false);
  };

  // ─── 긴급 연락처 CRUD 핸들러 ────────────────────────────────────────────────
  const handleContactSave = async (form: Omit<EmergencyContact, 'id'>) => {
    try {
      if (contactEditTarget) {
        const updated = await updateContact(contactEditTarget.id, form);
        setContacts(prev => prev.map(c => c.id === contactEditTarget.id ? updated : c));
      } else {
        const created = await createContact(form);
        setContacts(prev => [...prev, created]);
      }
    } catch {
      // API 오류 시 상태 변경 없이 모달만 닫음
    }
    setShowContactForm(false);
    setContactEditTarget(null);
  };

  const handleContactDelete = async (contact: EmergencyContact) => {
    try {
      await removeContact(contact.id);
      setContacts(prev => prev.filter(c => c.id !== contact.id));
    } catch {
      // API 오류 시 목록 유지
    }
    setContactDeleteTarget(null);
  };

  return (
    <PageLayout titleKo="YJUniWay" titleJa="YJUniWay">
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

      {/* 오늘 일정 */}
      <TodayScheduleCard todaySchedules={todaySchedules} isKo={isKo} />
      {/* 내일 집합 공지 */}
      <TomorrowGatheringCard settings={settings} isKo={isKo} />
      {/* 공지사항 */}
      <NoticeBanner settings={settings} isKo={isKo} />

      {/* 통금 */}
      <CurfewStatusCards settings={settings} isKo={isKo} />
      {/* WIFI */}
      <WifiCard settings={settings} isKo={isKo} />

      {/* 교내 지도 */}
      <CampusMapCard isKo={isKo} />
      {/* 학교 주소 */}
      <SchoolAddressCard settings={settings} isKo={isKo} />
      {/* 긴급 연락처 */}
      <EmergencyContactList
        contacts={contacts}
        isKo={isKo}
        isAdmin={isAdmin}
        onAdd={() => { setContactEditTarget(null); setShowContactForm(true); }}
        onEdit={(contact) => { setContactEditTarget(contact); setShowContactForm(true); }}
        onDelete={(contact) => setContactDeleteTarget(contact)}
      />

      {/* 모달들 */}
      {showSettingsForm && (
        <SettingsFormModal
          initial={settings}
          isKo={isKo}
          onSave={handleSettingsSave}
          onClose={() => setShowSettingsForm(false)}
        />
      )}
      {showContactForm && (
        <ContactFormModal
          initial={contactEditTarget ?? undefined}
          isKo={isKo}
          onSave={handleContactSave}
          onClose={() => { setShowContactForm(false); setContactEditTarget(null); }}
        />
      )}
      {contactDeleteTarget && (
        <ContactDeleteConfirmModal
          contact={contactDeleteTarget}
          isKo={isKo}
          onConfirm={() => handleContactDelete(contactDeleteTarget)}
          onClose={() => setContactDeleteTarget(null)}
        />
      )}
    </PageLayout>
  );
};

export default MainPage;
