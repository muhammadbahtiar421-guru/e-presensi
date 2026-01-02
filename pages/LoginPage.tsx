
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Teacher, User } from '../types';

interface LoginPageProps {
  teachers: Teacher[];
  adminCredentials: any;
  onLogin: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ teachers, adminCredentials, onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Check Admin with dynamic credentials
    if (username === adminCredentials.username && password === adminCredentials.password) {
      onLogin({ id: 'admin', username: adminCredentials.username, role: 'admin' });
      return;
    }

    // Check Teacher
    const teacher = teachers.find(t => t.username === username && t.password === password);
    if (teacher) {
      onLogin({ 
        id: teacher.id, 
        username: teacher.username || '', 
        role: 'teacher',
        teacherId: teacher.id 
      });
      return;
    }

    // Tampilan notifikasi salah yang simpel
    setError('Username atau password salah!');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-blue-800 text-white rounded-2xl flex items-center justify-center text-3xl shadow-xl">
            <i className="fas fa-lock"></i>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          Login Portal
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          SMAN 1 Kwanyar
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-slate-200">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-rose-100 border-l-4 border-rose-500 text-rose-700 px-4 py-3 rounded shadow-sm text-sm font-bold flex items-center gap-2 animate-shake">
                <i className="fas fa-exclamation-circle"></i>
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-slate-700">Username</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <i className="fas fa-user"></i>
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Username"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700">Password</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <i className="fas fa-key"></i>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-blue-800 hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
              >
                Sign In
              </button>
            </div>
          </form>
          
          <div className="mt-6 pt-6 border-t border-slate-100 flex justify-center">
            <Link to="/" className="text-sm font-medium text-blue-600 hover:text-blue-500 transition flex items-center gap-2">
              <i className="fas fa-arrow-left"></i> Kembali ke Presensi
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
