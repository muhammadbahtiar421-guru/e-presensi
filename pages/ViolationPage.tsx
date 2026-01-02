
import React, { useState, useEffect } from 'react';
import { Student, ClassRoom, ViolationItem, ViolationRecord, User, Teacher } from '../types';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';

interface ViolationPageProps {
  students: Student[];
  classes: ClassRoom[];
  teachers: Teacher[];
  violationItems: ViolationItem[];
  setViolationItems: (v: ViolationItem[]) => void;
  violationRecords: ViolationRecord[];
  setViolationRecords: (v: ViolationRecord[]) => void;
  violationCredentials: any;
  currentUser: User | null;
}

const ViolationPage: React.FC<ViolationPageProps> = ({
  students, classes, teachers, violationItems, setViolationItems, violationRecords, setViolationRecords, violationCredentials, currentUser
}) => {
  const [isAuth, setIsAuth] = useState(false);
  const [authForm, setAuthForm] = useState({ username: '', password: '' });
  const [authError, setAuthError] = useState('');

  const [activeTab, setActiveTab] = useState<'dashboard' | 'input' | 'report' | 'settings'>('dashboard');
  
  // Input State
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [selectedViolation, setSelectedViolation] = useState('');
  const [manualReporter, setManualReporter] = useState('');
  const [notes, setNotes] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Master Data State
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());
  const [editingItem, setEditingItem] = useState<ViolationItem | null>(null);
  const [itemForm, setItemForm] = useState({ description: '', category: 'Ringan' as any, points: 5 });

  // Report State
  const [reportSubTab, setReportSubTab] = useState<'harian' | 'bulanan' | 'riwayat'>('harian');
  const [reportClass, setReportClass] = useState('');
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportMonth, setReportMonth] = useState(new Date().toISOString().slice(0, 7));
  const [searchHistoryName, setSearchHistoryName] = useState('');

  const filteredStudentsByClass = students.filter(s => s.classId === selectedClass);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (authForm.username === violationCredentials.username && authForm.password === violationCredentials.password) {
      setIsAuth(true);
      setAuthError('');
    } else {
      setAuthError('Username atau Password Kedisiplinan Salah!');
    }
  };

  const handleRecordViolation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !selectedViolation || !manualReporter) return;

    const newRecord: ViolationRecord = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString().split('T')[0],
      studentId: selectedStudent,
      violationItemId: selectedViolation,
      notes: notes,
      reporter: manualReporter
    };

    setViolationRecords([newRecord, ...violationRecords]);
    const sName = students.find(s => s.id === selectedStudent)?.name;
    setSuccessMsg(`Pelanggaran siswa ${sName} berhasil dicatat!`);
    
    setSelectedStudent('');
    setSelectedViolation('');
    setNotes('');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      setViolationItems(violationItems.map(item => 
        item.id === editingItem.id ? { ...item, ...itemForm } : item
      ));
      setEditingItem(null);
    } else {
      const newItem: ViolationItem = {
        id: Math.random().toString(36).substr(2, 9),
        ...itemForm
      };
      setViolationItems([...violationItems, newItem]);
    }
    setItemForm({ description: '', category: 'Ringan', points: 5 });
  };

  const toggleSelectItem = (id: string) => {
    const newSelected = new Set(selectedItemIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedItemIds(newSelected);
  };

  const handleBulkDeleteItems = () => {
    if (selectedItemIds.size === 0) return;
    if (!confirm(`Hapus ${selectedItemIds.size} jenis pelanggaran terpilih?`)) return;
    setViolationItems(violationItems.filter(item => !selectedItemIds.has(item.id)));
    setSelectedItemIds(new Set());
  };

  // Dashboard Data Aggregation
  const getDashboardData = () => {
    const today = new Date().toISOString().split('T')[0];
    const month = today.slice(0, 7);
    
    const monthRecs = violationRecords.filter(r => r.date.startsWith(month));
    
    const catStats = [
      { name: 'Ringan', value: monthRecs.filter(r => violationItems.find(vi => vi.id === r.violationItemId)?.category === 'Ringan').length, color: '#3b82f6' },
      { name: 'Sedang', value: monthRecs.filter(r => violationItems.find(vi => vi.id === r.violationItemId)?.category === 'Sedang').length, color: '#f59e0b' },
      { name: 'Berat', value: monthRecs.filter(r => violationItems.find(vi => vi.id === r.violationItemId)?.category === 'Berat').length, color: '#f43f5e' },
    ];

    const genderStats = [
      { name: 'Laki-laki (LK)', value: monthRecs.filter(r => students.find(s => s.id === r.studentId)?.gender === 'L').length, color: '#0ea5e9' },
      { name: 'Perempuan (PR)', value: monthRecs.filter(r => students.find(s => s.id === r.studentId)?.gender === 'P').length, color: '#ec4899' },
    ];

    return { catStats, genderStats };
  };

  const { catStats, genderStats } = getDashboardData();

  // Helper filters for reports
  const getDailyViolations = () => {
    return violationRecords.filter(r => {
      const student = students.find(s => s.id === r.studentId);
      return r.date === reportDate && (reportClass ? student?.classId === reportClass : true);
    });
  };

  const getMonthlyViolations = () => {
    return violationRecords.filter(r => {
      const student = students.find(s => s.id === r.studentId);
      return r.date.startsWith(reportMonth) && (reportClass ? student?.classId === reportClass : true);
    });
  };

  const getHistoryViolations = () => {
    return violationRecords.filter(r => {
      const student = students.find(s => s.id === r.studentId);
      const nameMatch = student?.name.toLowerCase().includes(searchHistoryName.toLowerCase());
      const classMatch = reportClass ? student?.classId === reportClass : true;
      return nameMatch && classMatch;
    });
  };

  if (!isAuth) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-amber-500 p-8 text-white text-center">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">
              <i className="fas fa-user-shield"></i>
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tight">Login Kedisiplinan</h2>
            <p className="text-amber-100 text-xs mt-1 font-bold">SMAN 1 Kwanyar</p>
          </div>
          <form onSubmit={handleLogin} className="p-8 space-y-6">
            {authError && (
              <div className="bg-rose-50 text-rose-600 p-3 rounded-xl text-xs font-bold border border-rose-100 flex items-center gap-2">
                <i className="fas fa-exclamation-circle"></i> {authError}
              </div>
            )}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Username</label>
              <input 
                type="text" required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold outline-none focus:ring-2 focus:ring-amber-500"
                value={authForm.username}
                onChange={e => setAuthForm({...authForm, username: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Password</label>
              <input 
                type="password" required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold outline-none focus:ring-2 focus:ring-amber-500"
                value={authForm.password}
                onChange={e => setAuthForm({...authForm, password: e.target.value})}
              />
            </div>
            <button className="w-full bg-slate-900 text-white py-4 rounded-xl font-black uppercase tracking-widest shadow-lg hover:bg-slate-800 transition">MASUK SISTEM</button>
            <Link to="/" className="block text-center text-xs font-bold text-slate-400 hover:text-slate-600">Kembali ke Halaman Utama</Link>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-slate-900 text-white shadow-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white hover:bg-amber-600 transition shadow-lg">
              <i className="fas fa-arrow-left"></i>
            </Link>
            <div>
              <h1 className="font-black uppercase tracking-tighter text-xl leading-none">Pusat Kedisiplinan</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">SMAN 1 Kwanyar</p>
            </div>
          </div>
          <div className="flex flex-wrap bg-slate-800 p-1 rounded-xl shadow-inner">
            <button onClick={() => setActiveTab('dashboard')} className={`px-4 py-2 rounded-lg text-xs font-black transition ${activeTab === 'dashboard' ? 'bg-amber-500 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>DASHBOARD</button>
            <button onClick={() => setActiveTab('input')} className={`px-4 py-2 rounded-lg text-xs font-black transition ${activeTab === 'input' ? 'bg-amber-500 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>INPUT</button>
            <button onClick={() => setActiveTab('report')} className={`px-4 py-2 rounded-lg text-xs font-black transition ${activeTab === 'report' ? 'bg-amber-500 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>LAPORAN</button>
            <button onClick={() => setActiveTab('settings')} className={`px-4 py-2 rounded-lg text-xs font-black transition ${activeTab === 'settings' ? 'bg-amber-500 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>MASTER DATA</button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-4 md:p-8">
        {successMsg && (
          <div className="max-w-4xl mx-auto mb-6 bg-emerald-100 border-l-4 border-emerald-500 text-emerald-800 p-4 rounded-xl shadow-sm flex items-center gap-3 animate-bounce">
            <i className="fas fa-check-circle text-xl"></i>
            <span className="font-bold">{successMsg}</span>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Insiden (Bulan Ini)</p>
                <h3 className="text-4xl font-black text-slate-800">{violationRecords.filter(r => r.date.startsWith(new Date().toISOString().slice(0, 7))).length}</h3>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Point Tertinggi Siswa</p>
                <h3 className="text-4xl font-black text-rose-600">
                  {students.length > 0 ? Math.max(...students.map(s => {
                    return violationRecords.filter(r => r.studentId === s.id).reduce((acc, r) => acc + (violationItems.find(vi => vi.id === r.violationItemId)?.points || 0), 0);
                  })) : 0}
                </h3>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pelanggaran Terberat</p>
                <h3 className="text-xl font-black text-slate-800 uppercase leading-none mt-2">
                  {violationRecords.length > 0 ? violationItems.find(vi => vi.id === violationRecords[0].violationItemId)?.description : '-'}
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                <h4 className="font-black text-slate-800 uppercase tracking-tight mb-8 text-sm flex items-center gap-2">
                  <i className="fas fa-chart-bar text-amber-500"></i> Tren Kategori Pelanggaran (Bulan Ini)
                </h4>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={catStats}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={10} fontStyle="bold" />
                      <YAxis axisLine={false} tickLine={false} fontSize={10} />
                      <Tooltip cursor={{fill: '#f8fafc'}} />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                        {catStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                <h4 className="font-black text-slate-800 uppercase tracking-tight mb-8 text-sm flex items-center gap-2">
                  <i className="fas fa-venus-mars text-blue-500"></i> Sebaran Pelanggaran per Gender
                </h4>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={genderStats}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {genderStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'input' && (
          <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden animate-fadeIn">
            <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                <i className="fas fa-edit text-amber-500"></i> Form Kedisiplinan
              </h3>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase">Tanggal Sistem</p>
                <p className="font-bold text-slate-700 text-xs">{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
            </div>
            <form onSubmit={handleRecordViolation} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Pilih Kelas</label>
                  <select 
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold focus:ring-2 focus:ring-amber-500 outline-none"
                    value={selectedClass}
                    onChange={e => { setSelectedClass(e.target.value); setSelectedStudent(''); }}
                  >
                    <option value="">-- Pilih Kelas --</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Pilih Siswa</label>
                  <select 
                    required
                    disabled={!selectedClass}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold focus:ring-2 focus:ring-amber-500 outline-none disabled:opacity-50"
                    value={selectedStudent}
                    onChange={e => setSelectedStudent(e.target.value)}
                  >
                    <option value="">-- Pilih Siswa --</option>
                    {filteredStudentsByClass.map(s => <option key={s.id} value={s.id}>{s.name} ({s.nis})</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Jenis Pelanggaran</label>
                <select 
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold focus:ring-2 focus:ring-amber-500 outline-none"
                  value={selectedViolation}
                  onChange={e => setSelectedViolation(e.target.value)}
                >
                  <option value="">-- Pilih Jenis Pelanggaran --</option>
                  {violationItems.map(item => (
                    <option key={item.id} value={item.id}>{item.description} (+{item.points} Poin)</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Nama Guru Pelapor / Pencatat (Manual)</label>
                <input 
                  type="text" required
                  placeholder="Masukkan nama guru yang melaporkan..."
                  className="w-full bg-blue-50 border border-blue-100 rounded-xl p-3 font-bold focus:ring-2 focus:ring-blue-500 outline-none text-blue-800"
                  value={manualReporter}
                  onChange={e => setManualReporter(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Catatan / Keterangan Kejadian</label>
                <textarea 
                  placeholder="Misal: Lokasi kejadian, alasan siswa, atau saksi..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 min-h-[100px] resize-none focus:ring-2 focus:ring-amber-500 outline-none font-medium"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                ></textarea>
              </div>

              <button 
                type="submit" 
                disabled={!selectedStudent || !selectedViolation || !manualReporter}
                className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-base shadow-xl hover:bg-slate-800 transition disabled:opacity-50 flex items-center justify-center gap-3 uppercase tracking-widest"
              >
                <i className="fas fa-save"></i> Simpan Pelanggaran
              </button>
            </form>
          </div>
        )}

        {activeTab === 'report' && (
          <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn">
            {/* Sub-Tabs Laporan */}
            <div className="flex flex-wrap gap-2 p-1 bg-slate-200 rounded-2xl w-fit">
              <button onClick={() => setReportSubTab('harian')} className={`px-6 py-2 rounded-xl font-black text-xs transition-all ${reportSubTab === 'harian' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>LAPORAN HARIAN</button>
              <button onClick={() => setReportSubTab('bulanan')} className={`px-6 py-2 rounded-xl font-black text-xs transition-all ${reportSubTab === 'bulanan' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>REKAP BULANAN</button>
              <button onClick={() => setReportSubTab('riwayat')} className={`px-6 py-2 rounded-xl font-black text-xs transition-all ${reportSubTab === 'riwayat' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>HISTORI SISWA</button>
            </div>

            {/* Filter Laporan */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pilih Kelas</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none" value={reportClass} onChange={e => setReportClass(e.target.value)}>
                  <option value="">-- Semua Kelas --</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              
              {reportSubTab === 'harian' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pilih Tanggal</label>
                  <input type="date" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none" value={reportDate} onChange={e => setReportDate(e.target.value)} />
                </div>
              )}

              {reportSubTab === 'bulanan' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pilih Bulan</label>
                  <input type="month" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none" value={reportMonth} onChange={e => setReportMonth(e.target.value)} />
                </div>
              )}

              {reportSubTab === 'riwayat' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cari Nama Siswa</label>
                  <input 
                    type="text" 
                    placeholder="Masukkan nama siswa..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none" 
                    value={searchHistoryName} 
                    onChange={e => setSearchHistoryName(e.target.value)} 
                  />
                </div>
              )}

              <button className="bg-blue-600 text-white p-3 rounded-xl font-black text-xs hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-lg h-[46px]">
                <i className="fas fa-print"></i> CETAK LAPORAN
              </button>
            </div>

            {/* Tabel Laporan */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-black text-slate-800 uppercase tracking-tight">
                  {reportSubTab === 'harian' ? 'Daftar Pelanggaran Harian' : 
                   reportSubTab === 'bulanan' ? 'Rekapitulasi Pelanggaran Bulanan' : 
                   'Hasil Pencarian Histori Siswa'}
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-white border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                      <th className="px-6 py-4">Waktu</th>
                      <th className="px-6 py-4">Nama Siswa</th>
                      <th className="px-6 py-4">Kelas</th>
                      <th className="px-6 py-4">Jenis Pelanggaran</th>
                      <th className="px-6 py-4 text-center">Poin</th>
                      <th className="px-6 py-4">Petugas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-sm">
                    {(reportSubTab === 'harian' ? getDailyViolations() : 
                      reportSubTab === 'bulanan' ? getMonthlyViolations() : 
                      getHistoryViolations()).map(r => {
                      const student = students.find(s => s.id === r.studentId);
                      const item = violationItems.find(vi => vi.id === r.violationItemId);
                      return (
                        <tr key={r.id} className="hover:bg-slate-50 transition">
                          <td className="px-6 py-4 text-xs font-mono">{r.date}</td>
                          <td className="px-6 py-4 font-black uppercase text-xs">{student?.name || 'Siswa Dihapus'}</td>
                          <td className="px-6 py-4 text-xs font-bold text-slate-500">{classes.find(c => c.id === student?.classId)?.name || '-'}</td>
                          <td className="px-6 py-4">
                            <p className="font-bold text-slate-700 text-xs">{item?.description}</p>
                            <p className="text-[10px] text-slate-400 italic">Ket: {r.notes || '-'}</p>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-2 py-1 rounded-lg text-xs font-black ${
                              item?.category === 'Berat' ? 'bg-rose-100 text-rose-700' :
                              item?.category === 'Sedang' ? 'bg-amber-100 text-amber-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              +{item?.points || 0}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase">{r.reporter}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 animate-fadeIn">
            <div className="md:col-span-1">
              <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden sticky top-24">
                <div className="p-5 bg-slate-900 text-white">
                  <h3 className="font-black text-sm uppercase tracking-tight">
                    {editingItem ? 'Edit Pelanggaran' : 'Tambah Jenis Pelanggaran'}
                  </h3>
                </div>
                <form onSubmit={handleSaveItem} className="p-6 space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase">Deskripsi Pelanggaran</label>
                    <input 
                      type="text" required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none"
                      value={itemForm.description}
                      onChange={e => setItemForm({...itemForm, description: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase">Kategori Bobot</label>
                    <select 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none"
                      value={itemForm.category}
                      onChange={e => setItemForm({...itemForm, category: e.target.value as any})}
                    >
                      <option value="Ringan">Ringan</option>
                      <option value="Sedang">Sedang</option>
                      <option value="Berat">Berat</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase">Bobot Poin</label>
                    <input 
                      type="number" required min="1"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none"
                      value={itemForm.points}
                      onChange={e => setItemForm({...itemForm, points: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="pt-2 flex gap-2">
                    <button type="submit" className="flex-1 bg-amber-500 text-white py-3 rounded-xl font-black text-xs hover:bg-amber-600 transition shadow-lg">SIMPAN</button>
                    {editingItem && (
                      <button type="button" onClick={() => { setEditingItem(null); setItemForm({description:'', category:'Ringan', points:5}); }} className="px-4 py-3 bg-slate-100 text-slate-500 rounded-xl font-black text-xs">BATAL</button>
                    )}
                  </div>
                </form>
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4"
                      checked={violationItems.length > 0 && selectedItemIds.size === violationItems.length}
                      onChange={() => {
                        if (selectedItemIds.size === violationItems.length) setSelectedItemIds(new Set());
                        else setSelectedItemIds(new Set(violationItems.map(i => i.id)));
                      }}
                    />
                    <h3 className="font-black text-slate-800 uppercase tracking-tight">Katalog Poin Kedisiplinan</h3>
                  </div>
                  {selectedItemIds.size > 0 && (
                    <button onClick={handleBulkDeleteItems} className="bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-[10px] font-black hover:bg-rose-200 transition">
                      HAPUS {selectedItemIds.size} TERPILIH
                    </button>
                  )}
                </div>
                <div className="divide-y divide-slate-100">
                  {violationItems.map(item => (
                    <div key={item.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition">
                      <div className="flex items-center gap-4">
                        <input 
                          type="checkbox"
                          className="w-4 h-4"
                          checked={selectedItemIds.has(item.id)}
                          onChange={() => toggleSelectItem(item.id)}
                        />
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black shadow-inner ${
                          item.category === 'Berat' ? 'bg-rose-100 text-rose-700' :
                          item.category === 'Sedang' ? 'bg-amber-100 text-amber-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {item.points}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{item.description}</p>
                          <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{item.category}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => { setEditingItem(item); setItemForm({description: item.description, category: item.category, points: item.points}); }} className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 hover:bg-blue-600 hover:text-white transition flex items-center justify-center"><i className="fas fa-edit text-xs"></i></button>
                        <button onClick={() => { if(confirm('Hapus item ini?')) setViolationItems(violationItems.filter(v=>v.id!==item.id)); }} className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 hover:bg-rose-600 hover:text-white transition flex items-center justify-center"><i className="fas fa-trash text-xs"></i></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ViolationPage;
