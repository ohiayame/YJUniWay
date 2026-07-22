/**
 * memoData.ts
 *
 * 관리자 메모(공유/개인) 임시 목데이터.
 * 백엔드 memo/memo-block API가 준비되면 memoSlice의 초기 상태를 서버 응답으로 대체하고
 * 이 파일은 삭제합니다 (mock/ 폴더의 다른 파일들과 동일한 임시 단계).
 */

import type { Memo, MemoBlock } from '../store/slices/memoSlice';

const TODAY = new Date("2026-04-05").toISOString().slice(0, 10);
console.log('TODAY', TODAY); // 2026-04-05

// 날짜 기준 메모만 데모용으로 하나 시드. 일정(스케줄) 기준 메모는 실제 scheduleId를 알 수 없어
// 빈 상태로 두고, 화면에서 직접 입력해 테스트합니다.
export const initialMemos: Memo[] = [
  {
    id: 1,
    targetType: 'date',
    targetDate: TODAY,
    scheduleId: null,
    visibility: 'shared',
    authorName: '김민지',
    createdAt: new Date().toISOString(),
  },
];

export const initialMemoBlocks: MemoBlock[] = [
  {
    id: 1,
    memoId: 1,
    type: 'text',
    content: '우천 시 집합 장소가 바뀔 수 있으니 아침에 다시 확인해주세요',
    isChecked: false,
    sortOrder: 0,
  },
  {
    id: 2,
    memoId: 1,
    type: 'checkbox',
    content: '오늘 명찰 배부 확인',
    isChecked: false,
    sortOrder: 1,
  },
];

export const initialNextMemoId = 2;
export const initialNextBlockId = 3;
