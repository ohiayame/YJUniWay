/**
 * memo.ts
 *
 * /api/memo 엔드포인트 호출 함수 모음
 * - 일정 페이지 관리자 메모(날짜 기준 / 일정 기준, 공유 / 나만보기) 조회 및 CRUD
 */

import apiClient from './apiClient';

// ──────────────────────────────────────────────
// 응답 타입 정의 (백엔드 camelCase 기준)
// ──────────────────────────────────────────────

export type MemoTargetType = 'date' | 'schedule';
export type MemoVisibility = 'private' | 'shared';
export type MemoBlockType = 'text' | 'checkbox';

export interface MemoBlockDto {
  id: number;
  memoId: number;
  type: MemoBlockType;
  content: string;
  isChecked: boolean;
  sortOrder: number;
}

export interface MemoDto {
  id: number;
  targetType: MemoTargetType;
  targetDate: string | null;
  scheduleId: number | null;
  visibility: MemoVisibility;
  authorAdminId: number;
  createdAt: string;
  updatedAt: string;
  blocks: MemoBlockDto[];
}

export interface MemoByTargetResponse {
  shared: MemoDto | null;
  private: MemoDto | null;
}

export interface UpdateMemoBlockResult {
  deleted: boolean;
  memoDeleted: boolean;
  block?: MemoBlockDto;
}

export interface MemoTargetParams {
  targetType: MemoTargetType;
  targetDate: string | null;
  scheduleId: number | null;
}

// ──────────────────────────────────────────────
// API 호출 함수
// ──────────────────────────────────────────────

/** GET /memo — 대상(날짜|일정)의 공유 메모 + 로그인 관리자 본인의 개인 메모 조회 */
export const getMemosByTarget = ({ targetType, targetDate, scheduleId }: MemoTargetParams) =>
  apiClient.get<MemoByTargetResponse>('/memo', {
    params: { targetType, targetDate, scheduleId },
  });

/** POST /memo/blocks — 메모 줄 추가 (대상 문서가 없으면 새로 생성, find-or-create) */
export const addMemoBlock = (data: MemoTargetParams & {
  visibility: MemoVisibility;
  type: MemoBlockType;
  content: string;
  insertAfterBlockId?: number | null;
}) => apiClient.post<MemoDto>('/memo/blocks', data);

/** PATCH /memo/blocks/:id — 메모 줄 내용 수정 (비우면 자동 삭제) */
export const updateMemoBlockContent = (id: number, content: string) =>
  apiClient.patch<UpdateMemoBlockResult>(`/memo/blocks/${id}`, { content });

/** PATCH /memo/blocks/:id/toggle — 체크박스 줄 체크 토글 */
export const toggleMemoBlockChecked = (id: number) =>
  apiClient.patch<MemoBlockDto>(`/memo/blocks/${id}/toggle`);

/** DELETE /memo/:id — 메모 문서 전체 삭제 (작성자 본인 또는 관리자) */
export const removeMemoDoc = (id: number) =>
  apiClient.delete<void>(`/memo/${id}`);
