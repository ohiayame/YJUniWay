import type { Student } from '../types';

// 학생 정보 (이름, 성별, 방 번호 등)
export const mockStudents: Student[] = [
  { id: 1, nameJa: '田中 雄太', nameKo: '다나카 유타', nameEn: 'TANAKA Yuta', gender: 'M', roomNumber: '101', notes: null },
  { id: 2, nameJa: '山田 花子', nameKo: '야마다 하나코', nameEn: 'YAMADA Hanako', gender: 'F', roomNumber: '103', notes: '알레르기 있음' },
  { id: 3, nameJa: '佐藤 健', nameKo: '사토 켄', nameEn: 'SATO Ken', gender: 'M', roomNumber: '102', notes: null },
  { id: 4, nameJa: '鈴木 あおい', nameKo: '스즈키 아오이', nameEn: 'SUZUKI Aoi', gender: 'F', roomNumber: '104', notes: null },
  { id: 5, nameJa: '高橋 翔', nameKo: '다카하시 쇼', nameEn: 'TAKAHASHI Sho', gender: 'M', roomNumber: '201', notes: '야간 귀가 주의' },
  { id: 6, nameJa: '伊藤 さくら', nameKo: '이토 사쿠라', nameEn: 'ITO Sakura', gender: 'F', roomNumber: '202', notes: null },
  { id: 7, nameJa: '渡辺 蓮', nameKo: '와타나베 렌', nameEn: 'WATANABE Ren', gender: 'M', roomNumber: '203', notes: null },
];
