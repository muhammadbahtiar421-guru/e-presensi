
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

  // Load Initial Data from Supabase
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [
          { data: t }, { data: sub }, { data: cl }, { data: st }, 
          { data: attRec }, { data: viItem }, { data: viRec }, { data: cfg }
        ] = await Promise.all([
          supabase.from('teachers').select('*'),
          supabase.from('subjects').select('*'),
          supabase.from('classes').select('*'),
          supabase.from('students').select('*'),
          supabase.from('attendance_records').select('*, attendance_details(*)'),
          supabase.from('violation_items').select('*'),
          supabase.from('violation_records').select('*'),
          supabase.from('config').select('*')
        ]);

        if (t && t.length > 0) setTeachers(t); else setTeachers(INITIAL_TEACHERS);
        if (sub && sub.length > 0) setSubjects(sub); else setSubjects(INITIAL_SUBJECTS);
        if (cl && cl.length > 0) setClasses(cl); else setClasses(INITIAL_CLASSES);
        if (st && st.length > 0) setStudents(st); else setStudents(INITIAL_STUDENTS);
        if (viItem && viItem.length > 0) setViolationItems(viItem); else setViolationItems(INITIAL_VIOLATIONS);
        
        if (attRec) {
          const formattedAtt = attRec.map((r: any) => ({
            ...r,
            students: r.attendance_details.map((d: any) => ({
              studentId: d.studentId,
              status: d.status
            }))
          }));
          setAttendanceRecords(formattedAtt);
        }

        if (viRec) setViolationRecords(viRec);

        if (cfg) {
          const hm = cfg.find(c => c.key === 'headmaster')?.value;
          const adm = cfg.find(c => c.key === 'adminCredentials')?.value;
          const vio = cfg.find(c => c.key === 'violationCredentials')?.value;
          if (hm) setHeadmaster(hm);
          if (adm) setAdminCredentials(adm);
          if (vio) setViolationCredentials(vio);
        }
      } catch (err) {
        console.error("Supabase Load Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Save current user to local storage for persistent session
  useEffect(() => {
    if (currentUser) localStorage.setItem('currentUser', JSON.stringify(currentUser));
    else localStorage.removeItem('currentUser');
  }, [currentUser]);

  // Data Save Wrappers
  const updateTeachers = async (data: Teacher[]) => {
    setTeachers(data);
    await supabase.from('teachers').delete().neq('id', '0'); // Clear and re-insert for simplicity or map per item
    await supabase.from('teachers').insert(data);
  };

  const updateSubjects = async (data: Subject[]) => {
    setSubjects(data);
    await supabase.from('subjects').delete().neq('id', '0');
    await supabase.from('subjects').insert(data);
  };

  const updateClasses = async (data: ClassRoom[]) => {
    setClasses(data);
    await supabase.from('classes').delete().neq('id', '0');
    await supabase.from('classes').insert(data);
  };

  const updateStudents = async (data: Student[]) => {
    setStudents(data);
    await supabase.from('students').delete().neq('id', '0');
    await supabase.from('students').insert(data);
  };

  const addAttendance = async (record: AttendanceRecord) => {
    setAttendanceRecords(prev => [...prev, record]);
    
    // Save record header
    const { students: studentDetails, ...header } = record;
    await supabase.from('attendance_records').insert([header]);
    
    // Save details
    const details = studentDetails.map(sd => ({
      recordId: record.id,
      studentId: sd.studentId,
      status: sd.status
    }));
    await supabase.from('attendance_details').insert(details);
  };

  const updateViolationItems = async (data: ViolationItem[]) => {
    setViolationItems(data);
    await supabase.from('violation_items').delete().neq('id', '0');
    await supabase.from('violation_items').insert(data);
  };

  const updateViolationRecords = async (data: ViolationRecord[]) => {
    setViolationRecords(data);
    await supabase.from('violation_records').delete().neq('id', '0');
    await supabase.from('violation_records').insert(data);
  };

  const updateHeadmaster = async (data: Headmaster) => {
    setHeadmaster(data);
    await supabase.from('config').upsert({ key: 'headmaster', value: data });
  };

  const updateAdminCredentials = async (data: any[]) => {
    setAdminCredentials(data);
    await supabase.from('config').upsert({ key: 'adminCredentials', value: data });
  };

  const updateViolationCredentials = async (data: any[]) => {
    setViolationCredentials(data);
    await supabase.from('config').upsert({ key: 'violationCredentials', value: data });
  };

  const restoreData = async (data: any) => {
    setLoading(true);
    try {
      // Logic for bulk restore
      if (data.teachers) await updateTeachers(data.teachers);
      if (data.students) await updateStudents(data.students);
      if (data.classes) await updateClasses(data.classes);
      if (data.subjects) await updateSubjects(data.subjects);
      if (data.violationItems) await updateViolationItems(data.violationItems);
      if (data.violationRecords) await updateViolationRecords(data.violationRecords);
      if (data.headmaster) await updateHeadmaster(data.headmaster);
      if (data.adminCredentials) await updateAdminCredentials(data.adminCredentials);
      if (data.violationCredentials) await updateViolationCredentials(data.violationCredentials);
      
      alert('Restorasi Database Supabase Berhasil!');
      window.location.reload();
    } catch (err) {
      alert('Gagal restorasi data ke database.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => setCurrentUser(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-4">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-black uppercase tracking-widest text-xs">Menghubungkan ke Supabase...</p>
      </div>
    );
  }

  return (
    <HashRouter>
      <Routes>
        <Route 
          path="/" 
          element={
            <AttendancePage 
              teachers={teachers} 
              subjects={subjects} 
              classes={classes} 
              students={students}
              records={attendanceRecords}
              onSubmit={addAttendance}
              currentUser={currentUser}
              onLogout={handleLogout}
            />
          } 
        />
        <Route 
          path="/login" 
          element={currentUser ? <Navigate to={currentUser.role === 'admin' ? "/admin" : "/"} /> : <LoginPage teachers={teachers} adminCredentials={adminCredentials} onLogin={(user) => setCurrentUser(user)} />} 
        />
        <Route 
          path="/violations" 
          element={
            <ViolationPage 
              students={students}
              classes={classes}
              teachers={teachers}
              violationItems={violationItems}
              setViolationItems={updateViolationItems}
              violationRecords={violationRecords}
              setViolationRecords={updateViolationRecords}
              violationCredentials={violationCredentials}
              currentUser={currentUser}
            />
          } 
        />
        <Route 
          path="/admin/*" 
          element={
            currentUser?.role === 'admin' ? (
              <Routes>
                <Route path="/" element={<AdminDashboard records={attendanceRecords} onLogout={handleLogout} teachers={teachers} classes={classes} subjects={subjects} students={students} />} />
                <Route 
                  path="/manage" 
                  element={
                    <ManagementPage 
                      teachers={teachers} setTeachers={updateTeachers}
                      subjects={subjects} setSubjects={updateSubjects}
                      classes={classes} setClasses={updateClasses}
                      students={students} setStudents={updateStudents}
                      onLogout={handleLogout}
                    />
                  } 
                />
                <Route path="/reports" element={<ReportsPage records={attendanceRecords} students={students} classes={classes} subjects={subjects} teachers={teachers} headmaster={headmaster} onLogout={handleLogout} />} />
                <Route path="/monitoring" element={<MonitoringPage records={attendanceRecords} teachers={teachers} classes={classes} subjects={subjects} students={students} violationRecords={violationRecords} violationItems={violationItems} headmaster={headmaster} setHeadmaster={updateHeadmaster} onLogout={handleLogout} />} />
                <Route path="/settings" element={
                  <AccountSettingsPage 
                    teachers={teachers} setTeachers={updateTeachers} 
                    adminCredentials={adminCredentials} setAdminCredentials={updateAdminCredentials} 
                    violationCredentials={violationCredentials} setViolationCredentials={updateViolationCredentials} 
                    onLogout={handleLogout}
                    attendanceRecords={attendanceRecords}
                    students={students}
                    classes={classes}
                    subjects={subjects}
                    violationItems={violationItems}
                    violationRecords={violationRecords}
                    headmaster={headmaster}
                    onRestore={restoreData}
                  />
                } />
              </Routes>
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
      </Routes>
    </HashRouter>
  );
};

export default App;
