
import React, { useState, useEffect } from 'react';
import { Teacher, Subject, ClassRoom, Student, AttendanceStatus, AttendanceRecord } from '../types';
import { DAYS_ID, STATUS_COLORS, STATUS_ICONS } from '../constants';
import { Link } from 'react-router-dom';

interface AttendancePageProps {
  teachers: Teacher[];
  subjects: Subject[];
  classes: ClassRoom[];
  students: Student[];
  onSubmit: (record: AttendanceRecord) => void;
}

const AttendancePage: React.FC<AttendancePageProps> = ({ teachers, subjects, classes, students, onSubmit }) => {
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('1');
  const [studentStatus, setStudentStatus] = useState<Record<string, AttendanceStatus>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const now = new Date();
  const dateStr = now.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
  const dayName = DAYS_ID[now.getDay()];

  const filteredStudents = students.filter(s => s.classId === selectedClass);

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
    if (!selectedTeacher || !selectedSubject || !selectedClass) {
      alert('Mohon lengkapi data sesi!');
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
            }}
            className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition shadow-lg shadow-emerald-200"
          >
            Lakukan Presensi Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
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
          <Link to="/login" className="text-blue-100 hover:text-white transition">
            <i className="fas fa-user-shield"></i> <span className="hidden sm:inline ml-1">Admin</span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Date/Info Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Hari & Tanggal</p>
              <h3 className="text-xl font-bold text-slate-800">{dayName}, {dateStr}</h3>
            </div>
            <div className="flex gap-4">
              <div className="bg-blue-50 px-4 py-2 rounded-xl border border-blue-100">
                <span className="text-xs text-blue-600 block">Status</span>
                <span className="font-bold text-blue-800 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  Sesi Aktif
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Selection Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700 ml-1">Pilih Guru</label>
              <select 
                required
                className="w-full bg-white border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                value={selectedTeacher}
                onChange={e => setSelectedTeacher(e.target.value)}
              >
                <option value="">-- Pilih Guru --</option>
                {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700 ml-1">Mata Pelajaran</label>
              <select 
                required
                className="w-full bg-white border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                value={selectedSubject}
                onChange={e => setSelectedSubject(e.target.value)}
              >
                <option value="">-- Pilih Mapel --</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700 ml-1">Pilih Kelas</label>
              <select 
                required
                className="w-full bg-white border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                value={selectedClass}
                onChange={e => setSelectedClass(e.target.value)}
              >
                <option value="">-- Pilih Kelas --</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700 ml-1">Jam Ke</label>
              <select 
                required
                className="w-full bg-white border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                value={selectedPeriod}
                onChange={e => setSelectedPeriod(e.target.value)}
              >
                {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n.toString()}>{n}</option>)}
              </select>
            </div>
          </div>

          {/* Student List */}
          {selectedClass && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                <h4 className="font-bold text-slate-700">Daftar Siswa {classes.find(c => c.id === selectedClass)?.name}</h4>
                <span className="text-xs font-bold px-2 py-1 bg-blue-100 text-blue-700 rounded-lg">{filteredStudents.length} Siswa</span>
              </div>
              
              <div className="divide-y divide-slate-100">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student, idx) => (
                    <div key={student.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-xs font-bold text-slate-500">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 leading-tight">{student.name}</p>
                          <p className="text-xs text-slate-500">NIS: {student.nis}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {Object.values(AttendanceStatus).map(status => (
                          <button
                            key={status}
                            type="button"
                            onClick={() => handleStatusChange(student.id, status)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                              studentStatus[student.id] === status 
                                ? STATUS_COLORS[status] 
                                : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <span className="mr-1">{STATUS_ICONS[status]}</span>
                            {status}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-10 text-center text-slate-400">
                    <i className="fas fa-users-slash text-4xl mb-3 opacity-20"></i>
                    <p>Tidak ada data siswa untuk kelas ini.</p>
                  </div>
                )}
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-200">
                <button 
                  type="submit"
                  disabled={filteredStudents.length === 0}
                  className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-100 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                >
                  <i className="fas fa-save mr-2"></i>
                  Simpan & Kirim Presensi
                </button>
              </div>
            </div>
          )}
        </form>
      </main>
    </div>
  );
};

export default AttendancePage;
