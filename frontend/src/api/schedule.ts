/**
 * schedule.ts
 *
 * /api/schedule 엔드포인트 호출 함수 모음
 * - 일정 전체 조회 / 날짜별 조회
 * - 일정 CRUD (관리자 전용)
 */

import apiClient from './apiClient';

// ──────────────────────────────────────────────
// 응답 타입 정의 (백엔드 camelCase 기준)
// ──────────────────────────────────────────────

export interface Schedule {
  id: number;
  date: string;           // 'YYYY-MM-DD'
  timeStart: string | null;   // 'HH:MM:SS'
  timeEnd: string | null;
  titleKo: string | null;
  titleJa: string;
  locationKo: string | null;
  locationJa: string | null;
  managerName: string | null;
  notesKo: string | null;
  notesJa: string | null;
}

/** AI 파싱 결과 (id 없음) */
export type ParsedSchedule = Omit<Schedule, 'id'>;

// ──────────────────────────────────────────────
// API 호출 함수
// ──────────────────────────────────────────────

/** GET /schedule — 전체 일정 조회 */
export const getSchedules = () =>
  apiClient.get<Schedule[]>('/schedule');

/** GET /schedule?date=YYYY-MM-DD — 특정 날짜 일정 조회 (메인 페이지 오늘/내일 일정) */
export const getScheduleByDate = (date: string) =>
  apiClient.get<Schedule[]>('/schedule', { params: { date } });

/** POST /schedule — 일정 등록 (관리자) */
export const createSchedule = (data: Omit<Schedule, 'id'>) =>
  apiClient.post<Schedule>('/schedule', data);

/** PUT /schedule/:id — 일정 수정 (관리자) */
export const updateSchedule = (id: number, data: Partial<Omit<Schedule, 'id'>>) =>
  apiClient.put<Schedule>(`/schedule/${id}`, data);

/** DELETE /schedule/:id — 일정 삭제 (관리자) */
export const removeSchedule = (id: number) =>
  apiClient.delete<void>(`/schedule/${id}`);

/** DELETE /schedule — 일정 전체 삭제 (관리자) */
export const removeAllSchedules = () =>
  apiClient.delete<void>('/schedule');

/**
 * POST /schedule/parse-document — PDF 또는 이미지에서 일정 목록 AI 파싱 + 한→일 번역
 * multipart/form-data 전송. 추출 + 번역 2회의 Claude 호출이 순차로 실행되므로
 * student의 단건 파싱(60초)보다 넉넉하게 응답 대기 최대 120초
 */
export const parseScheduleDocument = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return apiClient.post<ParsedSchedule[]>('/schedule/parse-document', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000,
  });
};

/** POST /schedule/bulk — 파싱 결과 확인 후 일괄 등록 (관리자, 트랜잭션) */
export const bulkCreateSchedules = (schedules: ParsedSchedule[]) =>
  apiClient.post<Schedule[]>('/schedule/bulk', { schedules });

/** POST /schedule/translate — 폼 필드별 "번역" 버튼 전용 단일 텍스트 한→일 번역 (관리자) */
export const translateScheduleText = (text: string) =>
  apiClient.post<{ translated: string }>('/schedule/translate', { text });
