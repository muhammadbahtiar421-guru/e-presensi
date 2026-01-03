
import React, { useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { AttendanceRecord, Student, ClassRoom, Subject, Teacher, AttendanceStatus, Headmaster } from '../types';

interface ReportsPageProps {
  records: AttendanceRecord[];
  students: Student[];
  classes: ClassRoom[];
  subjects: Subject[];
  teachers: Teacher[];
  headmaster: Headmaster;
  onLogout: () => void;
}

const ReportsPage: React.FC<ReportsPageProps> = ({ records = [], students = [], classes = [], subjects = [], teachers = [], headmaster, onLogout }) => {
  const [reportType, setReportType] = useState<'daily' | 'monthly'>('daily');
  const [filterClass, setFilterClass] = useState('');
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7));

  const now = new Date();
  const printDate = now.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const printTime = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const selectedClassName = (classes || []).find(c => c.id === filterClass)?.name || '-';
  const filteredStudents = (students || []).filter(s => !filterClass || s.classId === filterClass);
  const totalLK = filteredStudents.filter(s => s.gender === 'L').length;
  const totalPR = filteredStudents.filter(s => s.gender === 'P').length;
  
  const getDailyAttendanceData = (studentId: string) => {
    const record = (records || []).find(r => 
      r.date === filterDate && 
      r.classId === filterClass
    );
    const studentEntry = (record?.students || []).find(s => s.studentId === studentId);
    return {
      status: studentEntry?.status,
      period: record?.period || '-',
      timestamp: record?.createdAt || '-'
    };
  };

  const getMonthlyStats = (studentId: string) => {
    const monthlyRecords = (records || []).filter(r => 
      r.date && r.date.startsWith(filterMonth) && 
      (filterClass ? r.classId === filterClass : true)
    );
    
    const stats = {
      [AttendanceStatus.HADIR]: 0,
      [AttendanceStatus.IZIN]: 0,
      [AttendanceStatus.SAKIT]: 0,
      [AttendanceStatus.DISPENSASI]: 0,
      [AttendanceStatus.ALPA]: 0,
    };

    monthlyRecords.forEach(r => {
      const studentStatus = (r.students || []).find(s => s.studentId === studentId)?.status;
      if (studentStatus) stats[studentStatus]++;
    });

    return stats;
  };

  const getClassStatusRekap = () => {
    const rekap = { H: 0, I: 0, S: 0, A: 0, D: 0 };
    filteredStudents.forEach(s => {
      if (reportType === 'daily') {
        const d = getDailyAttendanceData(s.id);
        if (d.status === AttendanceStatus.HADIR) rekap.H++;
        if (d.status === AttendanceStatus.IZIN) rekap.I++;
        if (d.status === AttendanceStatus.SAKIT) rekap.S++;
        if (d.status === AttendanceStatus.ALPA) rekap.A++;
        if (d.status === AttendanceStatus.DISPENSASI) rekap.D++;
      } else {
        const ms = getMonthlyStats(s.id);
        rekap.H += ms[AttendanceStatus.HADIR];
        rekap.I += ms[AttendanceStatus.IZIN];
        rekap.S += ms[AttendanceStatus.SAKIT];
        rekap.A += ms[AttendanceStatus.ALPA];
        rekap.D += ms[AttendanceStatus.DISPENSASI];
      }
    });
    return rekap;
  };

  const classStatusRekap = getClassStatusRekap();

  return (
    <AdminLayout onLogout={onLogout}>
      <div className="no-print space-y-6 mb-8">
        <div className="flex flex-wrap gap-2 p-1 bg-slate-200 rounded-2xl w-fit">
          <button onClick={() => setReportType('daily')} className={`px-6 py-2 rounded-xl font-black text-sm transition-all ${reportType === 'daily' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>REKAP HARIAN</button>
          <button onClick={() => setReportType('monthly')} className={`px-6 py-2 rounded-xl font-black text-sm transition-all ${reportType === 'monthly' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>REKAP BULANAN</button>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pilih Kelas</label>
            <select className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none" value={filterClass} onChange={e => setFilterClass(e.target.value)}>
              <option value="">-- Pilih Kelas --</option>
              {(classes || []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{reportType === 'daily' ? 'Pilih Tanggal' : 'Pilih Bulan'}</label>
            <input type={reportType === 'daily' ? "date" : "month"} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none" value={reportType === 'daily' ? filterDate : filterMonth} onChange={e => reportType === 'daily' ? setFilterDate(e.target.value) : setFilterMonth(e.target.value)} />
          </div>
          <button onClick={() => window.print()} disabled={!filterClass} className="bg-blue-800 text-white px-6 py-3 rounded-xl font-black text-sm hover:bg-blue-900 transition flex items-center gap-2 shadow-lg disabled:opacity-50">
            <i className="fas fa-print"></i> CETAK
          </button>
        </div>
      </div>

      <div id="report-content" className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden print:border-none print:shadow-none p-8">
        <div className="flex flex-col items-center border-b-4 border-double border-slate-900 pb-4 mb-2">
          <h2 className="text-sm font-bold">PEMERINTAH PROVINSI JAWA TIMUR</h2>
          <h1 className="text-2xl font-black uppercase tracking-tighter">SMAN 1 KWANYAR</h1>
          <p className="text-[10px]">Jl. Raya Pesanggrahan No.1 Kwanyar, Bangkalan, Madura, 69163</p>
        </div>
        
        <div className="text-center mb-6">
          <h3 className="text-sm font-black uppercase underline">LAPORAN {reportType === 'daily' ? 'PRESENSI HARIAN' : 'REKAPITULASI BULANAN'}</h3>
          <p className="text-xs font-bold">KELAS: {selectedClassName}</p>
        </div>

        {!filterClass ? (
          <div className="p-20 text-center text-slate-300 italic">Pilih kelas untuk pratinjau data.</div>
        ) : (
          <>
            <table className="w-full text-[10px] border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-100 uppercase font-black">
                  <th className="border border-slate-300 p-2">NO</th>
                  <th className="border border-slate-300 p-2 text-left">NAMA LENGKAP</th>
                  <th className="border border-slate-300 p-2">NIS</th>
                  <th className="border border-slate-300 p-2">JK</th>
                  {reportType === 'daily' ? <th className="border border-slate-300 p-2">KET</th> : <th className="border border-slate-300 p-2">H | I | S | A | D</th>}
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((s, idx) => {
                  const daily = getDailyAttendanceData(s.id);
                  const ms = getMonthlyStats(s.id);
                  return (
                    <tr key={s.id}>
                      <td className="border border-slate-300 p-2 text-center">{idx + 1}</td>
                      <td className="border border-slate-300 p-2 font-bold uppercase">{s.name}</td>
                      <td className="border border-slate-300 p-2 text-center">{s.nis}</td>
                      <td className="border border-slate-300 p-2 text-center">{s.gender}</td>
                      <td className="border border-slate-300 p-2 text-center">
                        {reportType === 'daily' ? (daily.status ? daily.status[0] : '-') : `${ms[AttendanceStatus.HADIR]} | ${ms[AttendanceStatus.IZIN]} | ${ms[AttendanceStatus.SAKIT]} | ${ms[AttendanceStatus.ALPA]} | ${ms[AttendanceStatus.DISPENSASI]}`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="mt-8 flex justify-between items-start text-[11px]">
              <div className="space-y-1 bg-slate-50 p-4 border border-slate-200 rounded-xl min-w-[220px]">
                <p className="font-black border-b border-slate-300 pb-1 mb-2 uppercase text-xs">Rekap Status</p>
                <div className="flex justify-between"><span>Hadir (H)</span><span className="font-bold">{classStatusRekap.H}</span></div>
                <div className="flex justify-between"><span>Sakit (S)</span><span className="font-bold">{classStatusRekap.S}</span></div>
                <div className="flex justify-between"><span>Izin (I)</span><span className="font-bold">{classStatusRekap.I}</span></div>
                <div className="flex justify-between"><span>Alpa (A)</span><span className="font-bold">{classStatusRekap.A}</span></div>
              </div>

              <div className="text-center min-w-[240px]">
                <p>Kwanyar, {printDate}</p>
                <p className="font-bold">Kepala SMAN 1 Kwanyar</p>
                <div className="mt-16">
                  <p className="font-black underline uppercase">{headmaster?.name || '-'}</p>
                  <p className="text-[10px]">NIP. {headmaster?.nip || '-'}</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default ReportsPage;
