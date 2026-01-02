
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
}

export interface Teacher {
  id: string;
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
  grade: string; // X, XI, XII
}

export interface AttendanceRecord {
  id: string;
  date: string;
  day: string;
  period: string; // Jam Ke
  teacherId: string;
  subjectId: string;
  classId: string;
  grade: string;
  journal: string; // Jurnal Pembelajaran
  students: {
    studentId: string;
    status: AttendanceStatus;
  }[];
}

export interface User {
  id: string;
  username: string;
  role: 'admin' | 'teacher';
}
