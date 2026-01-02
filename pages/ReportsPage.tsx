
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

const ReportsPage: React.FC<ReportsPageProps> = ({ records, students, classes, subjects, teachers, headmaster, onLogout }) => {
  const [reportType, setReportType] = useState<'daily' | 'monthly'>('daily');
  const [filterClass, setFilterClass] = useState('');
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7));

  const now = new Date();
  const printDate = now.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const printTime = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const selectedClassName = classes.find(c => c.id === filterClass)?.name || '-';
  const filteredStudents = students.filter(s => !filterClass || s.classId === filterClass);
  const totalLK = filteredStudents.filter(s => s.gender === 'L').length;
  const totalPR = filteredStudents.filter(s => s.gender === 'P').length;
  
  const getDailyAttendanceData = (studentId: string) => {
    const record = records.find(r => 
      r.date === filterDate && 
      r.classId === filterClass
    );
    const studentEntry = record?.students.find(s => s.studentId === studentId);
    return {
      status: studentEntry?.status,
      period: record?.period || '-',
      timestamp: record?.createdAt || '-'
    };
  };

  const getMonthlyStats = (studentId: string) => {
    const monthlyRecords = records.filter(r => 
      r.date.startsWith(filterMonth) && 
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
      const studentStatus = r.students.find(s => s.studentId === studentId)?.status;
      if (studentStatus) stats[studentStatus]++;
    });

    return stats;
  };

  // Hitung Rekap Total Status untuk Seluruh Kelas
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

  const handlePrint = () => {
    window.print();
  };

  const exportToExcel = () => {
    const table = document.getElementById('report-table');
    if (!table) return;
    const html = table.outerHTML;
    const url = 'data:application/vnd.ms-excel,' + encodeURIComponent(html);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Laporan_${reportType}_${selectedClassName}.xls`;
    link.click();
  };

  const exportToWord = () => {
    const content = document.getElementById('report-content');
    if (!content) return;
    const html = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>Laporan</title><style>
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid black; padding: 5px; font-family: Arial; font-size: 10pt; }
        .text-center { text-align: center; }
        .font-bold { font-weight: bold; }
      </style></head>
      <body>${content.innerHTML}</body></html>`;
    const url = 'data:application/msword;charset=utf-8,' + encodeURIComponent(html);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Laporan_${reportType}_${selectedClassName}.doc`;
    link.click();
  };

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
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{reportType === 'daily' ? 'Pilih Tanggal' : 'Pilih Bulan'}</label>
            <input type={reportType === 'daily' ? "date" : "month"} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none" value={reportType === 'daily' ? filterDate : filterMonth} onChange={e => reportType === 'daily' ? setFilterDate(e.target.value) : setFilterMonth(e.target.value)} />
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={handlePrint} disabled={!filterClass} className="bg-blue-800 text-white px-6 py-3 rounded-xl font-black text-sm hover:bg-blue-900 transition flex items-center gap-2 shadow-lg disabled:opacity-50">
              <i className="fas fa-print"></i> CETAK
            </button>
            <button onClick={exportToExcel} disabled={!filterClass} className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-black text-sm hover:bg-emerald-700 transition flex items-center gap-2 shadow-lg disabled:opacity-50">
              <i className="fas fa-file-excel"></i> EXCEL
            </button>
            <button onClick={exportToWord} disabled={!filterClass} className="bg-blue-500 text-white px-6 py-3 rounded-xl font-black text-sm hover:bg-blue-600 transition flex items-center gap-2 shadow-lg disabled:opacity-50">
              <i className="fas fa-file-word"></i> WORD
            </button>
          </div>
        </div>
      </div>

      <div id="report-content" className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden print:border-none print:shadow-none p-8">
        
        {/* Kop Surat */}
        <div className="flex flex-col items-center border-b-4 border-double border-slate-900 pb-4 mb-2">
          <h2 className="text-sm font-bold">PEMERINTAH PROVINSI JAWA TIMUR</h2>
          <h2 className="text-sm font-bold uppercase tracking-tight">DINAS PENDIDIKAN</h2>
          <h1 className="text-2xl font-black uppercase tracking-tighter">SMAN 1 KWANYAR</h1>
          <p className="text-xs font-bold italic text-slate-600 mb-1">"CERDAS - BERAKHLAK - BERPRESTASI"</p>
          <p className="text-[10px]">Jl. Raya Pesanggrahan No.1 Kwanyar, Bangkalan, Madura, 69163</p>
        </div>
        
        <div className="text-center mb-6">
          <h3 className="text-sm font-black uppercase underline">
            LAPORAN {reportType === 'daily' ? 'PRESENSI HARIAN' : 'REKAPITULASI BULANAN'}
          </h3>
          <p className="text-xs font-bold">KELAS: {selectedClassName}</p>
          <p className="text-[10px]">Periode: {reportType === 'daily' ? filterDate : filterMonth}</p>
        </div>

        {!filterClass ? (
          <div className="p-20 text-center text-slate-300 italic">Pilih kelas untuk pratinjau data.</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table id="report-table" className="w-full text-[10px] border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 uppercase font-black">
                    <th className="border border-slate-300 p-2 w-8">NO</th>
                    <th className="border border-slate-300 p-2 text-left">NAMA LENGKAP</th>
                    <th className="border border-slate-300 p-2">NIS</th>
                    <th className="border border-slate-300 p-2 w-8">JK</th>
                    {reportType === 'daily' ? (
                      <>
                        <th className="border border-slate-300 p-2 w-20">JAM KE</th>
                        <th className="border border-slate-300 p-2 w-28">JAM ABSEN</th>
                        <th className="border border-slate-300 p-2 w-16">KET</th>
                      </>
                    ) : (
                      <>
                        <th className="border border-slate-300 p-2">H</th>
                        <th className="border border-slate-300 p-2">I</th>
                        <th className="border border-slate-300 p-2">S</th>
                        <th className="border border-slate-300 p-2">A</th>
                        <th className="border border-slate-300 p-2">D</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((s, idx) => {
                    const daily = getDailyAttendanceData(s.id);
                    const stats = getMonthlyStats(s.id);
                    return (
                      <tr key={s.id} className="hover:bg-slate-50">
                        <td className="border border-slate-300 p-2 text-center">{idx + 1}</td>
                        <td className="border border-slate-300 p-2 font-bold uppercase">{s.name}</td>
                        <td className="border border-slate-300 p-2 text-center font-mono">{s.nis}</td>
                        <td className="border border-slate-300 p-2 text-center">{s.gender}</td>
                        {reportType === 'daily' ? (
                          <>
                            <td className="border border-slate-300 p-2 text-center font-bold">{daily.period}</td>
                            <td className="border border-slate-300 p-2 text-center font-mono text-[9px]">{daily.timestamp}</td>
                            <td className={`border border-slate-300 p-2 text-center font-black ${daily.status === AttendanceStatus.ALPA ? 'text-rose-600 bg-rose-50' : ''}`}>
                              {daily.status ? daily.status[0] : '-'}
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="border border-slate-300 p-2 text-center">{stats[AttendanceStatus.HADIR]}</td>
                            <td className="border border-slate-300 p-2 text-center font-bold text-amber-600">{stats[AttendanceStatus.IZIN]}</td>
                            <td className="border border-slate-300 p-2 text-center font-bold text-blue-600">{stats[AttendanceStatus.SAKIT]}</td>
                            <td className="border border-slate-300 p-2 text-center font-black text-rose-600">{stats[AttendanceStatus.ALPA]}</td>
                            <td className="border border-slate-300 p-2 text-center font-bold text-purple-600">{stats[AttendanceStatus.DISPENSASI]}</td>
                          </>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-8 flex justify-between items-start text-[11px]">
              <div className="space-y-4">
                <div className="space-y-1 bg-slate-50 p-4 border border-slate-200 rounded-xl min-w-[220px]">
                  <p className="font-bold border-b border-slate-300 pb-1 mb-2 uppercase tracking-tighter">Rekapitulasi Siswa ({selectedClassName})</p>
                  <div className="flex justify-between gap-8">
                    <span>Laki-laki (LK)</span>
                    <span className="font-bold">{totalLK} Siswa</span>
                  </div>
                  <div className="flex justify-between gap-8">
                    <span>Perempuan (PR)</span>
                    <span className="font-bold">{totalPR} Siswa</span>
                  </div>
                  <div className="flex justify-between gap-8 border-t border-slate-300 pt-1 mt-1 font-black">
                    <span>TOTAL SISWA</span>
                    <span>{totalLK + totalPR} Siswa</span>
                  </div>
                </div>

                <div className="space-y-1 bg-blue-50 p-4 border border-blue-100 rounded-xl min-w-[220px]">
                  <p className="font-bold border-b border-blue-200 pb-1 mb-2 uppercase tracking-tighter text-blue-800">Rekapitulasi Status Kehadiran</p>
                  <div className="grid grid-cols-2 gap-x-4">
                    <div className="flex justify-between"><span>Hadir (H)</span><span className="font-bold">{classStatusRekap.H}</span></div>
                    <div className="flex justify-between"><span>Sakit (S)</span><span className="font-bold">{classStatusRekap.S}</span></div>
                    <div className="flex justify-between"><span>Izin (I)</span><span className="font-bold">{classStatusRekap.I}</span></div>
                    <div className="flex justify-between"><span>Alpa (A)</span><span className="font-bold text-rose-600">{classStatusRekap.A}</span></div>
                    <div className="flex justify-between"><span>Disp (D)</span><span className="font-bold">{classStatusRekap.D}</span></div>
                  </div>
                </div>
              </div>

              <div className="text-center space-y-20 min-w-[240px]">
                <div className="space-y-1">
                  <p>Kwanyar, {printDate}</p>
                  <p className="font-bold">Mengetahui,</p>
                  <p className="font-bold">Kepala SMAN 1 Kwanyar</p>
                </div>
                <div>
                  <p className="font-black underline uppercase">{headmaster.name}</p>
                  <p className="text-[10px]">NIP. {headmaster.nip}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-12 pt-4 border-t border-slate-100">
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                Jam Cetak: {printTime} | Dicetak oleh Sistem E-Presensi SMAN 1 Kwanyar
              </p>
              <p className="text-[8px] italic text-slate-400 mt-1">
                Keterangan: H (Hadir), I (Izin), S (Sakit), A (Alpa), D (Dispensasi)
              </p>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default ReportsPage;
