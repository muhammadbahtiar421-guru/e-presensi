
import React, { useState } from 'react';
import { ShieldCheck, Lock, User, GraduationCap, ChevronLeft, AlertCircle } from 'lucide-react';

interface LoginPageProps {
  onLogin: (role: 'ADMIN' | 'BK') => void;
  onBack: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onBack }) => {
  const [role, setRole] = useState<'ADMIN' | 'BK'>('ADMIN');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple authentication logic
    // Default: admin/admin123 or bk/bk123
    if (role === 'ADMIN' && username === 'admin' && password === 'admin123') {
      onLogin('ADMIN');
    } else if (role === 'BK' && username === 'bk' && password === 'bk123') {
      onLogin('BK');
    } else {
      setError('Username atau password salah untuk portal ini.');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e3a8a] via-[#1e40af] to-[#1d4ed8] flex items-center justify-center p-4">
      <div className="absolute top-8 left-8">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-white/70 hover:text-white font-bold transition-all text-sm group"
        >
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20">
            <ChevronLeft size={20} />
          </div>
          Kembali ke Presensi
        </button>
      </div>

      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="bg-slate-900 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-xl">
              <GraduationCap className="text-white" size={32} />
            </div>
            <h1 className="text-xl font-black text-white uppercase tracking-tight">Portal Keamanan</h1>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">SMAN 1 Kwanyar</p>
          </div>
        </div>

        <div className="p-8">
          <div className="flex bg-slate-100 p-1 rounded-2xl mb-8">
            <button 
              onClick={() => setRole('ADMIN')}
              className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${role === 'ADMIN' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
            >
              Administrator
            </button>
            <button 
              onClick={() => setRole('BK')}
              className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${role === 'BK' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500'}`}
            >
              Guru BK
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Username</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username..."
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-bold"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-bold"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-xl animate-in fade-in slide-in-from-top-1">
                <AlertCircle size={16} />
                <span className="text-xs font-bold">{error}</span>
              </div>
            )}

            <button 
              type="submit"
              className={`w-full py-4 rounded-2xl text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95 mt-4 ${role === 'ADMIN' ? 'bg-blue-600 shadow-blue-200 hover:bg-blue-700' : 'bg-orange-600 shadow-orange-200 hover:bg-orange-700'}`}
            >
              Masuk ke Dashboard
            </button>
          </form>

          <p className="text-center text-[10px] text-slate-400 font-bold mt-8 uppercase tracking-widest">
            Sistem Keamanan Terenkripsi
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
