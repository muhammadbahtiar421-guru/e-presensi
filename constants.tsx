
import React from 'react';
import { ClassRoom, Subject, Teacher, Student, AttendanceStatus, ViolationItem } from './types';

export const GRADES = ['X', 'XI', 'XII'];

export const INITIAL_CLASSES: ClassRoom[] = [
  { id: '1', name: 'X-MIPA-1', grade: 'X' },
  { id: '2', name: 'X-MIPA-2', grade: 'X' },
  { id: '3', name: 'XI-IPS-1', grade: 'XI' },
  { id: '4', name: 'XII-MIPA-1', grade: 'XII' },
];

export const INITIAL_SUBJECTS: Subject[] = [
  { id: '1', name: 'Matematika' },
  { id: '2', name: 'Bahasa Indonesia' },
  { id: '3', name: 'Bahasa Inggris' },
  { id: '4', name: 'Fisika' },
  { id: '5', name: 'Ekonomi' },
];

export const INITIAL_TEACHERS: Teacher[] = [
  { id: '1', name: 'Budi Santoso, S.Pd', nip: '198501012010011001', username: 'budi', password: '123' },
  { id: '2', name: 'Siti Aminah, M.Pd', nip: '198702022012012002', username: 'siti', password: '123' },
  { id: '3', name: 'Andi Wijaya, S.Si', nip: '199003032015011003', username: 'andi', password: '123' },
];

export const INITIAL_STUDENTS: Student[] = [
  { id: '1', name: 'Ahmad Fauzi', nis: '2024001', classId: '1', gender: 'L' },
  { id: '2', name: 'Bella Safira', nis: '2024002', classId: '1', gender: 'P' },
  { id: '3', name: 'Citra Kirana', nis: '2024003', classId: '1', gender: 'P' },
  { id: '4', name: 'Dedi Kurniawan', nis: '2024004', classId: '1', gender: 'L' },
  { id: '5', name: 'Eka Putri', nis: '2024005', classId: '1', gender: 'P' },
  { id: '6', name: 'Fajar Shiddiq', nis: '2024006', classId: '2', gender: 'L' },
  { id: '7', name: 'Gita Savitri', nis: '2024007', classId: '2', gender: 'P' },
];

export const INITIAL_VIOLATIONS: ViolationItem[] = [
  { id: 'v1', description: 'Terlambat Masuk Sekolah', category: 'Ringan', points: 5 },
  { id: 'v2', description: 'Atribut Seragam Tidak Lengkap', category: 'Ringan', points: 5 },
  { id: 'v3', description: 'Rambut Tidak Rapi (Laki-laki)', category: 'Ringan', points: 10 },
  { id: 'v4', description: 'Keluar Kelas Tanpa Izin', category: 'Ringan', points: 10 },
  { id: 'v5', description: 'Bolos Mata Pelajaran', category: 'Sedang', points: 25 },
  { id: 'v6', description: 'Merokok di Lingkungan Sekolah', category: 'Berat', points: 75 },
  { id: 'v7', description: 'Berkelahi / Tawuran', category: 'Berat', points: 100 },
];

export const DAYS_ID = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export const STATUS_COLORS = {
  [AttendanceStatus.HADIR]: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  [AttendanceStatus.IZIN]: 'bg-amber-100 text-amber-700 border-amber-200',
  [AttendanceStatus.SAKIT]: 'bg-blue-100 text-blue-700 border-blue-200',
  [AttendanceStatus.DISPENSASI]: 'bg-purple-100 text-purple-700 border-purple-200',
  [AttendanceStatus.ALPA]: 'bg-rose-100 text-rose-700 border-rose-200',
};

export const STATUS_ICONS = {
  [AttendanceStatus.HADIR]: <i className="fas fa-check-circle"></i>,
  [AttendanceStatus.IZIN]: <i className="fas fa-envelope-open-text"></i>,
  [AttendanceStatus.SAKIT]: <i className="fas fa-medkit"></i>,
  [AttendanceStatus.DISPENSASI]: <i className="fas fa-id-badge"></i>,
  [AttendanceStatus.ALPA]: <i className="fas fa-times-circle"></i>,
};
