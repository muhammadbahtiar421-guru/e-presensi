
import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  Users, GraduationCap, BookOpen, Layers, 
  CheckCircle2, AlertTriangle, Clock, TrendingUp, User, Book, MapPin, FileText, Database, RefreshCw, ShieldCheck, History
} from 'lucide-react';
import { AppState, AttendanceStatus } from '../types';
import { STATUS_COLORS } from '../constants';
import { syncToMySQL, createSystemSnapshot, restoreFromSnapshot } from '../storage';

interface AdminDashboardProps {
  data: AppState;
  onUpdate: (data: AppState) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ data, onUpdate }) => {
  const [syncStatus, setSyncStatus] = useState<{loading: boolean, message: string | null}>({
    loading: false,
    message: null
  });
  const [lockStatus, setLockStatus] = useState<string | null>(null);

  const handleSync = async () => {
    setSyncStatus({ loading: true, message: 'Menghubungkan ke MySQL...' });
    const result = await syncToMySQL(data);
    setSyncStatus({ loading: false, message: result.message });
    setTimeout(() => setSyncStatus(prev => ({ ...prev, message: null })), 5000);
  };

  const handleLockSystem = () => {
    createSystemSnapshot(data);
    setLockStatus('Sistem Berhasil Dikunci! Versi ini sekarang menjadi standar stabil.');
    setTimeout(() => setLockStatus(null), 4000);
  };

  const handleRestore = () => {
    const snap = restoreFromSnapshot();
    if (snap && window.confirm("Kembalikan sistem ke kondisi stabil yang dikunci sebelumnya?")) {
      onUpdate(snap);
      setLockStatus('Sistem berhasil dipulihkan ke versi stabil.');
      setTimeout(() => setLockStatus(null), 4000);
    }
  };

  const maleCount = data.students.filter(s => s.gender === 'L').length;
  const femaleCount = data.students.filter(s => s.gender === 'P').length;

  const stats = [
    { label: 'Efisiensi', value: '94.2%', icon: <TrendingUp className="text-blue-600" />, sub: '+2.5% vs Kemarin' },
    { label: 'Total Guru', value: data.teachers.length.toString(), icon: <Users className="text-purple-600" />, sub: 'Guru Aktif' },
    { label: 'Total Kelas', value: data.classes.length.toString(), icon: <Layers className="text-orange-600" />, sub: 'Ruang Kelas' },
    { label: 'Mata Pelajaran', value: data.subjects.length.toString(), icon: <BookOpen className="text-green-600" />, sub: 'Mapel Terdaftar' },
    { label: 'Total Siswa', value: data.students.length.toString(), icon: <GraduationCap className="text-pink-600" />, sub: 'Siswa Aktif' },
    { label: 'Siswa Laki-laki', value: maleCount.toString(), icon: <User className="text-indigo-600" />, sub: 'Total Putra' },
    { label: 'Siswa Perempuan', value: femaleCount.toString(), icon: <User className="text-pink-400" />, sub: 'Total Putri' },
  ];

  const today = new Date().toISOString().split('T')[0];
  const todayPresences = data.presences.filter(p => p.timestamp.startsWith(today));

  const statusRecap = [
    { name: 'Hadir', value: 0, status: AttendanceStatus.HADIR, color: '#22c55e' },
    { name: 'Izin', value: 0, status: AttendanceStatus.IZIN, color: '#3b82f6' },
    { name: 'Sakit', value: 0, status: AttendanceStatus.SAKIT, color: '#eab308' },
    { name: 'Alfa', value: 0, status: AttendanceStatus.ALFA, color: '#ef4444' },
    { name: 'Dispensasi', value: 0, status: AttendanceStatus.DISPENSASI, color: '#a855f7' },
  ].map(item => {
    let count = 0;
    todayPresences.forEach(p => {
      p.studentsAttendance.forEach(sa => {
        if (sa.status === item.status) count++;
      });
    });
    return { ...item, value: count };
  });

  const attendanceByClass = data.classes.map(c => {
    const classPresences = todayPresences.filter(p => p.classId === c.id);
    let h = 0, a = 0;
    classPresences.forEach(p => {
      p.studentsAttendance.forEach(sa => {
        if (sa.status === AttendanceStatus.HADIR) h++;
        else if (sa.status === AttendanceStatus.ALFA) a++;
      });
    });
    return { name: c.name, present: h, alpha: a };
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div><h2 className="text-2xl font-bold text-slate-900">Dashboard Overview</h2><p className="text-slate-500">Ringkasan aktivitas akademik hari ini.</p></div>
        <div className="flex gap-2">
          <button 
            onClick={handleSync} 
            disabled={syncStatus.loading} 
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-bold shadow-lg transition-all ${syncStatus.loading ? 'bg-slate-100 text-slate-400' : 'bg-slate-900 text-white hover:bg-black'}`}
          >
            <RefreshCw size={16} className={syncStatus.loading ? 'animate-spin' : ''} /> Sync MySQL
          </button>
          <button 
            onClick={handleLockSystem}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-2xl text-sm font-bold shadow-lg hover:bg-blue-700 transition-all"
          >
            <ShieldCheck size={16} /> Amankan Versi
          </button>
        </div>
      </div>

      {lockStatus && (
        <div className="p-4 bg-blue-50 border border-blue-200 text-blue-700 rounded-2xl flex items-center justify-between animate-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <ShieldCheck size={20} />
            <p className="text-sm font-bold">{lockStatus}</p>
          </div>
          <button onClick={handleRestore} className="px-4 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-2">
            <History size={14} /> Restore Jika Gagal
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
            <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">{stat.icon}</div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</h3>
            <p className="text-[10px] font-medium text-slate-500 mt-2 bg-slate-50 inline-block px-2 py-0.5 rounded-full">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
          <h3 className="font-bold text-lg text-slate-900 mb-8">Kehadiran per Kelas (Hari Ini)</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceByClass.slice(0, 6)}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', border: 'none'}} />
                <Bar dataKey="present" name="Hadir" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="alpha" name="Alfa" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col">
          <h3 className="font-bold text-lg text-slate-900 mb-6">Rekap Kehadiran Siswa</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusRecap} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {statusRecap.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip />
                <Legend layout="vertical" verticalAlign="middle" align="right" />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {statusRecap.map(item => (
              <div key={item.name} className="flex items-center justify-between p-2 bg-slate-50 rounded-xl">
                <span className="text-xs font-bold text-slate-600">{item.name}</span>
                <span className="text-sm font-black text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100"><h3 className="font-bold text-lg text-slate-900 flex items-center gap-2"><Users size={20} className="text-blue-500" /> Aktivitas Mengajar Hari Ini</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-[10px] uppercase tracking-widest font-bold">
                <th className="px-8 py-4 w-16 text-center">No</th>
                <th className="px-8 py-4">Nama Guru</th>
                <th className="px-8 py-4">Kelas</th>
                <th className="px-8 py-4">Mapel</th>
                <th className="px-8 py-4 text-center">Jam Ke</th>
                <th className="px-8 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {todayPresences.map((p, idx) => {
                const teacher = data.teachers.find(t => t.id === p.teacherId);
                const classData = data.classes.find(c => c.id === p.classId);
                return (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-4 text-center text-xs text-slate-400">{idx + 1}</td>
                    <td className="px-8 py-4 font-bold text-slate-900 text-sm">{teacher?.name || 'Unknown'}</td>
                    <td className="px-8 py-4 text-xs text-slate-600">{classData?.name}</td>
                    <td className="px-8 py-4 text-xs text-slate-600">{p.subjectId}</td>
                    <td className="px-8 py-4 text-center"><span className="px-2.5 py-1 bg-slate-100 rounded-lg text-[10px] font-black">{p.period}</span></td>
                    <td className="px-8 py-4 text-center">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-bold uppercase tracking-widest">
                        <CheckCircle2 size={12} /> Sukses
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
