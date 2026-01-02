
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import AttendancePage from './pages/AttendancePage';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import ManagementPage from './pages/ManagementPage';
import ReportsPage from './pages/ReportsPage';
import { Teacher, Subject, ClassRoom, Student, AttendanceRecord } from './types';
import { INITIAL_TEACHERS, INITIAL_SUBJECTS, INITIAL_CLASSES, INITIAL_STUDENTS } from './constants';

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

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isAdminLoggedIn') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('teachers', JSON.stringify(teachers));
    localStorage.setItem('subjects', JSON.stringify(subjects));
    localStorage.setItem('classes', JSON.stringify(classes));
    localStorage.setItem('students', JSON.stringify(students));
    localStorage.setItem('attendance', JSON.stringify(attendanceRecords));
  }, [teachers, subjects, classes, students, attendanceRecords]);

  const addAttendance = (record: AttendanceRecord) => {
    setAttendanceRecords(prev => [...prev, record]);
  };

  const handleLogout = () => {
    localStorage.removeItem('isAdminLoggedIn');
    setIsLoggedIn(false);
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
              onSubmit={addAttendance}
            />
          } 
        />
        <Route 
          path="/login" 
          element={isLoggedIn ? <Navigate to="/admin" /> : <LoginPage onLogin={() => setIsLoggedIn(true)} />} 
        />
        <Route 
          path="/admin/*" 
          element={
            isLoggedIn ? (
              <Routes>
                <Route path="/" element={<AdminDashboard records={attendanceRecords} onLogout={handleLogout} teachers={teachers} classes={classes} />} />
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
                <Route path="/reports" element={<ReportsPage records={attendanceRecords} students={students} classes={classes} subjects={subjects} teachers={teachers} onLogout={handleLogout} />} />
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
