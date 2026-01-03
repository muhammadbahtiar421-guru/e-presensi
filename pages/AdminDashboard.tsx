
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

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  records = [], 
  teachers = [], 
  classes = [], 
  subjects = [], 
  students = [], 
  onLogout 
}) => {
  const [aiInsight, setAiInsight] = useState<string>('Menunggu data untuk dianalisis...');

  useEffect(() => {
    const fetchInsight = async () => {
      if (!Array.isArray(records) || records.length === 0) {
        setAiInsight("Belum ada data kehadiran untuk dianalisis oleh AI.");
        return;
      }
      try {
        const insight = await geminiService.analyzeAttendance(records.slice(-10));
        setAiInsight(insight);
      } catch (err) {
        setAiInsight("Analisis AI sedang tidak tersedia.");
      }
    };
    fetchInsight();
  }, [records]);

  // Safe Aggregations
  const safeRecords = Array.isArray(records) ? records : [];
  const safeStudents = Array.isArray(students) ? students : [];
  const safeClasses = Array.isArray(classes) ? classes : [];

  const totalHadir = safeRecords.reduce((acc, rec) => 
    acc + (Array.isArray(rec.students) ? rec.students.filter(s => s.status === AttendanceStatus.HADIR).length : 0), 0);
  
  const totalSiswaInRecords = safeRecords.reduce((acc, rec) => acc + (Array.isArray(rec.students) ? rec.students.length : 0), 0);
  const presenceRate = totalSiswaInRecords ? Math.round((totalHadir / totalSiswaInRecords) * 100) : 0;

  const classChartData = safeClasses.map(c => {
    const classRecords = safeRecords.filter(r => r.classId === c.id);
    const total = classRecords.reduce((acc, r) => acc + (Array.isArray(r.students) ? r.students.length : 0), 0);
    const hadir = classRecords.reduce((acc, r) => acc + (Array.isArray(r.students) ? r.students.filter(s => s.status === AttendanceStatus.HADIR).length : 0), 0);
    return { name: c.name, hadir: total ? Math.round((hadir/total)*100) : 0 };
  });

  const statusCounts = {
    [AttendanceStatus.HADIR]: 0,
    [AttendanceStatus.IZIN]: 0,
    [AttendanceStatus.SAKIT]: 0,
    [AttendanceStatus.DISPENSASI]: 0,
    [AttendanceStatus.ALPA]: 0,
  };

  safeRecords.forEach(r => {
    if (Array.isArray(r.students)) {
      r.students.forEach(s => {
        if (statusCounts[s.status] !== undefined) statusCounts[s.status]++;
      });
    }
  });

  const pieData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#f43f5e'];

  return (
    <AdminLayout onLogout={onLogout}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <StatCard title="Presence" value={`${presenceRate}%`} sub="Rate Kehadiran" color="emerald" icon="fa-chart-line" />
        <StatCard title="Sesi" value={safeRecords.length} sub="Sesi Mengajar" color="blue" icon="fa-clipboard-list" />
        <StatCard title="Guru" value={teachers.length} sub="Total Pendidik" color="amber" icon="fa-user-tie" />
        <StatCard title="Mapel" value={subjects.length} sub="Mata Pelajaran" color="pink" icon="fa-book" />
        <StatCard title="Kelas" value={safeClasses.length} sub="Rombel" color="purple" icon="fa-school" />
        <StatCard title="Siswa" value={safeStudents.length} sub="Peserta Didik" color="rose" icon="fa-users" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <h4 className="font-black text-slate-800 mb-6 text-xs uppercase tracking-widest">Kehadiran per Kelas (%)</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={classChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} unit="%" />
                <Tooltip />
                <Bar dataKey="hadir" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <h4 className="font-black text-slate-800 mb-6 text-xs uppercase tracking-widest">Status Siswa Keseluruhan</h4>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                  {pieData.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {pieData.map((d, i) => (
              <div key={i} className="flex flex-col border-l-2 pl-2" style={{ borderLeftColor: COLORS[i] }}>
                <span className="text-[9px] font-bold text-slate-400 uppercase">{d.name}</span>
                <span className="text-sm font-black text-slate-800">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 bg-gradient-to-br from-slate-900 to-blue-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <i className="fas fa-brain absolute -bottom-4 -right-4 text-8xl opacity-10"></i>
        <h4 className="font-black text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
          <i className="fas fa-magic text-amber-400"></i> AI Attendance Insight
        </h4>
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20">
          <p className="text-sm leading-relaxed whitespace-pre-line text-blue-50 font-medium">{aiInsight}</p>
        </div>
      </div>
    </AdminLayout>
  );
};

const StatCard = ({ title, value, sub, color, icon }: any) => (
  <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 hover:border-blue-200 transition-colors">
    <div className="flex justify-between items-center mb-1">
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</span>
      <i className={`fas ${icon} text-${color}-500 text-xs`}></i>
    </div>
    <h3 className="text-xl font-black text-slate-800">{value}</h3>
    <p className="text-[9px] text-slate-400 font-bold uppercase">{sub}</p>
  </div>
);

export default AdminDashboard;
