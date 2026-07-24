/**
 * apiClient.ts
 *
 * 백엔드 API 호출의 공통 기반 클라이언트입니다.
 * - axios 인스턴스 생성 및 공통 설정 (baseURL, timeout, headers)
 * - 요청 인터셉터: JWT 토큰을 Authorization 헤더에 자동 주입
 * - 응답 인터셉터: 401 Unauthorized 시 토큰 제거 후 로그인 페이지 이동
 * - 모든 메서드는 axios AxiosResponse 대신 res.data 를 직접 반환하여
 *   호출 측에서 구조 분해 없이 바로 데이터를 사용할 수 있게 합니다.
 *
 * 사용 예시 (각 도메인 api 파일에서):
 *   import apiClient from './apiClient';
 *   export const getStudents = () => apiClient.get<Student[]>('/student');
 */

import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig } from 'axios';

// ──────────────────────────────────────────────
// 환경 변수에서 baseURL 결정
//   - Docker 실행: VITE_API_URL=http://localhost:3007/api
//   - 로컬 직접 실행: VITE_API_URL=http://localhost:3000/api
// ──────────────────────────────────────────────
const BASE_URL: string = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

// ──────────────────────────────────────────────
// axios 인스턴스 생성
// ──────────────────────────────────────────────
const axiosInstance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ──────────────────────────────────────────────
// 요청 인터셉터: localStorage의 JWT 토큰을 Bearer 헤더로 주입
// 토큰이 없는 경우(비로그인 학생 접근)에는 헤더를 추가하지 않음
// ──────────────────────────────────────────────
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ──────────────────────────────────────────────
// 응답 인터셉터: 401 Unauthorized → 토큰 제거 후 관리자 로그인 페이지로 이동
// 네트워크 에러 등 다른 에러는 호출 측으로 그대로 전파
// ──────────────────────────────────────────────
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('adminAuth');
      window.location.href = '/admin';
    }
    return Promise.reject(error);
  },
);

// ──────────────────────────────────────────────
// apiClient: HTTP 메서드 래퍼 객체
//
// axios의 AxiosResponse<T> 대신 res.data (= T) 를 직접 반환합니다.
// 덕분에 각 API 파일에서:
//   const data = await apiClient.get<Student[]>('/student')
// 처럼 곧바로 타입이 지정된 데이터를 얻을 수 있습니다.
//
// multipart/form-data 등 특수 요청은 config 파라미터로 headers를 덮어씁니다.
// ──────────────────────────────────────────────
const apiClient = {
  /** GET 요청: 데이터 조회 */
  get: <T>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    axiosInstance.get<T>(url, config).then((res) => res.data),

  /** POST 요청: 새 데이터 생성 */
  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
    axiosInstance.post<T>(url, data, config).then((res) => res.data),

  /** PUT 요청: 기존 데이터 수정 (전체 교체) */
  put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
    axiosInstance.put<T>(url, data, config).then((res) => res.data),

  /** PATCH 요청: 기존 데이터 일부 수정 */
  patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
    axiosInstance.patch<T>(url, data, config).then((res) => res.data),

  /** DELETE 요청: 데이터 삭제 */
  delete: <T>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    axiosInstance.delete<T>(url, config).then((res) => res.data),
};

export default apiClient;

// multipart 업로드 등 axios 인스턴스를 직접 써야 할 때를 위해 named export도 제공
export { axiosInstance };
