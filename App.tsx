import React, { useState, useEffect } from 'react';
import { AppState } from './types';
// Pastikan storage.ts sudah diupdate dengan fungsi Supabase yang baru
import { loadData, fetchDataFromSupabase, saveDataToSupabase } from './storage'; 
import Layout from './components/Layout';
import PublicPresence from './pages/PublicPresence';
import AdminDashboard from './pages/AdminDashboard';
import BKDashboard from './pages/BKDashboard';
import MasterData from './pages/MasterData';
import Reports from './pages/Reports';
import Monitoring from './pages/Monitoring';
import BackupRestore from './pages/BackupRestore';
import Settings from './pages/Settings';
import LoginPage from './pages/LoginPage';

const App: React.FC = () => {
  // Inisialisasi state dengan data default (kosong) dulu agar tidak error
  const [data, setData] = useState<AppState>(loadData());
  
  // State baru untuk indikator loading
  const [isLoading, setIsLoading] = useState(true);
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activePanel, setActivePanel] = useState<'PUBLIC' | 'ADMIN' | 'BK'>('PUBLIC');
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [showLogin, setShowLogin] = useState(false);

  // 1. FETCH DATA: Ambil data dari Supabase saat aplikasi pertama kali dibuka
  useEffect(() => {
    const initData = async () => {
      try {
        setIsLoading(true);
        const cloudData = await fetchDataFromSupabase();
        // Timpa data lokal dengan data dari cloud
        setData(cloudData);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initData();
  }, []);

  // 2. SAVE DATA: Simpan ke Supabase setiap kali 'data' berubah
  useEffect(() => {
    // Jangan simpan jika masih loading awal (mencegah data kosong menimpa database)
    if (!isLoading) {
      // Gunakan timeout (debounce) 1 detik agar tidak spam request ke server setiap ketikan
      const timer = setTimeout(() => {
        saveDataToSupabase(data);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [data, isLoading]);

  const handleAddPresence = (presence: any) => {
    setData(prev => ({
      ...prev,
      presences: [presence, ...prev.presences]
    }));
  };

  const handleUpdateData = (newData: AppState) => {
    setData(newData);
  };

  const handleLoginSuccess = (role: 'ADMIN' | 'BK') => {
    setIsLoggedIn(true);
    setActivePanel(role);
    setActiveView(role === 'BK' ? 'bk_dashboard' : 'dashboard');
    setShowLogin(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActivePanel('PUBLIC');
    setActiveView('dashboard');
  };

  // Tampilan saat sedang memuat data dari internet
  if (isLoading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-50 text-slate-600">
        <svg className="h-10 w-10 animate-spin text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="font-medium">Menghubungkan ke Database...</p>
      </div>
    );
  }

  // Tampilan Login
  if (showLogin) {
    return <LoginPage onLogin={handleLoginSuccess} onBack={() => setShowLogin(false)} />;
  }

  // Tampilan Publik (Siswa Presensi)
  if (activePanel === 'PUBLIC') {
    return (
      <PublicPresence 
        data={data} 
        onAddPresence={handleAddPresence} 
        onOpenAdmin={() => setShowLogin(true)} 
      />
    );
  }

  // Tampilan Admin / BK
  return (
    <Layout 
      activePanel={activePanel} 
      activeView={activeView}
      onViewChange={setActiveView}
      onLogout={handleLogout}
    >
      {(() => {
        if (activePanel === 'ADMIN') {
          switch (activeView) {
            case 'dashboard': return <AdminDashboard data={data} onUpdate={handleUpdateData} />;
            case 'master_guru': return <MasterData type="teacher" data={data} onUpdate={handleUpdateData} />;
            case 'master_siswa': return <MasterData type="student" data={data} onUpdate={handleUpdateData} />;
            case 'master_kelas': return <MasterData type="class" data={data} onUpdate={handleUpdateData} />;
            case 'master_mapel': return <MasterData type="subject" data={data} onUpdate={handleUpdateData} />;
            case 'laporan': return <Reports data={data} />;
            case 'monitoring': return <Monitoring data={data} onUpdate={handleUpdateData} />;
            case 'backup': return <BackupRestore data={data} onUpdate={handleUpdateData} />;
            case 'settings': return <Settings data={data} onUpdate={handleUpdateData} />;
            default: return <AdminDashboard data={data} onUpdate={handleUpdateData} />;
          }
        }
        // Panel BK
        return <BKDashboard data={data} onUpdate={handleUpdateData} />;
      })()}
    </Layout>
  );
};

export default App;