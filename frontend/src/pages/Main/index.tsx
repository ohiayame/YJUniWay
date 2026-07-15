import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PageLayout from '../../components/PageLayout';
import { getScheduleByDate } from '../../api/schedule';
import { getSettings, getContacts } from '../../api/settings';
import type { Schedule } from '../../api/schedule';
import type { AppSettings, EmergencyContact } from '../../api/settings';
import TodayScheduleCard from './components/TodayScheduleCard';
import TomorrowGatheringCard from './components/TomorrowGatheringCard';
import EmergencyContactList from './components/EmergencyContactList';
import { NoticeBanner, CurfewStatusCards, WifiCard, CampusMapCard, SchoolAddressCard } from './components/InfoCards';

// 오늘/내일 날짜를 'YYYY-MM-DD' 형식으로 반환
const getDateString = (offsetDays: number): string => {
  const d = new Date('2026-04-09'); // 기준 날짜를 2026-04-07로 설정
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
};

const MainPage = () => {
  const { i18n } = useTranslation();
  const isKo = i18n.language === 'ko';

  const [todaySchedules, setTodaySchedules] = useState<Schedule[]>([]);
  const [tomorrowSchedules, setTomorrowSchedules] = useState<Schedule[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);

  useEffect(() => {
    const today = getDateString(0);
    const tomorrow = getDateString(1);

    // 오늘/내일 일정, 앱 설정, 긴급 연락처를 병렬로 조회
    getScheduleByDate(today).then(setTodaySchedules).catch(() => setTodaySchedules([]));
    getScheduleByDate(tomorrow).then(setTomorrowSchedules).catch(() => setTomorrowSchedules([]));
    getSettings().then(setSettings).catch(() => setSettings(null));
    getContacts().then(setContacts).catch(() => setContacts([]));
  }, []);

  // 내일 첫 번째 일정을 집합 정보로 사용
  const tomorrowGathering = tomorrowSchedules[0] ?? null;

  return (
    <PageLayout titleKo="YJUniWay" titleJa="YJUniWay">
      {/* 오늘 일정 */}
      <TodayScheduleCard todaySchedules={todaySchedules} isKo={isKo} />
      {/* 내일 집합 공지 */}
      <TomorrowGatheringCard tomorrowGathering={tomorrowGathering} isKo={isKo} />
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
      <EmergencyContactList contacts={contacts} isKo={isKo} />
    </PageLayout>
  );
};

export default MainPage;
