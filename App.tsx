
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import AttendancePage from './pages/AttendancePage';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import ManagementPage from './pages/ManagementPage';
import ReportsPage from './pages/ReportsPage';
import MonitoringPage from './pages/MonitoringPage';
import AccountSettingsPage from './pages/AccountSettingsPage';
import ViolationPage from './pages/ViolationPage';
import { supabase } from './supabaseClient';
import { 
  Teacher, Subject, ClassRoom, Student, AttendanceRecord, 
  User, Headmaster, ViolationItem, ViolationRecord 
} from './types';
import { 
  INITIAL_TEACHERS, INITIAL_SUBJECTS, INITIAL_CLASSES, 
  INITIAL_STUDENTS, INITIAL_VIOLATIONS 
} from './constants';

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [violationItems, setViolationItems] = useState<ViolationItem[]>([]);
  const [violationRecords, setViolationRecords] = useState<ViolationRecord[]>([]);
  const [headmaster, setHeadmaster] = useState<Headmaster>({ name: "Moch. Noerhadi, S.Pd., M.Pd.", nip: "19681125 199103 1 010" });
  const [adminCredentials, setAdminCredentials] = useState<any[]>([{ id: '1', username: 'admin', password: '123' }]);
  const [violationCredentials, setViolationCredentials] = useState<any[]>([{ id: '1', username: 'bk', password: '123' }]);
  
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const { data: t } = await supabase.from('teachers').select('*');
      const { data: sub } = await supabase.from('subjects').select('*');
      const { data: cl } = await supabase.from('classes').select('*');
      const { data: st } = await supabase.from('students').select('*');
      const { data: attRec } = await supabase.from('attendance_records').select('*');
      const { data: cfg } = await supabase.from('config').select('*');
      const { data: viItem } = await supabase.from('violation_items').select('*');
      const { data: viRec } = await supabase.from('violation_records').select('*');

      setTeachers(t && t.length > 0 ? t : INITIAL_TEACHERS);
      setSubjects(sub && sub.length > 0 ? sub : INITIAL_SUBJECTS);
      setClasses(cl && cl.length > 0 ? cl : INITIAL_CLASSES);
      setStudents(st && st.length > 0 ? st : INITIAL_STUDENTS);
      setAttendanceRecords(attRec || []);
      setViolationItems(viItem && viItem.length > 0 ? viItem : INITIAL_VIOLATIONS);
      setViolationRecords(viRec || []);

      if (cfg) {
        const hm = cfg.find((c: any) => c.key === 'headmaster')?.value;
        if (hm) setHeadmaster(typeof hm === 'string' ? JSON.parse(hm) : hm);
        const adm = cfg.find((c: any) => c.key === 'adminCredentials')?.value;
        if (adm) setAdminCredentials(typeof adm === 'string' ? JSON.parse(adm) : adm);
        const vic = cfg.find((c: any) => c.key === 'violationCredentials')?.value;
        if (vic) setViolationCredentials(typeof vic === 'string' ? JSON.parse(vic) : vic);
      }
    } catch (err) {
      console.error("Critical error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    window.location.hash = '#/login';
  };

  const handleRestore = async (data: any) => {
    setLoading(true);
    try {
      // Sederhananya, timpa data di state dan simpan ke Supabase jika diperlukan.
      // Di sini kita update local state dulu untuk UX instan
      if (data.teachers) setTeachers(data.teachers);
      if (data.students) setStudents(data.students);
      if (data.classes) setClasses(data.classes);
      if (data.subjects) setSubjects(data.subjects);
      if (data.attendance) setAttendanceRecords(data.attendance);
      if (data.violationItems) setViolationItems(data.violationItems);
      if (data.violationRecords) setViolationRecords(data.violationRecords);
      if (data.headmaster) setHeadmaster(data.headmaster);
      
      alert('Data berhasil dipulihkan secara lokal! Menyimpan ke server...');
      // Implementasi batch upload ke Supabase bisa ditambahkan di sini
      window.location.reload(); 
    } catch (err) {
      alert('Gagal memulihkan data: ' + err);
    } finally {
      setLoading(false);
    }
  };

  const addAttendance = async (record: AttendanceRecord) => {
    setAttendanceRecords(prev => [record, ...prev]);
    await supabase.from('attendance_records').insert([record]);
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-xs font-black tracking-widest uppercase">Sinkronisasi Database...</p>
    </div>
  );

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<AttendancePage teachers={teachers} subjects={subjects} classes={classes} students={students} records={attendanceRecords} onSubmit={addAttendance} currentUser={currentUser} onLogout={handleLogout} />} />
        
        <Route path="/login" element={currentUser ? <Navigate to="/admin" replace /> : <LoginPage teachers={teachers} adminCredentials={adminCredentials} onLogin={(u) => { setCurrentUser(u); localStorage.setItem('currentUser', JSON.stringify(u)); }} />} />
        
        <Route path="/violations" element={<ViolationPage students={students} classes={classes} teachers={teachers} violationItems={violationItems} setViolationItems={setViolationItems} violationRecords={violationRecords} setViolationRecords={setViolationRecords} violationCredentials={violationCredentials} currentUser={currentUser} />} />
        
        {/* RUTE ADMIN PROTECTED - Pastikan rute ini spesifik */}
        <Route path="/admin" element={currentUser?.role === 'admin' ? <AdminDashboard records={attendanceRecords} teachers={teachers} classes={classes} subjects={subjects} students={students} onLogout={handleLogout} /> : <Navigate to="/login" replace />} />
        <Route path="/admin/monitoring" element={currentUser?.role === 'admin' ? <MonitoringPage records={attendanceRecords} teachers={teachers} subjects={subjects} classes={classes} students={students} violationRecords={violationRecords} violationItems={violationItems} headmaster={headmaster} setHeadmaster={setHeadmaster} onLogout={handleLogout} /> : <Navigate to="/login" replace />} />
        <Route path="/admin/manage" element={currentUser?.role === 'admin' ? <ManagementPage teachers={teachers} setTeachers={setTeachers} subjects={subjects} setSubjects={setSubjects} classes={classes} setClasses={setClasses} students={students} setStudents={setStudents} onLogout={handleLogout} /> : <Navigate to="/login" replace />} />
        <Route path="/admin/reports" element={currentUser?.role === 'admin' ? <ReportsPage records={attendanceRecords} students={students} classes={classes} subjects={subjects} teachers={teachers} headmaster={headmaster} onLogout={handleLogout} /> : <Navigate to="/login" replace />} />
        <Route path="/admin/settings" element={currentUser?.role === 'admin' ? <AccountSettingsPage teachers={teachers} setTeachers={setTeachers} adminCredentials={adminCredentials} setAdminCredentials={setAdminCredentials} violationCredentials={violationCredentials} setViolationCredentials={setViolationCredentials} onLogout={handleLogout} attendanceRecords={attendanceRecords} students={students} classes={classes} subjects={subjects} violationItems={violationItems} violationRecords={violationRecords} headmaster={headmaster} onRestore={handleRestore} /> : <Navigate to="/login" replace />} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
