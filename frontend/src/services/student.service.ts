import api from '../utils/api';
import type { Student } from '../types';

export const studentService = {
  getAll: () =>
    api.get<Student[]>('/student'),

  create: (form: Omit<Student, 'id'>) =>
    api.post<Student>('/student', form),

  update: (id: number, form: Omit<Student, 'id'>) =>
    api.put<Student>(`/student/${id}`, form),

  remove: (id: number) =>
    api.delete(`/student/${id}`),

  parseDocument: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<Omit<Student, 'id'>[]>('/student/parse-document', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
    });
  },
};
