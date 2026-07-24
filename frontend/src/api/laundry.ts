/**
 * laundry.ts
 *
 * /api/laundry 엔드포인트 호출 함수 모음
 * - 세탁기 설정 조회/수정 (요금, 결제앱 정보, 주의사항 — 영상/이미지는 아직 정적 파일이라 미포함)
 * - 세탁기 사용 순서 CRUD
 */

import apiClient from './apiClient';

// ──────────────────────────────────────────────
// 응답 타입 정의 (백엔드 camelCase 기준)
// ──────────────────────────────────────────────

export interface LaundrySettings {
  id: number;
  washPrice: string;
  dryPrice: string;
  appName: string;
  appUrl: string;
  warningKo: string | null;
  warningJa: string | null;
  videoUrl: string | null;   // 서버 업로드 경로 (/uploads/...) — 현재 프론트는 정적 파일을 쓰고 있어 미사용
  imageUrl: string | null;
  updatedAt: string;
}

export interface LaundryStep {
  id: number;
  sortOrder: number;
  textKo: string;
  textJa: string;
}

// ──────────────────────────────────────────────
// API 호출 함수
// ──────────────────────────────────────────────

/** GET /laundry/settings — 세탁기 설정 조회 (요금, 앱 정보, 미디어 경로) */
export const getLaundrySettings = () =>
  apiClient.get<LaundrySettings>('/laundry/settings');

/** PUT /laundry/settings — 세탁기 설정 수정 (요금, 앱 정보, 주의사항) (관리자) */
export const updateLaundrySettings = (data: Partial<Omit<LaundrySettings, 'id' | 'updatedAt'>>) =>
  apiClient.put<LaundrySettings>('/laundry/settings', data);

/** GET /laundry/steps — 세탁기 사용 순서 목록 조회 (sort_order 오름차순) */
export const getLaundrySteps = () =>
  apiClient.get<LaundryStep[]>('/laundry/steps');

/** POST /laundry/step — 사용 순서 등록 (관리자) */
export const createLaundryStep = (data: Omit<LaundryStep, 'id'>) =>
  apiClient.post<LaundryStep>('/laundry/step', data);

/** PUT /laundry/step/:id — 사용 순서 수정 (관리자) */
export const updateLaundryStep = (id: number, data: Partial<Omit<LaundryStep, 'id'>>) =>
  apiClient.put<LaundryStep>(`/laundry/step/${id}`, data);

/** DELETE /laundry/step/:id — 사용 순서 삭제 (관리자) */
export const removeLaundryStep = (id: number) =>
  apiClient.delete<void>(`/laundry/step/${id}`);

/** POST /laundry/translate — 단일 텍스트 한→일 번역 (폼 필드별 "번역" 버튼 전용) */
export const translateLaundryText = (text: string) =>
  apiClient.post<{ translated: string }>('/laundry/translate', { text });
