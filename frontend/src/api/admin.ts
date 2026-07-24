/**
 * admin.ts
 *
 * /api/admin 엔드포인트 호출 함수 모음
 * - 관리자 로그인 (JWT 발급)
 * - 관리자 목록 CRUD
 */

import apiClient from './apiClient';

// ──────────────────────────────────────────────
// 응답 타입 정의 (백엔드 camelCase 기준)
// ──────────────────────────────────────────────

export interface Admin {
  id: number;
  name: string;
  studentId: string | null;   // 스태프 학번 (관리자는 null)
  phone: string;
  role: 'professor' | 'staff';
  isApproved: boolean;
  createdAt: string;
}

export interface LoginRequest {
  studentId: string;  // 관리자는 이름, 스태프는 학번
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  role: 'professor' | 'staff';
  name: string;
  id: number;
}

// ──────────────────────────────────────────────
// API 호출 함수
// ──────────────────────────────────────────────

/** POST /admin/login — 관리자 로그인, JWT accessToken 반환 */
export const login = (data: LoginRequest) =>
  apiClient.post<LoginResponse>('/admin/login', data);

/** GET /admin — 관리자 목록 조회 (password 제외) */
export const getAdmins = () =>
  apiClient.get<Admin[]>('/admin');

/** POST /admin — 관리자 등록 */
export const createAdmin = (data: Omit<Admin, 'id' | 'createdAt'> & { password: string }) =>
  apiClient.post<Admin>('/admin', data);

/** PUT /admin/:id — 관리자 정보 수정 */
export const updateAdmin = (id: number, data: Partial<Omit<Admin, 'id' | 'createdAt'> & { password: string }>) =>
  apiClient.put<Admin>(`/admin/${id}`, data);

/** DELETE /admin/:id — 관리자 삭제 */
export const removeAdmin = (id: number) =>
  apiClient.delete<void>(`/admin/${id}`);
