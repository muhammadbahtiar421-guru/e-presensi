
import React, { useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { AttendanceRecord, Student, ClassRoom, Subject, Teacher, AttendanceStatus } from '../types';
import { STATUS_COLORS } from '../constants';

interface ReportsPageProps {
  records: AttendanceRecord[];
  students: Student[];
  classes: ClassRoom[];
  subjects: Subject[];
  teachers: Teacher[];
  onLogout: () => void;
}

const ReportsPage: React.FC<ReportsPageProps> = ({ records, students, classes, subjects, teachers, onLogout }) => {
  const [filterClass, setFilterClass] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterMonth, setFilterMonth] = useState('');

  const filteredRecords = records.filter(rec => {
    let match = true;
    if (filterClass && rec.classId !== filterClass) match = false;
    if (filterDate && rec.date !== filterDate) match = false;
    if (filterMonth && !rec.date.startsWith(filterMonth)) match = false;
    return match;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <AdminLayout onLogout={onLogout}>
      <div className="no-print bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-semibold text-slate-700 mb-1">Filter Kelas</label>
          <select 
            className="w-full border border-slate-300 rounded-lg p-2 text-sm"
            value={filterClass}
            onChange={e => setFilterClass(e.target.value)}
          >
            <option value="">Semua Kelas</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-semibold text-slate-700 mb-1">Filter Hari</label>
          <input 
            type="date" 
            className="w-full border border-slate-300 rounded-lg p-2 text-sm"
            value={filterDate}
            onChange={e => {setFilterDate(e.target.value); setFilterMonth('');}}
          />
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-semibold text-slate-700 mb-1">Filter Bulan</label>
          <input 
            type="month" 
            className="w-full border border-slate-300 rounded-lg p-2 text-sm"
            value={filterMonth}
            onChange={e => {setFilterMonth(e.target.value); setFilterDate('');}}
          />
        </div>
        <button 
          onClick={handlePrint}
          className="bg-slate-800 text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-slate-900 transition flex items-center gap-2"
        >
          <i className="fas fa-print"></i> Cetak Laporan
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Print Header */}
        <div className="hidden print-only p-8 border-b-2 border-slate-900 text-center">
          <h1 className="text-2xl font-bold">LAPORAN KEHADIRAN SISWA</h1>
          <h2 className="text-xl font-bold uppercase">SMAN 1 KWANYAR</h2>
          <p className="mt-2 text-sm">
            Filter: {filterClass ? classes.find(c => c.id === filterClass)?.name : 'Semua Kelas'} | {filterDate || filterMonth || 'Semua Waktu'}
          </p>
        </div>

        <div className="overflow-x-auto">
          {filteredRecords.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase">Tgl / Jam</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase">Jenjang / Kelas / Mapel</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase">Guru & Jurnal</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase">Statistik</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map(rec => {
                  const hadir = rec.students.filter(s => s.status === AttendanceStatus.HADIR).length;
                  const izin = rec.students.filter(s => s.status === AttendanceStatus.IZIN).length;
                  const sakit = rec.students.filter(s => s.status === AttendanceStatus.SAKIT).length;
                  const disp = rec.students.filter(s => s.status === AttendanceStatus.DISPENSASI).length;
                  const alpa = rec.students.filter(s => s.status === AttendanceStatus.ALPA).length;

                  return (
                    <tr key={rec.id} className="hover:bg-slate-50 align-top">
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-800 text-sm">{rec.date}</p>
                        <p className="text-[10px] text-slate-500">{rec.day}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-bold">Jam {rec.period}</span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-800 text-sm">{classes.find(c => c.id === rec.classId)?.name}</p>
                        <p className="text-xs text-slate-500">{subjects.find(s => s.id === rec.subjectId)?.name}</p>
                        <p className="text-[10px] font-medium text-slate-400 uppercase mt-1">Jenjang: {rec.grade}</p>
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                        <p className="text-sm font-bold text-slate-700">{teachers.find(t => t.id === rec.teacherId)?.name}</p>
                        <div className="mt-2 bg-slate-50 p-3 rounded-lg border border-slate-100 italic text-xs text-slate-600 leading-relaxed">
                          "{rec.journal || 'Tidak ada catatan jurnal.'}"
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex justify-between items-center text-[10px] border-b border-slate-50 pb-1">
                            <span className="text-emerald-600 font-bold">HADIR</span>
                            <span className="font-bold">{hadir}</span>
                          </div>
                          <div className="flex justify-between items-center text-[10px] border-b border-slate-50 pb-1">
                            <span className="text-amber-600 font-bold">IZIN</span>
                            <span className="font-bold">{izin}</span>
                          </div>
                          <div className="flex justify-between items-center text-[10px] border-b border-slate-50 pb-1">
                            <span className="text-blue-600 font-bold">SAKIT</span>
                            <span className="font-bold">{sakit}</span>
                          </div>
                          <div className="flex justify-between items-center text-[10px] border-b border-slate-50 pb-1">
                            <span className="text-purple-600 font-bold">DISP</span>
                            <span className="font-bold">{disp}</span>
                          </div>
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="text-rose-600 font-bold">ALPA</span>
                            <span className="font-bold">{alpa}</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="p-20 text-center text-slate-400">
              <i className="fas fa-folder-open text-5xl mb-4 opacity-20"></i>
              <p className="font-medium">Tidak ada data yang sesuai dengan filter.</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default ReportsPage;
