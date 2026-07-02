import type { Admin } from '../types';

// 교수 및 알바생 정보
export const mockAdmins: Admin[] = [
  { id: 1, name: '김철수', student_id: null,       phone: '010-1234-5678', role: 'professor', is_approved: true,  password: 'prof1234' },
  { id: 2, name: '이영희', student_id: '20240001', phone: '010-2222-3333', role: 'staff',     is_approved: true,  password: 'staff1234' },
  { id: 3, name: '박민준', student_id: '20240002', phone: '010-4444-5555', role: 'staff',     is_approved: false, password: 'staff0000' },
];
