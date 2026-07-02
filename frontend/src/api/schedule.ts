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
