export interface Student {
  id: number;
  name: string;
  studentId: string;
  email: string;
  phone?: string;
}

export interface Schedule {
  id: number;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
}

export interface DormitoryRoom {
  id: number;
  roomNumber: string;
  capacity: number;
  occupants: Student[];
}
