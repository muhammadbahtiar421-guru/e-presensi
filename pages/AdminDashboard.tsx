
import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { AttendanceRecord, Teacher, ClassRoom, AttendanceStatus, Subject, Student } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { geminiService } from '../services/geminiService';

interface AdminDashboardProps {
  records: AttendanceRecord[];
  teachers: Teacher[];
  classes: ClassRoom[];
  subjects: Subject[];
  students: Student[];
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ records, teachers, classes, subjects, students, onLogout }) => {
  const [aiInsight, setAiInsight] = useState<string>('Menganalisis data...');

  useEffect(() => {
    const fetchInsight = async () => {
      if (records.length === 0) {
        setAiInsight("Belum ada data kehadiran untuk dianalisis.");
        return;
      }
      const insight = await geminiService.analyzeAttendance(records.slice(-20));
      setAiInsight(insight);
    };
    fetchInsight();
  }, [records]);

  // Aggregate stats
  const totalHadir = records.reduce((acc, rec) => 
    acc + rec.students.filter(s => s.status === AttendanceStatus.HADIR).length, 0);
  const totalSiswaAbsenRecord = records.reduce((acc, rec) => acc + rec.students.length, 0);
  const presenceRate = totalSiswaAbsenRecord ? Math.round((totalHadir / totalSiswaAbsenRecord) * 100) : 0;

  // Breakdown Gender Siswa Master
  const totalLK = students.filter(s => s.gender === 'L').length;
  const totalPR = students.filter(s => s.gender === 'P').length;

  // Chart data: Presence per Class
  const classChartData = classes.map(c => {
    const classRecords = records.filter(r => r.classId === c.id);
    const total = classRecords.reduce((acc, r) => acc + r.students.length, 0);
    const hadir = classRecords.reduce((acc, r) => acc + r.students.filter(s => s.status === AttendanceStatus.HADIR).length, 0);
    return {
      name: c.name,
      hadir: total ? Math.round((hadir/total)*100) : 0
    };
  });

  // Pie chart data: Overall status distribution
  const statusCounts = {
    [AttendanceStatus.HADIR]: 0,
    [AttendanceStatus.IZIN]: 0,
    [AttendanceStatus.SAKIT]: 0,
    [AttendanceStatus.DISPENSASI]: 0,
    [AttendanceStatus.ALPA]: 0,
  };

  records.forEach(r => r.students.forEach(s => {
    statusCounts[s.status]++;
  }));

  const pieData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#f43f5e'];

  return (
    <AdminLayout onLogout={onLogout}>
      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Presensi</span>
            <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center text-sm">
              <i className="fas fa-chart-line"></i>
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-800">{presenceRate}%</h3>
          <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-tighter">Rate Kehadiran</p>
        </div>

        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Sesi</span>
            <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center text-sm">
              <i className="fas fa-clipboard-list"></i>
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-800">{records.length}</h3>
          <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-tighter">Sesi Mengajar</p>
        </div>

        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Guru</span>
            <div className="w-8 h-8 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center text-sm">
              <i className="fas fa-user-tie"></i>
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-800">{teachers.length}</h3>
          <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-tighter">Total Pendidik</p>
        </div>

        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Mapel</span>
            <div className="w-8 h-8 bg-pink-50 text-pink-600 rounded-lg flex items-center justify-center text-sm">
              <i className="fas fa-book"></i>
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-800">{subjects.length}</h3>
          <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-tighter">Total Mata Pelajaran</p>
        </div>

        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Kelas</span>
            <div className="w-8 h-8 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center text-sm">
              <i className="fas fa-school"></i>
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-800">{classes.length}</h3>
          <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-tighter">Rombongan Belajar</p>
        </div>

        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Siswa</span>
            <div className="w-8 h-8 bg-rose-50 text-rose-600 rounded-lg flex items-center justify-center text-sm">
              <i className="fas fa-users"></i>
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-800">{students.length}</h3>
          <div className="flex gap-2 mt-1">
            <span className="text-[9px] font-black bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded uppercase">LK: {totalLK}</span>
            <span className="text-[9px] font-black bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded uppercase">PR: {totalPR}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <h4 className="font-black text-slate-800 mb-8 flex items-center gap-3 uppercase tracking-tight">
            <i className="fas fa-chart-bar text-blue-600"></i>
            Grafik Kehadiran per Kelas (%)
          </h4>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={classChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} fontStyle="bold" />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} unit="%" />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="hadir" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <h4 className="font-black text-slate-800 mb-8 flex items-center gap-3 uppercase tracking-tight">
            <i className="fas fa-chart-pie text-purple-600"></i>
            Status Kehadiran Siswa
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4">
            {pieData.map((d, i) => (
              <div key={d.name} className="flex flex-col gap-0.5 border-l-4 p-2 rounded bg-slate-50 transition-all hover:translate-x-1" style={{ borderLeftColor: COLORS[i] }}>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{d.name}</span>
                <span className="text-lg font-black text-slate-800">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Insight Box */}
      <div className="mt-8 bg-gradient-to-br from-blue-700 to-indigo-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none transition-transform group-hover:scale-110">
          <i className="fas fa-brain text-9xl"></i>
        </div>
        <div className="relative z-10">
          <h4 className="flex items-center gap-3 font-black text-lg mb-6 uppercase tracking-widest">
            <i className="fas fa-magic text-amber-400"></i>
            Analisis Cerdas Gemini AI
          </h4>
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-inner">
            <p className="text-blue-50 leading-relaxed whitespace-pre-line font-medium text-sm md:text-base">
              {aiInsight}
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
