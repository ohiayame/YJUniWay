export interface Student {
  id: number;
  name_ja: string;
  name_ko: string | null;
  name_en: string | null;
  gender: 'M' | 'F';
  room_number: string | null;
  notes: string | null;
}

export interface Schedule {
  id: number;
  date: string;          // 'YYYY-MM-DD'
  time_start: string | null;  // 'HH:MM'
  time_end: string | null;
  title_ko: string | null;
  title_ja: string;
  location_ko: string;
  location_ja: string | null;
  manager_name: string | null;
  notes_ko: string | null;
  notes_ja: string | null;
}

export interface DormitorySection {
  id: number;
  type: 'floor' | 'category';
  section_key: string;
  title_ko: string;
  title_ja: string;
  subtitle_ko: string | null;
  subtitle_ja: string | null;
  sort_order: number;
  items: DormitoryItem[];
}

export interface DormitoryItem {
  id: number;
  section_id: number;
  text_ko: string;
  text_ja: string;
  warning_ko: string | null;
  warning_ja: string | null;
  pin: string | null;
  is_danger: boolean;
  sort_order: number;
}

export interface AppSettings {
  curfew_time: string | null;
  wifi_ssid: string | null;
  wifi_password: string | null;
  school_address_ko: string | null;
  school_address_ja: string | null;
  notice_ko: string | null;
  notice_ja: string | null;
}

export interface EmergencyContact {
  id: number;
  label_ko: string;
  label_ja: string;
  phone: string;
}

export interface RollCall {
  id: number;
  student_id: number;
  date: string;
  is_present: boolean;
}

export interface Admin {
  id: number;
  name: string;
  student_id: string | null;
  phone: string;
  role: 'professor' | 'staff';
  is_approved: boolean;
  password: string;
}
