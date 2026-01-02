
import React, { useState } from 'react';
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

  // Simple Add Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState<any>({});

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const id = Math.random().toString(36).substr(2, 9);
    
    if (activeTab === 'teachers') setTeachers([...teachers, { ...formData, id }]);
    if (activeTab === 'subjects') setSubjects([...subjects, { ...formData, id }]);
    if (activeTab === 'classes') setClasses([...classes, { ...formData, id }]);
    if (activeTab === 'students') setStudents([...students, { ...formData, id }]);
    
    setIsAddOpen(false);
    setFormData({});
  };

  const handleDelete = (id: string) => {
    if (!confirm('Yakin ingin menghapus data ini?')) return;
    if (activeTab === 'teachers') setTeachers(teachers.filter(t => t.id !== id));
    if (activeTab === 'subjects') setSubjects(subjects.filter(s => s.id !== id));
    if (activeTab === 'classes') setClasses(classes.filter(c => c.id !== id));
    if (activeTab === 'students') setStudents(students.filter(s => s.id !== id));
  };

  return (
    <AdminLayout onLogout={onLogout}>
      <div className="mb-8 flex flex-wrap gap-2">
        {(['teachers', 'subjects', 'classes', 'students'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-xl font-bold transition-all ${
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

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
          <h4 className="font-bold text-slate-800">Daftar {activeTab}</h4>
          <button 
            onClick={() => { setIsAddOpen(true); setFormData({}); }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition"
          >
            <i className="fas fa-plus mr-2"></i> Tambah Baru
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Nama / Detail</th>
                <th className="px-6 py-4">Informasi Tambahan</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeTab === 'teachers' && teachers.map(t => (
                <tr key={t.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-800">{t.name}</p>
                    <p className="text-xs text-slate-500">ID: {t.id}</p>
                  </td>
                  <td className="px-6 py-4 text-slate-600 text-sm">NIP: {t.nip}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleDelete(t.id)} className="text-rose-500 hover:text-rose-700 p-2"><i className="fas fa-trash"></i></button>
                  </td>
                </tr>
              ))}
              {activeTab === 'subjects' && subjects.map(s => (
                <tr key={s.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-800">{s.name}</p>
                  </td>
                  <td className="px-6 py-4 text-slate-600 text-sm">ID Pelajaran: {s.id}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleDelete(s.id)} className="text-rose-500 hover:text-rose-700 p-2"><i className="fas fa-trash"></i></button>
                  </td>
                </tr>
              ))}
              {activeTab === 'classes' && classes.map(c => (
                <tr key={c.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-800">{c.name}</p>
                  </td>
                  <td className="px-6 py-4 text-slate-600 text-sm">Rombel ID: {c.id}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleDelete(c.id)} className="text-rose-500 hover:text-rose-700 p-2"><i className="fas fa-trash"></i></button>
                  </td>
                </tr>
              ))}
              {activeTab === 'students' && students.map(s => (
                <tr key={s.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-800">{s.name}</p>
                    <p className="text-xs text-slate-500">NIS: {s.nis}</p>
                  </td>
                  <td className="px-6 py-4 text-slate-600 text-sm">
                    Kelas: {classes.find(c => c.id === s.classId)?.name}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleDelete(s.id)} className="text-rose-500 hover:text-rose-700 p-2"><i className="fas fa-trash"></i></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 border border-slate-200">
            <h3 className="text-xl font-bold text-slate-800 mb-6">Tambah {activeTab}</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Nama</label>
                <input 
                  type="text" required 
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500" 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                />
              </div>

              {activeTab === 'teachers' && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">NIP</label>
                  <input 
                    type="text" required 
                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500" 
                    onChange={e => setFormData({...formData, nip: e.target.value})} 
                  />
                </div>
              )}

              {activeTab === 'students' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">NIS</label>
                    <input 
                      type="text" required 
                      className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500" 
                      onChange={e => setFormData({...formData, nis: e.target.value})} 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Kelas</label>
                    <select 
                      required 
                      className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500"
                      onChange={e => setFormData({...formData, classId: e.target.value})}
                    >
                      <option value="">-- Pilih Kelas --</option>
                      {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </>
              )}

              <div className="pt-6 flex gap-3">
                <button type="button" onClick={() => setIsAddOpen(false)} className="flex-1 px-4 py-2 border border-slate-200 rounded-lg font-bold text-slate-600 hover:bg-slate-50">Batal</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default ManagementPage;
