
import React, { useState, useEffect } from 'react';
import { Teacher, Subject, ClassRoom, Student, AttendanceStatus, AttendanceRecord } from '../types';
import { DAYS_ID, STATUS_COLORS, STATUS_ICONS, GRADES } from '../constants';
import { Link } from 'react-router-dom';

interface AttendancePageProps {
  teachers: Teacher[];
  subjects: Subject[];
  classes: ClassRoom[];
  students: Student[];
  onSubmit: (record: AttendanceRecord) => void;
}

const AttendancePage: React.FC<AttendancePageProps> = ({ teachers, subjects, classes, students, onSubmit }) => {
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('1');
  const [journal, setJournal] = useState('');
  const [studentStatus, setStudentStatus] = useState<Record<string, AttendanceStatus>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const now = new Date();
  const dateStr = now.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
  const dayName = DAYS_ID[now.getDay()];

  // Logic for filtered classes and students
  const filteredClasses = classes.filter(c => c.grade === selectedGrade);
  const filteredStudents = students.filter(s => s.classId === selectedClass);

  useEffect(() => {
    // Reset class when grade changes
    setSelectedClass('');
  }, [selectedGrade]);

  useEffect(() => {
    // Reset status when class changes
    const initialStatus: Record<string, AttendanceStatus> = {};
    filteredStudents.forEach(s => {
      initialStatus[s.id] = AttendanceStatus.HADIR;
    });
    setStudentStatus(initialStatus);
  }, [selectedClass]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setStudentStatus(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGrade || !selectedClass || !selectedTeacher || !selectedSubject || !journal.trim()) {
      alert('Mohon lengkapi semua data sesi dan jurnal pembelajaran!');
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
      students: filteredStudents.map(s => ({
        studentId: s.id,
        status: studentStatus[s.id] || AttendanceStatus.HADIR
      }))
    };

    onSubmit(record);
    setIsSubmitted(true);
    window.scrollTo(0, 0);
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
              setSelectedClass('');
              setSelectedGrade('');
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

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
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
          <Link to="/login" className="text-blue-100 hover:text-white transition bg-white/10 px-3 py-1.5 rounded-lg text-sm font-medium">
            <i className="fas fa-user-shield mr-2"></i>Admin
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-5xl">
        {/* Info Box */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-2xl">
              <i className="fas fa-calendar-alt"></i>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sesi Presensi</p>
              <h3 className="text-xl font-bold text-slate-800">{dayName}, {dateStr}</h3>
            </div>
          </div>
          <div className="hidden md:block h-10 w-[1px] bg-slate-200"></div>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center text-2xl">
              <i className="fas fa-clock"></i>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Status Sistem</p>
              <h3 className="text-xl font-bold text-emerald-600">Online <span className="w-2 h-2 inline-block bg-emerald-500 rounded-full animate-pulse mb-1"></span></h3>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Step 1: Session Detail */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <h2 className="font-bold text-slate-700 flex items-center gap-2">
                <i className="fas fa-info-circle text-blue-500"></i>
                Detail Sesi & Mata Pelajaran
              </h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Jenjang</label>
                <div className="grid grid-cols-3 gap-2">
                  {GRADES.map(grade => (
                    <button
                      key={grade}
                      type="button"
                      onClick={() => setSelectedGrade(grade)}
                      className={`py-2.5 rounded-xl font-bold border transition-all ${
                        selectedGrade === grade 
                          ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100' 
                          : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300'
                      }`}
                    >
                      {grade}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Pilih Kelas</label>
                <select 
                  required
                  disabled={!selectedGrade}
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-50 disabled:text-slate-400"
                  value={selectedClass}
                  onChange={e => setSelectedClass(e.target.value)}
                >
                  <option value="">-- Pilih Kelas --</option>
                  {filteredClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Jam Ke</label>
                <select 
                  required
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={selectedPeriod}
                  onChange={e => setSelectedPeriod(e.target.value)}
                >
                  {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n.toString()}>{n}</option>)}
                </select>
              </div>

              <div className="space-y-2 lg:col-span-2">
                <label className="text-sm font-bold text-slate-700">Guru Mata Pelajaran</label>
                <select 
                  required
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={selectedTeacher}
                  onChange={e => setSelectedTeacher(e.target.value)}
                >
                  <option value="">-- Pilih Guru --</option>
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Mata Pelajaran</label>
                <select 
                  required
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={selectedSubject}
                  onChange={e => setSelectedSubject(e.target.value)}
                >
                  <option value="">-- Pilih Mapel --</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>
          </section>

          {/* Step 2: Journal */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <h2 className="font-bold text-slate-700 flex items-center gap-2">
                <i className="fas fa-book-open text-amber-500"></i>
                Jurnal Pembelajaran
              </h2>
            </div>
            <div className="p-6">
              <textarea
                required
                placeholder="Tuliskan materi yang diajarkan, hambatan, atau catatan penting selama KBM berlangsung..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 focus:ring-2 focus:ring-amber-500 outline-none min-h-[120px] transition-all resize-none"
                value={journal}
                onChange={e => setJournal(e.target.value)}
              ></textarea>
            </div>
          </section>

          {/* Step 3: Student Attendance */}
          {selectedClass && (
            <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                <h2 className="font-bold text-slate-700 flex items-center gap-2">
                  <i className="fas fa-users text-emerald-500"></i>
                  Daftar Kehadiran Siswa
                </h2>
                <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">
                  {filteredStudents.length} Peserta Didik
                </div>
              </div>
              
              <div className="divide-y divide-slate-100">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student, idx) => (
                    <div key={student.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-sm font-bold text-slate-500 border border-slate-200">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{student.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">NIS: {student.nis}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {Object.values(AttendanceStatus).map(status => (
                          <button
                            key={status}
                            type="button"
                            onClick={() => handleStatusChange(student.id, status)}
                            className={`px-2.5 py-2 rounded-xl text-[10px] sm:text-xs font-bold transition-all border ${
                              studentStatus[student.id] === status 
                                ? STATUS_COLORS[status] + ' shadow-sm' 
                                : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'
                            }`}
                          >
                            <span className="sm:mr-1">{STATUS_ICONS[status]}</span>
                            <span className="hidden xs:inline">{status}</span>
                            <span className="xs:hidden">{status[0]}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-16 text-center text-slate-400">
                    <i className="fas fa-user-clock text-5xl mb-4 opacity-20"></i>
                    <p className="font-medium">Memuat daftar siswa...</p>
                  </div>
                )}
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-200">
                <button 
                  type="submit"
                  disabled={filteredStudents.length === 0}
                  className="w-full bg-blue-800 text-white py-4 rounded-2xl font-bold hover:bg-blue-900 transition-all shadow-xl shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed text-lg flex items-center justify-center gap-3"
                >
                  <i className="fas fa-paper-plane"></i>
                  Simpan & Kirim Laporan Presensi
                </button>
              </div>
            </section>
          )}
        </form>
      </main>
    </div>
  );
};

export default AttendancePage;
