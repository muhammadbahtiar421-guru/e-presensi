
import React, { useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { AttendanceRecord, Teacher, ClassRoom, Student, Headmaster, AttendanceStatus, ViolationRecord, ViolationItem, Subject } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

interface MonitoringPageProps {
  records: AttendanceRecord[];
  teachers: Teacher[];
  subjects: Subject[];
  classes: ClassRoom[];
  students: Student[];
  violationRecords: ViolationRecord[];
  violationItems: ViolationItem[];
  headmaster: Headmaster;
  setHeadmaster: (v: Headmaster) => void;
  onLogout: () => void;
}

const MonitoringPage: React.FC<MonitoringPageProps> = ({ 
  records, teachers, subjects, classes, students, violationRecords, violationItems, headmaster, setHeadmaster, onLogout 
}) => {
  const [editingKS, setEditingKS] = useState(false);
  const [ksForm, setKsForm] = useState(headmaster);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const handleUpdateKS = (e: React.FormEvent) => {
    e.preventDefault();
    setHeadmaster(ksForm);
    setEditingKS(false);
  };

  // 1. Aktivitas Mengajar Detail
  const dailyActivities = records.filter(r => r.date === selectedDate);

  // 2. Monitoring Ketidakhadiran
  const classAbsenceData = classes.map(c => {
    const classRecords = records.filter(r => r.classId === c.id && r.date === selectedDate);
    const alpaCount = classRecords.reduce((acc, r) => acc + r.students.filter(s => s.status === AttendanceStatus.ALPA).length, 0);
    const sakitCount = classRecords.reduce((acc, r) => acc + r.students.filter(s => s.status === AttendanceStatus.SAKIT).length, 0);
    const izinCount = classRecords.reduce((acc, r) => acc + r.students.filter(s => s.status === AttendanceStatus.IZIN).length, 0);
    return {
      name: c.name,
      alpa: alpaCount,
      sakit: sakitCount,
      izin: izinCount,
      totalAbsen: alpaCount + sakitCount + izinCount
    };
  }).filter(c => c.totalAbsen > 0);

  // 3. Monitoring Pelanggaran (Kedisiplinan)
  const todayViolations = violationRecords.filter(r => r.date === selectedDate);
  const currentMonth = selectedDate.slice(0, 7);
  const monthViolations = violationRecords.filter(r => r.date.startsWith(currentMonth));

  const violationStatsByCategory = [
    { name: 'Ringan', value: monthViolations.filter(r => violationItems.find(vi => vi.id === r.violationItemId)?.category === 'Ringan').length, color: '#3b82f6' },
    { name: 'Sedang', value: monthViolations.filter(r => violationItems.find(vi => vi.id === r.violationItemId)?.category === 'Sedang').length, color: '#f59e0b' },
    { name: 'Berat', value: monthViolations.filter(r => violationItems.find(vi => vi.id === r.violationItemId)?.category === 'Berat').length, color: '#f43f5e' },
  ];

  const classViolationRekap = classes.map(c => {
    const vCountMonth = monthViolations.filter(r => {
      const s = students.find(stud => stud.id === r.studentId);
      return s?.classId === c.id;
    }).length;
    const vCountToday = todayViolations.filter(r => {
      const s = students.find(stud => stud.id === r.studentId);
      return s?.classId === c.id;
    }).length;
    return { name: c.name, today: vCountToday, month: vCountMonth };
  }).filter(c => c.month > 0);

  return (
    <AdminLayout onLogout={onLogout}>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Update Data Kasek & Filter */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-black text-slate-800 uppercase tracking-tight flex items-center gap-2 text-sm">
                <i className="fas fa-user-tie text-blue-600"></i> Kepala Sekolah
              </h4>
              <button onClick={() => setEditingKS(!editingKS)} className="text-blue-600 hover:text-blue-800 text-[10px] font-black underline uppercase">
                {editingKS ? 'Batal' : 'Edit'}
              </button>
            </div>

            {editingKS ? (
              <form onSubmit={handleUpdateKS} className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase">Nama Lengkap</label>
                  <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold mt-1" value={ksForm.name} onChange={e => setKsForm({...ksForm, name: e.target.value})} required />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase">NIP</label>
                  <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold mt-1" value={ksForm.nip} onChange={e => setKsForm({...ksForm, nip: e.target.value})} required />
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-black text-sm shadow-xl hover:bg-blue-700 transition">SIMPAN</button>
              </form>
            ) : (
              <div className="space-y-4 bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase">Nama KS</p>
                  <p className="font-black text-slate-800 text-sm uppercase underline decoration-blue-600 decoration-2 underline-offset-4">{headmaster.name}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase">NIP</p>
                  <p className="font-bold text-slate-600 text-xs">{headmaster.nip}</p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
            <h4 className="font-black text-slate-800 uppercase tracking-tight mb-4 text-sm">Pantau Tanggal</h4>
            <input type="date" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-sm" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
          </div>

          <div className="bg-slate-900 rounded-3xl shadow-xl p-6 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <i className="fas fa-exclamation-triangle text-6xl"></i>
            </div>
            <h4 className="font-black uppercase tracking-widest text-[10px] mb-4 text-amber-500">Rekap Disiplin (Bulan Ini)</h4>
            <div className="space-y-4">
              <div>
                <p className="text-3xl font-black">{monthViolations.length}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Total Insiden Pelanggaran</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white/10 p-2 rounded-xl border border-white/10">
                  <p className="text-sm font-black text-rose-400">{todayViolations.length}</p>
                  <p className="text-[8px] uppercase font-bold text-slate-300">Hari Ini</p>
                </div>
                <div className="bg-white/10 p-2 rounded-xl border border-white/10">
                  <p className="text-sm font-black text-amber-400">
                    {monthViolations.reduce((acc, r) => acc + (violationItems.find(vi => vi.id === r.violationItemId)?.points || 0), 0)}
                  </p>
                  <p className="text-[8px] uppercase font-bold text-slate-300">Total Poin</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Monitoring Guru & Grafik */}
        <div className="lg:col-span-3 space-y-8">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
              <h4 className="font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                <i className="fas fa-chalkboard-teacher text-blue-600"></i> Aktivitas Mengajar
              </h4>
              <span className="text-[10px] font-black px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full uppercase tracking-widest">{dailyActivities.length} SESI TERLAKSANA</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                    <th className="px-6 py-4">Nama Guru</th>
                    <th className="px-6 py-4">Mata Pelajaran</th>
                    <th className="px-6 py-4">Kelas</th>
                    <th className="px-6 py-4 text-center">Jam Ke</th>
                    <th className="px-6 py-4 text-center">Waktu Absen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {dailyActivities.map(r => (
                    <tr key={r.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-800 text-sm uppercase">{teachers.find(t => t.id === r.teacherId)?.name || 'Guru Dihapus'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs font-medium text-slate-600">{subjects.find(s => s.id === r.subjectId)?.name || 'Mapel Dihapus'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-black text-blue-600">{classes.find(c => c.id === r.classId)?.name || '-'}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-[10px] font-black">JAM {r.period}</span>
                      </td>
                      <td className="px-6 py-4 text-center font-mono text-xs text-slate-500">{r.createdAt}</td>
                    </tr>
                  ))}
                  {dailyActivities.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-300 italic font-bold uppercase tracking-widest">Tidak ada aktivitas pada tanggal ini.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
              <h4 className="font-black text-slate-800 uppercase tracking-tight mb-6 text-sm flex items-center gap-2">
                <i className="fas fa-chart-pie text-amber-500"></i> Kategori Pelanggaran (Bulan Ini)
              </h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={violationStatsByCategory}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {violationStatsByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-4">
                {violationStatsByCategory.map(cat => (
                  <div key={cat.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }}></div>
                    <span className="text-[10px] font-black uppercase text-slate-500">{cat.name}: {cat.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 bg-amber-50 border-b border-amber-100">
                <h4 className="font-black text-amber-800 uppercase tracking-tight text-sm">Disiplin per Kelas</h4>
              </div>
              <div className="overflow-y-auto max-h-[300px]">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-white border-b border-slate-100 text-slate-400 text-[9px] font-black uppercase tracking-widest">
                      <th className="px-4 py-3">Kelas</th>
                      <th className="px-4 py-3 text-center">Hari Ini</th>
                      <th className="px-4 py-3 text-center">Bulan Ini</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {classViolationRekap.map(c => (
                      <tr key={c.name} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-bold text-slate-700">{c.name}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-1 rounded-lg font-black ${c.today > 0 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-400'}`}>
                            {c.today}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center font-black text-slate-900">{c.month} Insiden</td>
                      </tr>
                    ))}
                    {classViolationRekap.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-4 py-10 text-center text-slate-300 italic">Belum ada catatan pelanggaran bulan ini.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 bg-rose-50 border-b border-rose-100 flex justify-between items-center">
          <h4 className="font-black text-rose-800 uppercase tracking-tight">Detail Siswa Absen ({selectedDate})</h4>
          <span className="text-[10px] font-black px-3 py-1 bg-white text-rose-700 rounded-full border border-rose-200 tracking-widest uppercase">
            TOTAL: {classAbsenceData.reduce((acc, c) => acc + c.totalAbsen, 0)} SISWA
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <th className="px-6 py-4">Nama Rombel / Kelas</th>
                <th className="px-6 py-4 text-center">ALPA (A)</th>
                <th className="px-6 py-4 text-center">SAKIT (S)</th>
                <th className="px-6 py-4 text-center">IZIN (I)</th>
                <th className="px-6 py-4 text-center bg-slate-50">JUMLAH</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm font-medium">
              {classAbsenceData.map(c => (
                <tr key={c.name} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 font-black text-slate-800">{c.name}</td>
                  <td className="px-6 py-4 text-center text-rose-600 font-black">{c.alpa}</td>
                  <td className="px-6 py-4 text-center text-blue-600 font-bold">{c.sakit}</td>
                  <td className="px-6 py-4 text-center text-amber-600 font-bold">{c.izin}</td>
                  <td className="px-6 py-4 text-center bg-slate-50 font-black text-lg">{c.totalAbsen}</td>
                </tr>
              ))}
              {classAbsenceData.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-300 italic font-bold">Tidak ada siswa yang absen pada tanggal ini.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default MonitoringPage;
