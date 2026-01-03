
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
import { Teacher, Subject, ClassRoom, Student, AttendanceRecord, User, Headmaster, ViolationItem, ViolationRecord } from './types';
import { INITIAL_TEACHERS, INITIAL_SUBJECTS, INITIAL_CLASSES, INITIAL_STUDENTS, INITIAL_VIOLATIONS } from './constants';

const App: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    const saved = localStorage.getItem('teachers');
    return saved ? JSON.parse(saved) : INITIAL_TEACHERS;
  });

  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const saved = localStorage.getItem('subjects');
    return saved ? JSON.parse(saved) : INITIAL_SUBJECTS;
  });

  const [classes, setClasses] = useState<ClassRoom[]>(() => {
    const saved = localStorage.getItem('classes');
    return saved ? JSON.parse(saved) : INITIAL_CLASSES;
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('students');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('attendance');
    return saved ? JSON.parse(saved) : [];
  });

  const [violationItems, setViolationItems] = useState<ViolationItem[]>(() => {
    const saved = localStorage.getItem('violationItems');
    return saved ? JSON.parse(saved) : INITIAL_VIOLATIONS;
  });

  const [violationRecords, setViolationRecords] = useState<ViolationRecord[]>(() => {
    const saved = localStorage.getItem('violationRecords');
    return saved ? JSON.parse(saved) : [];
  });

  const [headmaster, setHeadmaster] = useState<Headmaster>(() => {
    const saved = localStorage.getItem('headmaster');
    return saved ? JSON.parse(saved) : { name: "Moch. Noerhadi, S.Pd., M.Pd.", nip: "19681125 199103 1 010" };
  });

  const [adminCredentials, setAdminCredentials] = useState(() => {
    const saved = localStorage.getItem('adminCredentials');
    return saved ? JSON.parse(saved) : [{ id: '1', username: 'admin', password: '123' }];
  });

  const [violationCredentials, setViolationCredentials] = useState(() => {
    const saved = localStorage.getItem('violationCredentials');
    return saved ? JSON.parse(saved) : [{ id: '1', username: 'bk', password: '123' }];
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    localStorage.setItem('teachers', JSON.stringify(teachers));
    localStorage.setItem('subjects', JSON.stringify(subjects));
    localStorage.setItem('classes', JSON.stringify(classes));
    localStorage.setItem('students', JSON.stringify(students));
    localStorage.setItem('attendance', JSON.stringify(attendanceRecords));
    localStorage.setItem('violationItems', JSON.stringify(violationItems));
    localStorage.setItem('violationRecords', JSON.stringify(violationRecords));
    localStorage.setItem('headmaster', JSON.stringify(headmaster));
    localStorage.setItem('adminCredentials', JSON.stringify(adminCredentials));
    localStorage.setItem('violationCredentials', JSON.stringify(violationCredentials));
  }, [teachers, subjects, classes, students, attendanceRecords, violationItems, violationRecords, headmaster, adminCredentials, violationCredentials]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  const restoreData = (data: any) => {
    if (data.teachers) setTeachers(data.teachers);
    if (data.subjects) setSubjects(data.subjects);
    if (data.classes) setClasses(data.classes);
    if (data.students) setStudents(data.students);
    if (data.attendance) setAttendanceRecords(data.attendance);
    if (data.violationItems) setViolationItems(data.violationItems);
    if (data.violationRecords) setViolationRecords(data.violationRecords);
    if (data.headmaster) setHeadmaster(data.headmaster);
    if (data.adminCredentials) setAdminCredentials(data.adminCredentials);
    if (data.violationCredentials) setViolationCredentials(data.violationCredentials);
    alert('Data berhasil dipulihkan dari cadangan!');
  };

  const addAttendance = (record: AttendanceRecord) => {
    setAttendanceRecords(prev => [...prev, record]);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

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
              setViolationItems={setViolationItems}
              violationRecords={violationRecords}
              setViolationRecords={setViolationRecords}
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
                      teachers={teachers} setTeachers={setTeachers}
                      subjects={subjects} setSubjects={setSubjects}
                      classes={classes} setClasses={setClasses}
                      students={students} setStudents={setStudents}
                      onLogout={handleLogout}
                    />
                  } 
                />
                <Route path="/reports" element={<ReportsPage records={attendanceRecords} students={students} classes={classes} subjects={subjects} teachers={teachers} headmaster={headmaster} onLogout={handleLogout} />} />
                <Route path="/monitoring" element={<MonitoringPage records={attendanceRecords} teachers={teachers} classes={classes} subjects={subjects} students={students} violationRecords={violationRecords} violationItems={violationItems} headmaster={headmaster} setHeadmaster={setHeadmaster} onLogout={handleLogout} />} />
                <Route path="/settings" element={
                  <AccountSettingsPage 
                    teachers={teachers} setTeachers={setTeachers} 
                    adminCredentials={adminCredentials} setAdminCredentials={setAdminCredentials} 
                    violationCredentials={violationCredentials} setViolationCredentials={setViolationCredentials} 
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
