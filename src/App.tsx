import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { ThemeProvider } from './contexts/ThemeContext';
import { AdminProvider } from './contexts/AdminContext';
import { ChatProvider } from './contexts/ChatContext';
import { AuthForm } from './components/AuthForm';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ChatInterface } from './components/ChatInterface';
import { AdminDashboard } from './components/AdminDashboard';
import { SettingsPanel } from './components/SettingsPanel';
import { useAdmin } from './contexts/AdminContext';

function AppContent() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [adminDashboardOpen, setAdminDashboardOpen] = useState(false);
  const { isAdmin } = useAdmin();

  const handleOpenSettings = () => {
    if (isAdmin) {
      setAdminDashboardOpen(true);
    } else {
      setSettingsOpen(true);
    }
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[color:var(--surface)] text-[color:var(--text)]">
      <Header onOpenSettings={handleOpenSettings} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <ChatInterface />
      </div>
      {adminDashboardOpen && <AdminDashboard onClose={() => setAdminDashboardOpen(false)} />}
      {settingsOpen && <SettingsPanel isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />}
    </div>
  );
}

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <ThemeProvider>
        <AuthForm />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <AdminProvider>
        <ChatProvider>
          <AppContent />
        </ChatProvider>
      </AdminProvider>
    </ThemeProvider>
  );
}

export default App;

