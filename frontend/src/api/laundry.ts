/**
 * laundry.ts
 *
 * /api/laundry 엔드포인트 호출 함수 모음
 * - 세탁기 설정 조회 (요금, 결제앱 정보, 이미지/영상 경로)
 * - 세탁기 사용 순서 목록 조회
 * (현재 조회 전용 — 관리자 편집 UI는 미구현)
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
  videoUrl: string | null;   // 서버 업로드 경로 (/uploads/...)
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

/** GET /laundry/steps — 세탁기 사용 순서 목록 조회 (sort_order 오름차순) */
export const getLaundrySteps = () =>
  apiClient.get<LaundryStep[]>('/laundry/steps');
