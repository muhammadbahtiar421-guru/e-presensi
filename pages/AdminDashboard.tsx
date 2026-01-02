
import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { AttendanceRecord, Teacher, ClassRoom, AttendanceStatus } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { geminiService } from '../services/geminiService';

interface AdminDashboardProps {
  records: AttendanceRecord[];
  teachers: Teacher[];
  classes: ClassRoom[];
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ records, teachers, classes, onLogout }) => {
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
  const totalSiswa = records.reduce((acc, rec) => acc + rec.students.length, 0);
  const presenceRate = totalSiswa ? Math.round((totalHadir / totalSiswa) * 100) : 0;

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-500 text-sm font-medium">Tingkat Kehadiran</span>
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
              <i className="fas fa-chart-line"></i>
            </div>
          </div>
          <h3 className="text-3xl font-bold text-slate-800">{presenceRate}%</h3>
          <p className="text-xs text-slate-400 mt-2">Rata-rata kumulatif</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-500 text-sm font-medium">Total Presensi</span>
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <i className="fas fa-clipboard-check"></i>
            </div>
          </div>
          <h3 className="text-3xl font-bold text-slate-800">{records.length}</h3>
          <p className="text-xs text-slate-400 mt-2">Sesi terekam</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-500 text-sm font-medium">Total Guru</span>
            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
              <i className="fas fa-user-tie"></i>
            </div>
          </div>
          <h3 className="text-3xl font-bold text-slate-800">{teachers.length}</h3>
          <p className="text-xs text-slate-400 mt-2">Aktif mengajar</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-500 text-sm font-medium">Total Kelas</span>
            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
              <i className="fas fa-users"></i>
            </div>
          </div>
          <h3 className="text-3xl font-bold text-slate-800">{classes.length}</h3>
          <p className="text-xs text-slate-400 mt-2">Rombongan belajar</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h4 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <i className="fas fa-chart-bar text-blue-500"></i>
            Kehadiran per Kelas (%)
          </h4>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={classChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} unit="%" />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="hadir" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h4 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <i className="fas fa-chart-pie text-purple-500"></i>
            Distribusi Status Siswa
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
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
          <div className="mt-4 grid grid-cols-2 gap-2">
            {pieData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-2 text-xs font-medium text-slate-600">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }}></div>
                {d.name}: {d.value}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Insight Box */}
      <div className="mt-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl shadow-blue-200 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <i className="fas fa-brain text-9xl"></i>
        </div>
        <div className="relative z-10">
          <h4 className="flex items-center gap-2 font-bold mb-4">
            <i className="fas fa-magic"></i>
            Analisis Cerdas Gemini AI
          </h4>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
            <p className="text-blue-50 leading-relaxed whitespace-pre-line">
              {aiInsight}
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
