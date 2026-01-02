
import React, { useState, useRef } from 'react';
import AdminLayout from '../components/AdminLayout';
import { Teacher, Student, ClassRoom, Subject, AttendanceRecord, ViolationItem, ViolationRecord, Headmaster } from '../types';

interface AccountSettingsPageProps {
  teachers: Teacher[];
  setTeachers: (v: Teacher[]) => void;
  adminCredentials: any;
  setAdminCredentials: (v: any) => void;
  violationCredentials: any;
  setViolationCredentials: (v: any) => void;
  onLogout: () => void;
  // State tambahan untuk backup
  attendanceRecords: AttendanceRecord[];
  students: Student[];
  classes: ClassRoom[];
  subjects: Subject[];
  violationItems: ViolationItem[];
  violationRecords: ViolationRecord[];
  headmaster: Headmaster;
  onRestore: (data: any) => void;
}

const AccountSettingsPage: React.FC<AccountSettingsPageProps> = ({ 
  teachers, setTeachers, adminCredentials, setAdminCredentials, violationCredentials, setViolationCredentials, onLogout,
  attendanceRecords, students, classes, subjects, violationItems, violationRecords, headmaster, onRestore
}) => {
  const [adminForm, setAdminForm] = useState(adminCredentials);
  const [violationForm, setViolationForm] = useState(violationCredentials);
  const [teacherSearch, setTeacherSearch] = useState('');
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [teacherForm, setTeacherForm] = useState({ username: '', password: '' });
  const [successMsg, setSuccessMsg] = useState('');
  const restoreFileRef = useRef<HTMLInputElement>(null);

  const handleUpdateAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminCredentials(adminForm);
    setSuccessMsg('Kredensial Admin berhasil diperbarui!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleUpdateViolation = (e: React.FormEvent) => {
    e.preventDefault();
    setViolationCredentials(violationForm);
    setSuccessMsg('Kredensial Akses Kedisiplinan berhasil diperbarui!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleEditTeacher = (t: Teacher) => {
    setEditingTeacher(t);
    setTeacherForm({ 
      username: t.username || '', 
      password: t.password || '' 
    });
  };

  const handleUpdateTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeacher) return;

    const newTeachers = teachers.map(t => 
      t.id === editingTeacher.id 
        ? { ...t, username: teacherForm.username, password: teacherForm.password } 
        : t
    );
    setTeachers(newTeachers);
    setEditingTeacher(null);
    setSuccessMsg(`Akun guru ${editingTeacher.name} berhasil diperbarui!`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  // Logika Backup
  const handleBackup = () => {
    const backupData = {
      teachers,
      subjects,
      classes,
      students,
      attendance: attendanceRecords,
      violationItems,
      violationRecords,
      headmaster,
      adminCredentials,
      violationCredentials,
      backupDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    link.href = url;
    link.download = `Backup_E-Presensi_SMAN1Kwanyar_${dateStr}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Logika Restore
  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm('Peringatan: Mengunggah data cadangan akan menimpa data yang ada saat ini. Lanjutkan?')) {
      if (restoreFileRef.current) restoreFileRef.current.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        // Validasi struktur data sederhana
        if (data.students && data.teachers && data.attendance) {
          onRestore(data);
        } else {
          alert('Format file cadangan tidak valid!');
        }
      } catch (err) {
        alert('Gagal membaca file: Format JSON tidak valid.');
      }
    };
    reader.readAsText(file);
    if (restoreFileRef.current) restoreFileRef.current.value = '';
  };

  const filteredTeachers = teachers.filter(t => 
    t.name.toLowerCase().includes(teacherSearch.toLowerCase()) || 
    t.nip.includes(teacherSearch)
  );

  return (
    <AdminLayout onLogout={onLogout}>
      <div className="max-w-4xl mx-auto space-y-8 pb-10">
        {successMsg && (
          <div className="bg-emerald-100 border-l-4 border-emerald-500 text-emerald-800 p-4 rounded-xl shadow-sm flex items-center gap-3 animate-bounce">
            <i className="fas fa-check-circle text-emerald-500 text-xl"></i>
            <span className="font-bold">{successMsg}</span>
          </div>
        )}

        {/* Section: Admin Credentials */}
        <section className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 bg-slate-900 text-white flex items-center gap-3">
            <i className="fas fa-user-shield text-xl"></i>
            <h3 className="font-black uppercase tracking-tight">Akses Utama (Administrator)</h3>
          </div>
          <form onSubmit={handleUpdateAdmin} className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Username Admin</label>
                <input 
                  type="text" required 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                  value={adminForm.username}
                  onChange={e => setAdminForm({...adminForm, username: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Password Admin</label>
                <input 
                  type="password" required 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                  value={adminForm.password}
                  onChange={e => setAdminForm({...adminForm, password: e.target.value})}
                />
              </div>
            </div>
            <button type="submit" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-black text-xs hover:bg-blue-700 transition">UPDATE ADMIN</button>
          </form>
        </section>

        {/* Section: Violation Credentials */}
        <section className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 bg-amber-500 text-white flex items-center gap-3">
            <i className="fas fa-shield-alt text-xl"></i>
            <h3 className="font-black uppercase tracking-tight">Akses Khusus Kedisiplinan (BK/Kesiswaan)</h3>
          </div>
          <form onSubmit={handleUpdateViolation} className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Username Akses Disiplin</label>
                <input 
                  type="text" required 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 font-bold focus:ring-2 focus:ring-amber-500 outline-none"
                  value={violationForm.username}
                  onChange={e => setViolationForm({...violationForm, username: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Password Akses Disiplin</label>
                <input 
                  type="text" required 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 font-bold focus:ring-2 focus:ring-amber-500 outline-none"
                  value={violationForm.password}
                  onChange={e => setViolationForm({...violationForm, password: e.target.value})}
                />
              </div>
            </div>
            <button type="submit" className="bg-amber-600 text-white px-8 py-3 rounded-xl font-black text-xs hover:bg-amber-700 transition">UPDATE AKSES DISIPLIN</button>
          </form>
        </section>

        {/* Section: Maintenance / Backup Restore */}
        <section className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 bg-emerald-600 text-white flex items-center gap-3">
            <i className="fas fa-database text-xl"></i>
            <h3 className="font-black uppercase tracking-tight">Pemeliharaan Sistem & Database</h3>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center text-xl">
                    <i className="fas fa-download"></i>
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800 text-sm uppercase">Cadangkan Data (Backup)</h4>
                    <p className="text-xs text-slate-500">Unduh seluruh data aplikasi ke dalam satu file .json</p>
                  </div>
                </div>
                <button 
                  onClick={handleBackup}
                  className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black text-xs hover:bg-emerald-700 transition shadow-lg flex items-center justify-center gap-2"
                >
                  <i className="fas fa-file-export"></i> DOWNLOAD BACKUP SEKARANG
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-xl">
                    <i className="fas fa-upload"></i>
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800 text-sm uppercase">Pulihkan Data (Restore)</h4>
                    <p className="text-xs text-slate-500">Unggah file cadangan untuk mengembalikan data</p>
                  </div>
                </div>
                <label className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-xs hover:bg-blue-700 transition shadow-lg flex items-center justify-center gap-2 cursor-pointer text-center">
                  <i className="fas fa-file-import"></i> UPLOAD & PULIHKAN DATA
                  <input 
                    type="file" 
                    className="hidden" 
                    accept=".json" 
                    onChange={handleRestore}
                    ref={restoreFileRef}
                  />
                </label>
              </div>
            </div>
            <div className="mt-8 p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3">
              <i className="fas fa-info-circle text-amber-500 mt-1"></i>
              <p className="text-[10px] text-amber-800 font-medium leading-relaxed">
                <span className="font-black uppercase">Catatan:</span> Sangat disarankan untuk melakukan backup secara rutin (setiap akhir bulan) guna mencegah kehilangan data. File backup berisi data sensitif, simpanlah di tempat yang aman.
              </p>
            </div>
          </div>
        </section>

        {/* Section: Teacher Credentials */}
        <section className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <i className="fas fa-users-cog text-blue-600 text-xl"></i>
              <h3 className="font-black text-slate-800 uppercase tracking-tight">Kelola Akun Guru</h3>
            </div>
            <div className="relative w-full sm:w-64">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <i className="fas fa-search text-xs"></i>
              </span>
              <input 
                type="text" 
                placeholder="Cari guru..."
                className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={teacherSearch}
                onChange={e => setTeacherSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                  <th className="px-6 py-4">Nama Guru</th>
                  <th className="px-6 py-4">Username</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredTeachers.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800 text-sm uppercase">{t.name}</p>
                      <p className="text-[10px] text-slate-400">NIP: {t.nip}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">{t.username || '-'}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleEditTeacher(t)}
                        className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-[10px] font-black hover:bg-blue-600 hover:text-white transition"
                      >
                        EDIT AKSES
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Edit Teacher Modal */}
      {editingTeacher && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-white/20">
            <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
              <h3 className="text-lg font-black uppercase tracking-tight">Edit Akun Guru</h3>
              <button onClick={() => setEditingTeacher(null)}>
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            
            <form onSubmit={handleUpdateTeacher} className="p-8 space-y-6">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="font-black text-slate-800 uppercase">{editingTeacher.name}</p>
                <p className="text-xs text-slate-500">NIP: {editingTeacher.nip}</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Username Baru</label>
                  <input 
                    type="text" required 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                    value={teacherForm.username}
                    onChange={e => setTeacherForm({...teacherForm, username: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Password Baru</label>
                  <input 
                    type="text" required 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                    value={teacherForm.password}
                    onChange={e => setTeacherForm({...teacherForm, password: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setEditingTeacher(null)} className="flex-1 px-4 py-3 border border-slate-200 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition">Batal</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-black hover:bg-blue-700 transition">UPDATE AKUN</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AccountSettingsPage;
