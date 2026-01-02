
export enum AttendanceStatus {
  HADIR = 'Hadir',
  IZIN = 'Izin',
  SAKIT = 'Sakit',
  DISPENSASI = 'Dispensasi',
  ALPA = 'Alpa'
}

export interface Student {
  id: string;
  name: string;
  nis: string;
  classId: string;
  gender: 'L' | 'P';
}

export interface Teacher {
  id: string;
  name: string;
  nip: string;
  subjectId?: string;
  classId?: string;
  username?: string;
  password?: string;
}

export interface Headmaster {
  name: string;
  nip: string;
}

export interface Subject {
  id: string;
  name: string;
}

export interface ClassRoom {
  id: string;
  name: string;
  grade: string;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  day: string;
  period: string;
  teacherId: string;
  subjectId: string;
  classId: string;
  grade: string;
  journal: string;
  createdAt: string; 
  students: {
    studentId: string;
    status: AttendanceStatus;
  }[];
}

export interface ViolationItem {
  id: string;
  description: string;
  category: 'Ringan' | 'Sedang' | 'Berat';
  points: number;
}

export interface ViolationRecord {
  id: string;
  date: string;
  studentId: string;
  violationItemId: string;
  notes: string;
  reporter: string;
}

export interface User {
  id: string;
  username: string;
  role: 'admin' | 'teacher';
  teacherId?: string;
}
