
import React, { useState, useRef } from 'react';
import AdminLayout from '../components/AdminLayout';
import { Teacher, Subject, ClassRoom, Student } from '../types';

interface ManagementPageProps {
  teachers: Teacher[]; setTeachers: (v: Teacher[]) => void;
  subjects: Subject[]; setSubjects: (v: Subject[]) => void;
  classes: ClassRoom[]; setClasses: (v: ClassRoom[]) => void;
  students: Student[]; setStudents: (v: Student[]) => void;
  onLogout: () => void;
}

const ManagementPage: React.FC<ManagementPageProps> = ({ 
  teachers, setTeachers, subjects, setSubjects, classes, setClasses, students, setStudents, onLogout 
}) => {
  const [activeTab, setActiveTab] = useState<'teachers' | 'subjects' | 'classes' | 'students'>('teachers');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getCurrentData = () => {
    if (activeTab === 'teachers') return teachers;
    if (activeTab === 'subjects') return subjects;
    if (activeTab === 'classes') return classes;
    return students;
  };

  const setCurrentData = (newData: any[]) => {
    if (activeTab === 'teachers') setTeachers(newData);
    else if (activeTab === 'subjects') setSubjects(newData);
    else if (activeTab === 'classes') setClasses(newData);
    else if (activeTab === 'students') setStudents(newData);
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData(activeTab === 'students' ? { gender: 'L' } : {});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setEditingItem(item);
    setFormData({ ...item });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const currentList = getCurrentData();
    
    if (editingItem) {
      const newList = currentList.map(item => item.id === editingItem.id ? { ...formData } : item);
      setCurrentData(newList);
    } else {
      const newItem = { ...formData, id: Math.random().toString(36).substr(2, 9) };
      setCurrentData([...currentList, newItem]);
    }
    
    setIsModalOpen(false);
    setEditingItem(null);
    setFormData({});
  };

  const handleDelete = (id: string) => {
    if (!confirm('Yakin ingin menghapus data ini?')) return;
    const newList = getCurrentData().filter((item: any) => item.id !== id);
    setCurrentData(newList);
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Yakin ingin menghapus ${selectedIds.size} data terpilih?`)) return;
    
    const newList = getCurrentData().filter((item: any) => !selectedIds.has(item.id));
    setCurrentData(newList);
    setSelectedIds(new Set());
  };

  const toggleSelectAll = () => {
    const data = getCurrentData();
    if (selectedIds.size === data.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(data.map((item: any) => item.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  const downloadTemplate = () => {
    let headers = "";
    let fileName = "";
    
    if (activeTab === 'teachers') { headers = "name,nip,subjectId,classId,username,password"; fileName = "template_guru.csv"; }
    if (activeTab === 'subjects') { headers = "name"; fileName = "template_mapel.csv"; }
    if (activeTab === 'classes') { headers = "name,grade"; fileName = "template_kelas.csv"; }
    if (activeTab === 'students') { headers = "name,nis,classId,gender"; fileName = "template_siswa.csv"; }

    const blob = new Blob([headers], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', fileName);
    a.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n');
      const headers = lines[0].trim().split(',');
      const importedData: any[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const values = line.split(',');
        const obj: any = { id: Math.random().toString(36).substr(2, 9) };
        headers.forEach((header, index) => {
          obj[header] = values[index];
        });
        importedData.push(obj);
      }

      setCurrentData([...getCurrentData(), ...importedData]);
      alert(`Berhasil mengimport ${importedData.length} data.`);
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const data = getCurrentData();

  return (
    <AdminLayout onLogout={onLogout}>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div className="flex flex-wrap gap-2">
          {(['teachers', 'subjects', 'classes', 'students'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setSelectedIds(new Set()); }}
              className={`px-5 py-2.5 rounded-xl font-bold transition-all text-sm ${
                activeTab === tab ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-500 hover:bg-slate-100'
              }`}
            >
              {tab === 'teachers' && 'Guru'}
              {tab === 'subjects' && 'Mata Pelajaran'}
              {tab === 'classes' && 'Kelas'}
              {tab === 'students' && 'Siswa'}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <button 
            onClick={downloadTemplate}
            className="bg-emerald-50 text-emerald-600 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-100 transition border border-emerald-100 flex items-center gap-2"
          >
            <i className="fas fa-file-excel"></i> Template
          </button>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="bg-slate-50 text-slate-600 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-100 transition border border-slate-200 flex items-center gap-2"
          >
            <i className="fas fa-file-import"></i> Import
            <input type="file" ref={fileInputRef} className="hidden" accept=".csv" onChange={handleImport} />
          </button>
          <button 
            onClick={handleOpenAdd}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-100 flex items-center gap-2"
          >
            <i className="fas fa-plus"></i> Tambah Data
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <h4 className="font-black text-slate-800 text-lg uppercase tracking-tight">Master {activeTab}</h4>
            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-lg">{data.length} Total</span>
          </div>
          
          {selectedIds.size > 0 && (
            <button 
              onClick={handleBulkDelete}
              className="bg-rose-50 text-rose-600 px-4 py-2 rounded-xl text-xs font-black hover:bg-rose-100 transition flex items-center gap-2 border border-rose-100 animate-bounce"
            >
              <i className="fas fa-trash"></i> HAPUS {selectedIds.size} TERPILIH
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <th className="px-6 py-4 w-10">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    checked={data.length > 0 && selectedIds.size === data.length}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="px-6 py-4">Nama / Detail</th>
                <th className="px-6 py-4">Informasi Tambahan</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.map((item: any) => (
                <tr key={item.id} className={`hover:bg-blue-50/30 transition-colors ${selectedIds.has(item.id) ? 'bg-blue-50/50' : ''}`}>
                  <td className="px-6 py-4">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      checked={selectedIds.has(item.id)}
                      onChange={() => toggleSelect(item.id)}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-800 text-sm">{item.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">UID: {item.id}</p>
                  </td>
                  <td className="px-6 py-4">
                    {activeTab === 'teachers' && (
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-medium text-slate-600">NIP: {item.nip}</span>
                        <div className="flex flex-wrap gap-1">
                          <span className="text-[9px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded font-bold">Mapel: {subjects.find(s=>s.id===item.subjectId)?.name || '-'}</span>
                          <span className="text-[9px] px-1.5 py-0.5 bg-purple-50 text-purple-600 rounded font-bold">Kelas: {classes.find(c=>c.id===item.classId)?.name || '-'}</span>
                          <span className="text-[9px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded font-bold">User: {item.username || '-'}</span>
                        </div>
                      </div>
                    )}
                    {activeTab === 'subjects' && <span className="text-xs font-medium text-slate-500 italic">Mata Pelajaran Sekolah</span>}
                    {activeTab === 'classes' && <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">Jenjang {item.grade}</span>}
                    {activeTab === 'students' && (
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-slate-600">NIS: {item.nis}</span>
                          <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${item.gender === 'L' ? 'bg-blue-100 text-blue-700' : 'bg-rose-100 text-rose-700'}`}>
                            {item.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-blue-500">Kelas: {classes.find(c => c.id === item.classId)?.name || 'Unknown'}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <button 
                        onClick={() => handleOpenEdit(item)} 
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all"
                        title="Edit Data"
                      >
                        <i className="fas fa-edit text-xs"></i>
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)} 
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-600 hover:text-white transition-all"
                        title="Hapus Data"
                      >
                        <i className="fas fa-trash text-xs"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center text-slate-300">
                    <i className="fas fa-inbox text-5xl mb-4 opacity-10"></i>
                    <p className="font-medium text-sm">Belum ada data untuk kategori ini.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-white/20">
            <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
              <h3 className="text-lg font-black uppercase tracking-tight">
                {editingItem ? `Edit ${activeTab.slice(0, -1)}` : `Tambah ${activeTab.slice(0, -1)}`}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="hover:rotate-90 transition-transform">
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-8 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="space-y-1">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Nama Lengkap</label>
                <input 
                  type="text" required 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                  value={formData.name || ''}
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                />
              </div>

              {activeTab === 'teachers' && (
                <>
                  <div className="space-y-1">
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">NIP</label>
                    <input 
                      type="text" required 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                      value={formData.nip || ''}
                      onChange={e => setFormData({...formData, nip: e.target.value})} 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Mapel Pengampu</label>
                      <select 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                        value={formData.subjectId || ''}
                        onChange={e => setFormData({...formData, subjectId: e.target.value})}
                      >
                        <option value="">-- Pilih Mapel --</option>
                        {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Kelas Pengampu</label>
                      <select 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                        value={formData.classId || ''}
                        onChange={e => setFormData({...formData, classId: e.target.value})}
                      >
                        <option value="">-- Pilih Kelas --</option>
                        {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 space-y-3">
                    <h5 className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Akses Login Guru</h5>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase">Username</label>
                        <input 
                          type="text" 
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs" 
                          value={formData.username || ''}
                          onChange={e => setFormData({...formData, username: e.target.value})} 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase">Password</label>
                        <input 
                          type="password" 
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs" 
                          value={formData.password || ''}
                          onChange={e => setFormData({...formData, password: e.target.value})} 
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'classes' && (
                <div className="space-y-1">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Jenjang</label>
                  <select 
                    required 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    value={formData.grade || ''}
                    onChange={e => setFormData({...formData, grade: e.target.value})}
                  >
                    <option value="">-- Pilih Jenjang --</option>
                    <option value="X">Kelas X</option>
                    <option value="XI">Kelas XI</option>
                    <option value="XII">Kelas XII</option>
                  </select>
                </div>
              )}

              {activeTab === 'students' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">NIS</label>
                      <input 
                        type="text" required 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                        value={formData.nis || ''}
                        onChange={e => setFormData({...formData, nis: e.target.value})} 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Jenis Kelamin</label>
                      <select 
                        required 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        value={formData.gender || 'L'}
                        onChange={e => setFormData({...formData, gender: e.target.value})}
                      >
                        <option value="L">Laki-laki</option>
                        <option value="P">Perempuan</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Pilih Kelas</label>
                    <select 
                      required 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      value={formData.classId || ''}
                      onChange={e => setFormData({...formData, classId: e.target.value})}
                    >
                      <option value="">-- Pilih Kelas --</option>
                      {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </>
              )}

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 border border-slate-200 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition">Batal</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-black hover:bg-blue-700 transition shadow-xl shadow-blue-100">SIMPAN DATA</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default ManagementPage;
