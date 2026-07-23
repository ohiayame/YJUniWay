/**
 * settings.ts
 *
 * /api/settings 엔드포인트 호출 함수 모음
 * - 앱 설정 조회 및 수정 (통금시간, WiFi, 학교주소, 공지)
 * - 긴급 연락처 CRUD
 */

import apiClient from './apiClient';

// ──────────────────────────────────────────────
// 응답 타입 정의 (백엔드 camelCase 기준)
// ──────────────────────────────────────────────

export interface AppSettings {
  id: number;
  curfewTime: string | null;       // 'HH:MM:SS'
  wifiSsid: string | null;
  wifiPassword: string | null;
  schoolAddressKo: string | null;
  schoolAddressJa: string | null;
  noticeKo: string | null;
  noticeJa: string | null;
  gatheringTime: string | null;      // 'HH:MM' — 다음 집합 시간
  gatheringLocationKo: string | null;
  gatheringLocationJa: string | null;
  updatedAt: string;
}

export interface EmergencyContact {
  id: number;
  labelKo: string;
  labelJa: string;
  phone: string;
}

// ──────────────────────────────────────────────
// API 호출 함수
// ──────────────────────────────────────────────

/** GET /settings — 앱 설정 단일 행 조회 */
export const getSettings = () =>
  apiClient.get<AppSettings>('/settings');

/** PUT /settings — 앱 설정 수정 (관리자) */
export const updateSettings = (data: Partial<Omit<AppSettings, 'id' | 'updatedAt'>>) =>
  apiClient.put<AppSettings>('/settings', data);

/** GET /settings/contacts — 긴급 연락처 전체 조회 */
export const getContacts = () =>
  apiClient.get<EmergencyContact[]>('/settings/contacts');

/** POST /settings/contacts — 긴급 연락처 등록 (관리자) */
export const createContact = (data: Omit<EmergencyContact, 'id'>) =>
  apiClient.post<EmergencyContact>('/settings/contacts', data);

/** PUT /settings/contacts/:id — 긴급 연락처 수정 (관리자) */
export const updateContact = (id: number, data: Partial<Omit<EmergencyContact, 'id'>>) =>
  apiClient.put<EmergencyContact>(`/settings/contacts/${id}`, data);

/** DELETE /settings/contacts/:id — 긴급 연락처 삭제 (관리자) */
export const removeContact = (id: number) =>
  apiClient.delete<void>(`/settings/contacts/${id}`);
