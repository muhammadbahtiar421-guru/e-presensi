
import React, { useState, useEffect } from 'react';
import { Teacher, Subject, ClassRoom, Student, AttendanceStatus, AttendanceRecord, User } from '../types';
import { DAYS_ID, STATUS_COLORS, STATUS_ICONS, GRADES } from '../constants';
import { Link } from 'react-router-dom';

interface AttendancePageProps {
  teachers: Teacher[];
  subjects: Subject[];
  classes: ClassRoom[];
  students: Student[];
  records: AttendanceRecord[];
  onSubmit: (record: AttendanceRecord) => void;
  currentUser: User | null;
  onLogout: () => void;
}

const AttendancePage: React.FC<AttendancePageProps> = ({ teachers, subjects, classes, students, records, onSubmit, currentUser, onLogout }) => {
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('1');
  const [journal, setJournal] = useState('');
  const [studentStatus, setStudentStatus] = useState<Record<string, AttendanceStatus>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const dayName = DAYS_ID[currentTime.getDay()];
  const dateStr = currentTime.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const timeStr = currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  useEffect(() => {
    if (currentUser?.role === 'teacher' && currentUser.teacherId) {
      const t = teachers.find(item => item.id === currentUser.teacherId);
      if (t) {
        setSelectedTeacher(t.id);
        if (t.subjectId) setSelectedSubject(t.subjectId);
        if (t.classId) {
          const c = classes.find(item => item.id === t.classId);
          if (c) {
            setSelectedGrade(c.grade);
            setSelectedClass(c.id);
          }
        }
      }
    }
  }, [currentUser, teachers, classes]);

  const filteredClasses = classes.filter(c => c.grade === selectedGrade);
  const filteredStudents = students.filter(s => s.classId === selectedClass);

  useEffect(() => {
    const initialStatus: Record<string, AttendanceStatus> = {};
    filteredStudents.forEach(s => {
      initialStatus[s.id] = AttendanceStatus.HADIR;
    });
    setStudentStatus(initialStatus);
  }, [selectedClass]);

  // Duplication Check
  const checkDuplicate = () => {
    const today = currentTime.toISOString().split('T')[0];
    return records.find(r => 
      r.date === today && 
      r.teacherId === selectedTeacher && 
      r.classId === selectedClass && 
      r.subjectId === selectedSubject
    );
  };

  const duplicateRecord = checkDuplicate();

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setStudentStatus(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGrade || !selectedClass || !selectedTeacher || !selectedSubject || !journal.trim()) {
      alert('Mohon lengkapi semua data sesi (Guru, Mapel, Kelas) dan jurnal pembelajaran!');
      return;
    }

    if (duplicateRecord) {
      alert('Gagal! Anda sudah melakukan presensi untuk kelas dan mata pelajaran ini hari ini.');
      return;
    }

    const record: AttendanceRecord = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString().split('T')[0],
      day: dayName,
      period: selectedPeriod,
      teacherId: selectedTeacher,
      subjectId: selectedSubject,
      classId: selectedClass,
      grade: selectedGrade,
      journal: journal,
      createdAt: currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      students: filteredStudents.map(s => ({
        studentId: s.id,
        status: studentStatus[s.id] || AttendanceStatus.HADIR
      }))
    };

    onSubmit(record);
    setIsSubmitted(true);
    window.scrollTo(0, 0);
  };

  const getActiveStatusClass = (status: AttendanceStatus) => {
    switch(status) {
      case AttendanceStatus.HADIR: return 'bg-emerald-600 text-white border-emerald-600';
      case AttendanceStatus.IZIN: return 'bg-amber-500 text-white border-amber-500';
      case AttendanceStatus.SAKIT: return 'bg-blue-600 text-white border-blue-600';
      case AttendanceStatus.DISPENSASI: return 'bg-purple-600 text-white border-purple-600';
      case AttendanceStatus.ALPA: return 'bg-rose-600 text-white border-rose-600';
      default: return '';
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-emerald-50">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border-t-8 border-emerald-500">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
            <i className="fas fa-check"></i>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Presensi Berhasil!</h2>
          <p className="text-slate-600 mb-8">Data kehadiran untuk kelas {classes.find(c => c.id === selectedClass)?.name} telah tersimpan di sistem.</p>
          <button 
            onClick={() => {
              setIsSubmitted(false);
              if (currentUser?.role !== 'teacher') {
                setSelectedClass('');
                setSelectedGrade('');
                setSelectedTeacher('');
                setSelectedSubject('');
              }
              setJournal('');
            }}
            className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition shadow-lg shadow-emerald-200"
          >
            Selesai & Kembali
          </button>
        </div>
      </div>
    );
  }

  const currentTeacher = teachers.find(t => t.id === selectedTeacher);
  const currentSubject = subjects.find(s => s.id === selectedSubject);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="bg-blue-800 text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
              <i className="fas fa-school text-xl"></i>
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">E-Presensi</h1>
              <p className="text-xs text-blue-100">SMAN 1 Kwanyar</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/violations" className="flex items-center gap-2 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-bold transition shadow-sm">
              <i className="fas fa-exclamation-triangle"></i>
              <span>Pelanggaran</span>
            </Link>
            {currentUser ? (
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold hidden sm:inline">{currentUser.role === 'admin' ? 'ADMIN SISTEM' : `GURU: ${currentTeacher?.name}`}</span>
                {currentUser.role === 'admin' && (
                  <Link to="/admin" className="text-blue-100 hover:text-white transition bg-white/10 px-3 py-1.5 rounded-lg text-sm font-medium">
                    Dashboard
                  </Link>
                )}
                <button onClick={onLogout} className="text-rose-200 hover:text-rose-100 transition text-sm font-bold bg-rose-900/30 px-3 py-1.5 rounded-lg">
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/login" className="text-blue-100 hover:text-white transition bg-white/10 px-3 py-1.5 rounded-lg text-sm font-medium">
                <i className="fas fa-sign-in-alt mr-2"></i>Login
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-5xl">
        <div className="mb-6 bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex justify-between items-center animate-fadeIn">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-xl">
              <i className="far fa-calendar-alt"></i>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">Hari & Tanggal Sistem</p>
              <p className="font-bold text-slate-800 uppercase text-sm">{dayName}, {dateStr}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">Waktu Sekarang</p>
            <p className="font-black text-blue-700 text-xl tracking-tighter">{timeStr}</p>
          </div>
        </div>

        {duplicateRecord && (
          <div className="mb-6 bg-rose-50 border-l-4 border-rose-500 p-4 rounded-xl flex items-start gap-3 animate-shake">
            <i className="fas fa-exclamation-circle text-rose-500 text-xl mt-1"></i>
            <div>
              <p className="font-black text-rose-800 text-sm uppercase">Peringatan Duplikasi Presensi</p>
              <p className="text-xs text-rose-600 font-medium mt-1">
                Sistem mendeteksi Anda telah melakukan presensi hari ini untuk mata pelajaran <span className="font-bold">{currentSubject?.name}</span> di kelas <span className="font-bold">{classes.find(c => c.id === selectedClass)?.name}</span>.
                Mohon tidak mengulang presensi yang sama.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Konfigurasi Sesi & Jurnal */}
          <section className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                <i className="fas fa-cog text-blue-600"></i> Konfigurasi Pembelajaran
              </h3>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Jenjang Kelas</label>
                  <div className="grid grid-cols-3 gap-2">
                    {GRADES.map(grade => (
                      <button
                        key={grade}
                        type="button"
                        disabled={currentUser?.role === 'teacher'}
                        onClick={() => setSelectedGrade(grade)}
                        className={`py-2.5 rounded-xl font-bold border transition-all ${
                          selectedGrade === grade 
                            ? 'bg-blue-600 text-white border-blue-600 shadow-lg' 
                            : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300 disabled:opacity-50'
                        }`}
                      >
                        {grade}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Pilih Kelas</label>
                  <select 
                    required
                    disabled={!selectedGrade || currentUser?.role === 'teacher'}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-50 disabled:text-slate-400 font-bold"
                    value={selectedClass}
                    onChange={e => setSelectedClass(e.target.value)}
                  >
                    <option value="">-- Pilih Kelas --</option>
                    {filteredClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Jam Ke</label>
                  <select 
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                    value={selectedPeriod}
                    onChange={e => setSelectedPeriod(e.target.value)}
                  >
                    {[1,2,3,4,5,6,7,8,9,10,11,12].map(n => <option key={n} value={n.toString()}>{n}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Guru Pengampu</label>
                  <select 
                    required
                    disabled={currentUser?.role === 'teacher'}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-blue-700 disabled:opacity-75"
                    value={selectedTeacher}
                    onChange={e => setSelectedTeacher(e.target.value)}
                  >
                    <option value="">-- Pilih Guru --</option>
                    {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>

                <div className="space-y-2 lg:col-span-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Mata Pelajaran</label>
                  <select 
                    required
                    disabled={currentUser?.role === 'teacher'}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-blue-700 disabled:opacity-75"
                    value={selectedSubject}
                    onChange={e => setSelectedSubject(e.target.value)}
                  >
                    <option value="">-- Pilih Mata Pelajaran --</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t border-slate-100">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <i className="fas fa-pen-fancy text-amber-500"></i> Jurnal / Materi Pembelajaran
                </label>
                <textarea
                  required
                  placeholder="Tuliskan ringkasan materi atau kegiatan pembelajaran yang dilakukan hari ini..."
                  className="w-full bg-amber-50/30 border border-amber-100 rounded-2xl p-4 focus:ring-2 focus:ring-amber-400 outline-none min-h-[120px] transition-all resize-none font-medium text-slate-700"
                  value={journal}
                  onChange={e => setJournal(e.target.value)}
                ></textarea>
              </div>
            </div>
          </section>

          {/* Info Banner Konfirmasi Sesi */}
          {selectedClass && (
            <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white rounded-2xl p-5 shadow-xl flex flex-col md:flex-row justify-between items-center gap-6 animate-fadeIn">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-xl shadow-inner">
                  <i className="fas fa-chalkboard-teacher"></i>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase opacity-70 tracking-widest">Guru Pengampu</p>
                  <p className="font-bold text-lg leading-tight">{currentTeacher?.name || 'Belum dipilih'}</p>
                </div>
              </div>
              <div className="h-10 w-px bg-white/10 hidden md:block"></div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-xl shadow-inner">
                  <i className="fas fa-book"></i>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase opacity-70 tracking-widest">Mata Pelajaran</p>
                  <p className="font-bold text-lg leading-tight">{currentSubject?.name || 'Belum dipilih'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Section 2: Daftar Presensi Siswa */}
          {selectedClass && (
            <section className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-5 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                <h2 className="font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                  <i className="fas fa-users text-emerald-500"></i>
                  Presensi Peserta Didik
                </h2>
                <div className="bg-white border border-emerald-100 text-emerald-600 px-4 py-1.5 rounded-full text-xs font-black shadow-sm">
                  {filteredStudents.length} SISWA
                </div>
              </div>
              
              <div className="divide-y divide-slate-100">
                {filteredStudents.map((student, idx) => (
                  <div key={student.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-sm font-black text-slate-400 border border-slate-200 flex-shrink-0">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-black text-slate-800 text-lg uppercase tracking-tight">
                          {student.name} 
                          <span className={`ml-2 text-[9px] px-2 py-0.5 rounded-full ${student.gender === 'L' ? 'bg-blue-100 text-blue-700' : 'bg-rose-100 text-rose-700'}`}>
                            {student.gender === 'L' ? 'LK' : 'PR'}
                          </span>
                        </p>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">NIS: {student.nis}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-5 gap-1.5 sm:flex sm:flex-wrap sm:gap-3">
                      {Object.values(AttendanceStatus).map(status => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => handleStatusChange(student.id, status)}
                          className={`flex flex-col items-center justify-center p-2 sm:px-4 sm:py-3 rounded-2xl transition-all border-2 ${
                            studentStatus[student.id] === status 
                              ? getActiveStatusClass(status) + ' shadow-lg scale-105' 
                              : 'bg-white text-slate-300 border-slate-100 hover:border-slate-200 hover:text-slate-500'
                          }`}
                        >
                          <span className="text-xl sm:text-2xl mb-1">{STATUS_ICONS[status]}</span>
                          <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-tighter leading-none">
                            {status === AttendanceStatus.DISPENSASI ? 'Disp' : status}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-8 bg-slate-50 border-t border-slate-200">
                <button 
                  type="submit"
                  disabled={filteredStudents.length === 0 || !!duplicateRecord}
                  className="w-full bg-blue-800 text-white py-6 rounded-2xl font-black hover:bg-blue-900 transition-all shadow-xl shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed text-xl flex items-center justify-center gap-4 uppercase tracking-widest"
                >
                  <i className="fas fa-check-double text-2xl"></i>
                  {duplicateRecord ? 'PRESENSI SUDAH DILAKUKAN' : 'SIMPAN PRESENSI SEKARANG'}
                </button>
                <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest mt-4">Pastikan data telah benar sebelum melakukan penyimpanan</p>
              </div>
            </section>
          )}
        </form>
      </main>
    </div>
  );
};

export default AttendancePage;
