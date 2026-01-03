
import React, { useState, useRef } from 'react';
import AdminLayout from '../components/AdminLayout';
import { Teacher, Subject, ClassRoom, Student } from '../types';
import { supabase } from '../supabaseClient';

interface ManagementPageProps {
  teachers: Teacher[]; setTeachers: (v: Teacher[]) => void;
  subjects: Subject[]; setSubjects: (v: Subject[]) => void;
  classes: ClassRoom[]; setClasses: (v: ClassRoom[]) => void;
  students: Student[]; setStudents: (v: Student[]) => void;
  onLogout: () => void;
}

const ManagementPage: React.FC<ManagementPageProps> = ({ 
  teachers = [], setTeachers, subjects = [], setSubjects, classes = [], setClasses, students = [], setStudents, onLogout 
}) => {
  const [activeTab, setActiveTab] = useState<'teachers' | 'subjects' | 'classes' | 'students'>('teachers');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getCurrentData = () => {
    if (activeTab === 'teachers') return Array.isArray(teachers) ? teachers : [];
    if (activeTab === 'subjects') return Array.isArray(subjects) ? subjects : [];
    if (activeTab === 'classes') return Array.isArray(classes) ? classes : [];
    return Array.isArray(students) ? students : [];
  };

  const syncWithSupabase = async (tab: string, item: any, action: 'save' | 'delete') => {
    try {
      const table = tab === 'teachers' ? 'teachers' : tab === 'subjects' ? 'subjects' : tab === 'classes' ? 'classes' : 'students';
      if (action === 'save') {
        const { error } = await supabase.from(table).upsert(item);
        if (error) console.error("Supabase Save Error:", error);
      } else {
        const { error } = await supabase.from(table).delete().eq('id', item.id);
        if (error) console.error("Supabase Delete Error:", error);
      }
    } catch (e) {
      console.error("Critical Sync Error:", e);
    }
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

  // Fixed: Use type assertions to prevent TypeScript from complaining about union type mismatches
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const currentList = getCurrentData();
    let newItem: any;
    
    if (editingItem) {
      newItem = { ...formData };
      const newList = currentList.map((item: any) => item.id === editingItem.id ? newItem : item);
      if (activeTab === 'teachers') setTeachers(newList as any);
      else if (activeTab === 'subjects') setSubjects(newList as any);
      else if (activeTab === 'classes') setClasses(newList as any);
      else setStudents(newList as any);
    } else {
      newItem = { ...formData, id: Math.random().toString(36).substr(2, 9) };
      if (activeTab === 'teachers') setTeachers([...currentList, newItem] as any);
      else if (activeTab === 'subjects') setSubjects([...currentList, newItem] as any);
      else if (activeTab === 'classes') setClasses([...currentList, newItem] as any);
      else setStudents([...currentList, newItem] as any);
    }
    
    syncWithSupabase(activeTab, newItem, 'save');
    setIsModalOpen(false);
  };

  // Fixed: Added type assertions to handle the list of items correctly after filtering
  const handleDelete = (id: string) => {
    if (!confirm('Hapus data ini?')) return;
    const currentList = getCurrentData();
    const newList = currentList.filter((item: any) => item.id !== id);
    if (activeTab === 'teachers') setTeachers(newList as any);
    else if (activeTab === 'subjects') setSubjects(newList as any);
    else if (activeTab === 'classes') setClasses(newList as any);
    else setStudents(newList as any);
    syncWithSupabase(activeTab, {id}, 'delete');
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
              className={`px-5 py-2.5 rounded-xl font-bold transition-all text-xs uppercase tracking-widest ${
                activeTab === tab ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-500 hover:bg-slate-100'
              }`}
            >
              {tab === 'teachers' && 'Guru'}
              {tab === 'subjects' && 'Mapel'}
              {tab === 'classes' && 'Kelas'}
              {tab === 'students' && 'Siswa'}
            </button>
          ))}
        </div>
        <button onClick={handleOpenAdd} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest shadow-xl flex items-center gap-2">
          <i className="fas fa-plus"></i> Tambah Data
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <th className="px-6 py-4">Data Utama</th>
                <th className="px-6 py-4">Keterangan</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.map((item: any) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-800 text-sm uppercase">{item.name}</td>
                  <td className="px-6 py-4 text-xs text-slate-500 font-medium">
                    {activeTab === 'teachers' ? `NIP: ${item.nip || '-'}` : activeTab === 'students' ? `NIS: ${item.nis || '-'}` : item.grade || '-'}
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <button onClick={() => handleOpenEdit(item)} className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center"><i className="fas fa-edit text-xs"></i></button>
                    <button onClick={() => handleDelete(item.id)} className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center"><i className="fas fa-trash text-xs"></i></button>
                  </td>
                </tr>
              ))}
              {data.length === 0 && <tr><td colSpan={3} className="p-20 text-center text-slate-300 italic">Belum ada data.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-blue-600 p-6 text-white flex justify-between items-center uppercase tracking-widest font-black text-xs">
              <span>{editingItem ? 'Edit Data' : 'Tambah Data Baru'}</span>
              <button onClick={() => setIsModalOpen(false)}><i className="fas fa-times"></i></button>
            </div>
            <form onSubmit={handleSave} className="p-8 space-y-4">
              <input type="text" placeholder="Nama Lengkap" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} required />
              {activeTab === 'teachers' && (
                <input type="text" placeholder="NIP" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold" value={formData.nip || ''} onChange={e => setFormData({...formData, nip: e.target.value})} />
              )}
              {activeTab === 'students' && (
                <input type="text" placeholder="NIS" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold" value={formData.nis || ''} onChange={e => setFormData({...formData, nis: e.target.value})} />
              )}
              <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-black uppercase text-xs tracking-widest">Simpan</button>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default ManagementPage;
