/**
 * dormitory.ts
 *
 * /api/dormitory 엔드포인트 호출 함수 모음
 * - 층별(floor) / 카테고리(category) 섹션 + 항목 조회
 * - 섹션 및 항목 CRUD (관리자 전용)
 */

import apiClient from './apiClient';

// ──────────────────────────────────────────────
// 응답 타입 정의 (백엔드 camelCase 기준)
// ──────────────────────────────────────────────

export interface DormitoryItem {
  id: number;
  sectionId: number;
  textKo: string;
  textJa: string;
  warningKo: string | null;
  warningJa: string | null;
  pin: string | null;
  isDanger: boolean;
  sortOrder: number;
}

export interface DormitorySection {
  id: number;
  type: 'floor' | 'category';
  sectionKey: string;
  titleKo: string;
  titleJa: string;
  subtitleKo: string | null;
  subtitleJa: string | null;
  sortOrder: number;
  items: DormitoryItem[];
}

// ──────────────────────────────────────────────
// API 호출 함수
// ──────────────────────────────────────────────

/** GET /dormitory/floor — 층별 섹션 + 항목 조회 (B1/1F/2F/4F/ALL) */
export const getFloorSections = () =>
  apiClient.get<DormitorySection[]>('/dormitory/floor');

/** GET /dormitory/category — 카테고리별 섹션 + 항목 조회 (쓰레기/규칙 등) */
export const getCategorySections = () =>
  apiClient.get<DormitorySection[]>('/dormitory/category');

/** POST /dormitory/section — 섹션 등록 (관리자) */
export const createSection = (data: Omit<DormitorySection, 'id' | 'items'>) =>
  apiClient.post<DormitorySection>('/dormitory/section', data);

/** PUT /dormitory/section/:id — 섹션 수정 (관리자) */
export const updateSection = (id: number, data: Partial<Omit<DormitorySection, 'id' | 'items'>>) =>
  apiClient.put<DormitorySection>(`/dormitory/section/${id}`, data);

/** DELETE /dormitory/section/:id — 섹션 삭제, 하위 항목 포함 (관리자) */
export const removeSection = (id: number) =>
  apiClient.delete<void>(`/dormitory/section/${id}`);

/** POST /dormitory/item — 항목 등록 (관리자) */
export const createItem = (data: Omit<DormitoryItem, 'id'>) =>
  apiClient.post<DormitoryItem>('/dormitory/item', data);

/** PUT /dormitory/item/:id — 항목 수정 (관리자) */
export const updateItem = (id: number, data: Partial<Omit<DormitoryItem, 'id'>>) =>
  apiClient.put<DormitoryItem>(`/dormitory/item/${id}`, data);

/** DELETE /dormitory/item/:id — 항목 삭제 (관리자) */
export const removeItem = (id: number) =>
  apiClient.delete<void>(`/dormitory/item/${id}`);

/** POST /dormitory/translate — 단일 텍스트 한→일 번역 (폼 필드별 "번역" 버튼 전용) */
export const translateDormitoryText = (text: string) =>
  apiClient.post<{ translated: string }>('/dormitory/translate', { text });
