/**
 * student.ts
 *
 * /api/student 엔드포인트 호출 함수 모음
 * - 학생 명단 CRUD
 * - PDF/이미지 파일에서 학생 명단 AI 파싱
 * - 점호(roll-call) 조회 및 업데이트
 */

import apiClient from './apiClient';

// ──────────────────────────────────────────────
// 응답 타입 정의 (백엔드 camelCase 기준)
// ──────────────────────────────────────────────

export interface Student {
  id: number;
  nameJa: string;
  nameKo: string | null;
  nameEn: string | null;
  gender: 'M' | 'F';
  roomNumber: string | null;
  notes: string | null;
}

/** AI 파싱 결과 (id 없음) */
export type ParsedStudent = Omit<Student, 'id'>;

export interface RollCall {
  id: number;
  studentId: number;
  date: string;
  isPresent: boolean;
}

// ──────────────────────────────────────────────
// API 호출 함수
// ──────────────────────────────────────────────

/** GET /student — 학생 전체 목록 조회 */
export const getStudents = () =>
  apiClient.get<Student[]>('/student');

/** POST /student — 학생 등록 */
export const createStudent = (data: Omit<Student, 'id'>) =>
  apiClient.post<Student>('/student', data);

/** PUT /student/:id — 학생 정보 수정 */
export const updateStudent = (id: number, data: Omit<Student, 'id'>) =>
  apiClient.put<Student>(`/student/${id}`, data);

/** DELETE /student/:id — 학생 삭제 */
export const removeStudent = (id: number) =>
  apiClient.delete<void>(`/student/${id}`);

/**
 * POST /student/parse-document — PDF 또는 이미지에서 학생 명단 AI 파싱
 * multipart/form-data 전송, 응답 대기 최대 60초
 */
export const parseStudentDocument = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return apiClient.post<ParsedStudent[]>('/student/parse-document', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000,
  });
};

/** GET /student/roll-call?date=YYYY-MM-DD — 날짜별 점호 목록 조회 */
export const getRollCall = (date: string) =>
  apiClient.get<RollCall[]>('/student/roll-call', { params: { date } });

/** PUT /student/roll-call/:id — 점호 출석 여부 업데이트 */
export const updateRollCall = (id: number, isPresent: boolean) =>
  apiClient.put<RollCall>(`/student/roll-call/${id}`, { isPresent });
