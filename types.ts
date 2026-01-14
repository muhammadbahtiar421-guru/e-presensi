
export enum AttendanceStatus {
  HADIR = 'H',
  IZIN = 'I',
  SAKIT = 'S',
  ALFA = 'A',
  DISPENSASI = 'D'
}

export type UserRole = 'ADMIN' | 'GURU' | 'BK' | 'KEPALA_SEKOLAH';

export interface Teacher {
  id: string;
  name: string;
  nip: string;
  assignedClasses: string[];
  subjects: string[];
}

export interface Student {
  id: string;
  name: string;
  classId: string;
  gender: 'L' | 'P';
  nis?: string;
}

export interface SchoolClass {
  id: string;
  name: string;
  grade: 'X' | 'XI' | 'XII';
}

export interface Subject {
  id: string;
  name: string;
}

export interface StudentAttendance {
  studentId: string;
  status: AttendanceStatus;
}

export interface PresenceRecord {
  id: string;
  timestamp: string;
  teacherId: string;
  classId: string;
  subjectId: string;
  period: string;
  journal: string;
  studentsAttendance: StudentAttendance[]; // Detail kehadiran siswa per sesi
}

export interface ViolationType {
  id: string;
  label: string;
  points: number;
}

export interface DisciplineViolation {
  id: string;
  studentId: string;
  type: string;
  points: number;
  description: string;
  date: string;
  reporter: string;
  classId: string;
}

export interface PrincipalInfo {
  name: string;
  nip: string;
}

export interface AppState {
  teachers: Teacher[];
  students: Student[];
  classes: SchoolClass[];
  subjects: Subject[];
  presences: PresenceRecord[];
  violations: DisciplineViolation[];
  violationTypes: ViolationType[];
  principal: PrincipalInfo; // Data Kepala Sekolah yang bisa diubah
}
