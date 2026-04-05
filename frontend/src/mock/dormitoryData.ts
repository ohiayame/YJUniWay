export interface FloorItem {
  text_ko: string;
  text_ja: string;
  warning_ko?: string;
  warning_ja?: string;
  pin?: string;
  is_danger?: boolean;
}

export interface FloorSection {
  section_key: 'B1' | '1F' | '2F' | '3F' | '4F' | 'ALL';
  title_ko: string;
  title_ja: string;
  subtitle_ko?: string;
  subtitle_ja?: string;
  items: FloorItem[];
}

export interface CategoryItem {
  text_ko: string;
  text_ja: string;
  pin?: string;
  is_danger?: boolean;
}

export interface CategorySection {
  title_ko: string;
  title_ja: string;
  items: CategoryItem[];
}

export const mockFloorSections: FloorSection[] = [
  {
    section_key: 'B1',
    title_ko: '지하',
    title_ja: '地下',
    items: [
      {
        text_ko: '스터디룸 (오른쪽)',
        text_ja: 'studyroom（右側）',
        warning_ko: '음료만 가능 · 다른 학생이 있을 때는 조용히',
        warning_ja: '飲み物のみ可 · 他の学生がいる場合は静かに',
      },
      {
        text_ko: '요리실 (왼쪽)',
        text_ja: '料理室（左側）',
        warning_ko: '칼을 사용하는 요리 금지',
        warning_ja: '包丁を使うような料理は禁止',
      },
      { text_ko: '화장실 있음', text_ja: 'トイレあり' },
      { text_ko: '에어컨 자유 이용',
        text_ja: 'エアコン利用自由',
        warning_ko: '퇴실 시 반드시 끄기',
        warning_ja: '退室時は必ず消す',
      },
    ],
  },
  {
    section_key: '1F',
    title_ko: '1층',
    title_ja: '1階',
    items: [
      { text_ko: '공동 현관',
        text_ja: '共同玄関',
        warning_ko: '오전 6:00 개방 / 밤 24:00 잠금',
        warning_ja: '朝 6:00 解錠 / 夜 24:00 施錠', },
    ],
  },
  {
    section_key: '2F',
    title_ko: '2층',
    title_ja: '2階',
    subtitle_ko: '세탁기 (남성)',
    subtitle_ja: '洗濯機（男性）',
    items: [],
  },
  {
    section_key: '4F',
    title_ko: '4층',
    title_ja: '4階',
    subtitle_ko: '세탁기 (여성)',
    subtitle_ja: '洗濯機（女性）',
    items: [],
  },
  {
    section_key: 'ALL',
    title_ko: '각 층',
    title_ja: '各階',
    items: [
      { text_ko: '정수기 (1층 제외)', text_ja: 'ウォーターサーバー（1階 ×）' },
    ],
  },
];

export const mockCategorySections: CategorySection[] = [
  {
    title_ko: '쓰레기 버리기',
    title_ja: 'ゴミ捨て',
    items: [
      { text_ko: '건물 밖 오른쪽', text_ja: '建物を出て右側' },
      { text_ko: '음식물 쓰레기 (오렌지 뚜껑)', text_ja: '生ゴミ（オレンジの蓋）', pin: '389' },
      { text_ko: '페트병은 분리수거 / 그 외는 함께', text_ja: 'ペットボトルは分別 / その他はまとめて' },
    ],
  },
  {
    title_ko: '규칙',
    title_ja: '規則',
    items: [
      { text_ko: '술 · 담배 금지', text_ja: 'お酒・タバコ 禁止', is_danger: true },
      { text_ko: '이성 층 출입 금지', text_ja: '異性の階 立ち入り禁止', is_danger: true },
      { text_ko: '기숙사생 외 출입 금지', text_ja: '寮生以外 立ち入り禁止', is_danger: true },
      { text_ko: '키 분실 — 15,000원', text_ja: '鍵紛失 — 15,000ウォン' },
    ],
  },
];
