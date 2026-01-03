
import React, { useState, useRef } from 'react';
import AdminLayout from '../components/AdminLayout';
import { Teacher, Student, ClassRoom, Subject, AttendanceRecord, ViolationItem, ViolationRecord, Headmaster } from '../types';

interface AccountSettingsPageProps {
  teachers: Teacher[];
  setTeachers: (v: Teacher[]) => void;
  adminCredentials: any[];
  setAdminCredentials: (v: any[]) => void;
  violationCredentials: any[];
  setViolationCredentials: (v: any[]) => void;
  onLogout: () => void;
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
  const [successMsg, setSuccessMsg] = useState('');
  const restoreFileRef = useRef<HTMLInputElement>(null);

  // States for Modals
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'admin' | 'violation' | 'teacher'>('admin');
  const [editingAccount, setEditingAccount] = useState<any>(null);
  const [accountForm, setAccountForm] = useState({ username: '', password: '' });
  const [teacherSearch, setTeacherSearch] = useState('');

  const openAccountModal = (type: 'admin' | 'violation' | 'teacher', account: any = null) => {
    setModalType(type);
    setEditingAccount(account);
    setAccountForm(account ? { username: account.username || '', password: account.password || '' } : { username: '', password: '' });
    setIsAccountModalOpen(true);
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (modalType === 'admin') {
      if (editingAccount) {
        setAdminCredentials(adminCredentials.map(a => a.id === editingAccount.id ? { ...a, ...accountForm } : a));
      } else {
        setAdminCredentials([...adminCredentials, { id: Math.random().toString(36).substr(2, 9), ...accountForm }]);
      }
      setSuccessMsg('Akun Administrator berhasil diperbarui!');
    } else if (modalType === 'violation') {
      if (editingAccount) {
        setViolationCredentials(violationCredentials.map(v => v.id === editingAccount.id ? { ...v, ...accountForm } : v));
      } else {
        setViolationCredentials([...violationCredentials, { id: Math.random().toString(36).substr(2, 9), ...accountForm }]);
      }
      setSuccessMsg('Akun Kedisiplinan berhasil diperbarui!');
    } else if (modalType === 'teacher') {
      setTeachers(teachers.map(t => t.id === editingAccount.id ? { ...t, ...accountForm } : t));
      setSuccessMsg(`Akses guru ${editingAccount.name} diperbarui!`);
    }
    
    setIsAccountModalOpen(false);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleDeleteAccount = (type: 'admin' | 'violation', id: string) => {
    if (!confirm('Hapus akun akses ini?')) return;
    if (type === 'admin') {
      if (adminCredentials.length <= 1) return alert('Sistem harus menyisakan minimal 1 akun Administrator!');
      setAdminCredentials(adminCredentials.filter(a => a.id !== id));
    } else {
      setViolationCredentials(violationCredentials.filter(v => v.id !== id));
    }
  };

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
    link.href = url;
    link.download = `Backup_SMAN1Kwanyar_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!confirm('Semua data saat ini akan ditimpa. Lanjutkan?')) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.students && data.teachers) onRestore(data);
        else alert('File tidak valid!');
      } catch (err) { alert('Format JSON rusak!'); }
    };
    reader.readAsText(file);
    if (restoreFileRef.current) restoreFileRef.current.value = '';
  };

  const filteredTeachers = teachers.filter(t => t.name.toLowerCase().includes(teacherSearch.toLowerCase()));

  return (
    <AdminLayout onLogout={onLogout}>
      <div className="max-w-4xl mx-auto space-y-8 pb-10">
        {successMsg && (
          <div className="bg-emerald-100 border-l-4 border-emerald-500 text-emerald-800 p-4 rounded-xl shadow-sm flex items-center gap-3 animate-bounce">
            <i className="fas fa-check-circle text-emerald-500 text-xl"></i>
            <span className="font-black uppercase tracking-widest text-xs">{successMsg}</span>
          </div>
        )}

        {/* Section: Admin Accounts */}
        <section className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
            <div className="flex items-center gap-3">
              <i className="fas fa-user-shield text-xl"></i>
              <h3 className="font-black uppercase tracking-tight">Daftar Akun Administrator</h3>
            </div>
            <button onClick={() => openAccountModal('admin')} className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition">Tambah Admin</button>
          </div>
          <div className="divide-y divide-slate-100">
            {adminCredentials.map(acc => (
              <div key={acc.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500"><i className="fas fa-user"></i></div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm uppercase">{acc.username}</p>
                    <p className="text-[10px] font-mono text-slate-400">PW: {acc.password.replace(/./g, '*')}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openAccountModal('admin', acc)} className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition flex items-center justify-center"><i className="fas fa-edit text-xs"></i></button>
                  <button onClick={() => handleDeleteAccount('admin', acc.id)} className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-600 hover:text-white transition flex items-center justify-center"><i className="fas fa-trash text-xs"></i></button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section: Violation Accounts */}
        <section className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 bg-amber-500 text-white flex justify-between items-center">
            <div className="flex items-center gap-3">
              <i className="fas fa-shield-alt text-xl"></i>
              <h3 className="font-black uppercase tracking-tight">Akses Kedisiplinan (BK/Kesiswaan)</h3>
            </div>
            <button onClick={() => openAccountModal('violation')} className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition">Tambah Akses</button>
          </div>
          <div className="divide-y divide-slate-100">
            {violationCredentials.map(acc => (
              <div key={acc.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center text-sm"><i className="fas fa-lock"></i></div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm uppercase">{acc.username}</p>
                    <p className="text-[10px] font-mono text-slate-400">PW: {acc.password.replace(/./g, '*')}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openAccountModal('violation', acc)} className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white transition flex items-center justify-center"><i className="fas fa-edit text-xs"></i></button>
                  <button onClick={() => handleDeleteAccount('violation', acc.id)} className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-600 hover:text-white transition flex items-center justify-center"><i className="fas fa-trash text-xs"></i></button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section: Teacher Accounts */}
        <section className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <i className="fas fa-users-cog text-blue-600 text-xl"></i>
              <h3 className="font-black text-slate-800 uppercase tracking-tight">Kelola Akun Guru</h3>
            </div>
            <div className="relative w-full sm:w-64">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400"><i className="fas fa-search text-xs"></i></span>
              <input type="text" placeholder="Cari guru..." className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={teacherSearch} onChange={e => setTeacherSearch(e.target.value)} />
            </div>
          </div>
          <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest sticky top-0 z-10">
                  <th className="px-6 py-4">Nama Guru</th>
                  <th className="px-6 py-4">Username</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredTeachers.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800 text-xs uppercase">{t.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{t.nip}</p>
                    </td>
                    <td className="px-6 py-4"><span className="font-mono text-[10px] bg-slate-100 px-2 py-1 rounded">{t.username || '-'}</span></td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => openAccountModal('teacher', t)} className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-[10px] font-black hover:bg-blue-600 hover:text-white transition uppercase">Edit Akses</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section: Maintenance / Backup Restore (At the bottom) */}
        <section className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 bg-emerald-600 text-white flex items-center gap-3">
            <i className="fas fa-database text-xl"></i>
            <h3 className="font-black uppercase tracking-tight">Pemeliharaan Sistem & Database</h3>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center text-xl"><i className="fas fa-download"></i></div>
                  <div>
                    <h4 className="font-black text-slate-800 text-sm uppercase">Backup Database</h4>
                    <p className="text-xs text-slate-500">Unduh data cadangan sistem (.json)</p>
                  </div>
                </div>
                <button onClick={handleBackup} className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black text-xs hover:bg-emerald-700 transition shadow-lg flex items-center justify-center gap-2 uppercase tracking-widest"><i className="fas fa-file-export"></i> DOWNLOAD BACKUP</button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-xl"><i className="fas fa-upload"></i></div>
                  <div>
                    <h4 className="font-black text-slate-800 text-sm uppercase">Restore Database</h4>
                    <p className="text-xs text-slate-500">Impor data dari file backup sebelumnya</p>
                  </div>
                </div>
                <label className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-xs hover:bg-blue-700 transition shadow-lg flex items-center justify-center gap-2 cursor-pointer text-center uppercase tracking-widest">
                  <i className="fas fa-file-import"></i> UPLOAD & PULIHKAN
                  <input type="file" className="hidden" accept=".json" onChange={handleRestore} ref={restoreFileRef} />
                </label>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Account Modal (Add/Edit) */}
      {isAccountModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-white/20">
            <div className={`p-6 text-white flex justify-between items-center ${modalType === 'admin' ? 'bg-slate-900' : modalType === 'violation' ? 'bg-amber-500' : 'bg-blue-600'}`}>
              <h3 className="text-sm font-black uppercase tracking-widest">
                {editingAccount ? 'Edit Akun' : 'Tambah Akun'} {modalType === 'admin' ? 'Administrator' : modalType === 'violation' ? 'Kedisiplinan' : 'Guru'}
              </h3>
              <button onClick={() => setIsAccountModalOpen(false)}><i className="fas fa-times text-xl"></i></button>
            </div>
            <form onSubmit={handleSaveAccount} className="p-8 space-y-6">
              {modalType === 'teacher' && (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="font-black text-slate-800 text-xs uppercase tracking-tight">{editingAccount?.name}</p>
                  <p className="text-[10px] text-slate-500 font-mono">NIP: {editingAccount?.nip}</p>
                </div>
              )}
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Username Baru</label>
                  <input type="text" required className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold focus:ring-2 focus:ring-blue-500 outline-none" value={accountForm.username} onChange={e => setAccountForm({...accountForm, username: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Password Baru</label>
                  <input type="text" required className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold focus:ring-2 focus:ring-blue-500 outline-none" value={accountForm.password} onChange={e => setAccountForm({...accountForm, password: e.target.value})} />
                </div>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setIsAccountModalOpen(false)} className="flex-1 px-4 py-3 border border-slate-200 rounded-xl font-bold text-slate-500 text-xs uppercase tracking-widest">Batal</button>
                <button type="submit" className={`flex-1 px-4 py-3 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg ${modalType === 'admin' ? 'bg-slate-900' : modalType === 'violation' ? 'bg-amber-500' : 'bg-blue-600'}`}>Simpan Akun</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AccountSettingsPage;
