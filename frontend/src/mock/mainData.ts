import type { Schedule, AppSettings, EmergencyContact } from '../types';

// 오늘의 일정 정보 (없을 수도 있음)
export const mockTodaySchedules: Schedule[] = [
  {
    id: 1,
    date: '2025-04-08',
    time_start: '10:00',
    time_end: '12:00',
    title_ko: '오리엔테이션',
    title_ja: 'オリエンテーション',
    location_ko: '본관 101호',
    location_ja: '本館 101号室',
    manager_name: '김교수',
    notes_ko: '강당 예약 확인 필요',
    notes_ja: null,
  },
  {
    id: 2,
    date: '2025-04-08',
    time_start: '13:00',
    time_end: '15:00',
    title_ko: '교내 투어',
    title_ja: 'キャンパスツアー',
    location_ko: '정문 앞 집합',
    location_ja: '正門前集合',
    manager_name: null,
    notes_ko: null,
    notes_ja: null,
  },
  {
    id: 3,
    date: '2025-04-08',
    time_start: '19:00',
    time_end: '20:00',
    title_ko: '저녁 점호',
    title_ja: '夜の点呼',
    location_ko: '기숙사 로비',
    location_ja: '寮ロビー',
    manager_name: '이담당',
    notes_ko: null,
    notes_ja: null,
  },
];

// 내일 모이는 장소 정보 (없을 수도 있음)
export const mockTomorrowGathering: { time: string; location_ko: string; location_ja: string } | null = {
  time: '09:00',
  location_ko: '정문 앞',
  location_ja: '正門前',
};

// 와이파이 및 학교 정보
export const mockSettings: AppSettings = {
  curfew_time: '22:00',
  wifi_ssid: 'YJU_Guest',
  wifi_password: 'yjuguest2025',
  school_address_ko: '대구광역시 북구 영진로 20',
  school_address_ja: '大邱広域市北区ヨンジン路20',
  notice_ko: '4월 10일(목) 한국어 수업은 강의실 변경 — 본관 203호로 이동합니다.',
  notice_ja: '4月10日(木)の韓国語授業は教室変更 — 本館203号室に移動します。',
};

// 긴급 연락처 정보
export const mockEmergencyContacts: EmergencyContact[] = [
  { id: 1, label_ko: '담당 교수', label_ja: '担当教員', phone: '010-1234-5678' },
  { id: 2, label_ko: '기숙사 관리실', label_ja: '寮管理室', phone: '053-940-0000' },
  { id: 3, label_ko: '학교 대표번호', label_ja: '学校代表番号', phone: '053-940-1000' },
];
