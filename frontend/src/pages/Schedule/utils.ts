import type { Schedule } from '../../api/schedule';

export const DAY_KO = ['일', '월', '화', '수', '목', '금', '토'];
export const DAY_JA = ['日', '月', '火', '水', '木', '金', '土'];

export const TODAY = new Date().toISOString().slice(0, 10);

// 점호 여부 판단 (titleJa 기준)
export const isRollCallItem = (s: Schedule) => s.titleJa === '点呼' || s.titleKo === '점호';

export const formatLabel = (dateStr: string, isKo: boolean) => {
  const d = new Date(dateStr);
  const day = isKo ? DAY_KO[d.getDay()] : DAY_JA[d.getDay()];
  return isKo
    ? `${d.getMonth() + 1}월 ${d.getDate()}일 (${day})`
    : `${d.getMonth() + 1}月${d.getDate()}日 (${day})`;
};
