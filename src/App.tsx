import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { ThemeProvider } from './contexts/ThemeContext';
import { AdminProvider } from './contexts/AdminContext';
import { ChatProvider } from './contexts/ChatContext';
import { AuthForm } from './components/AuthForm';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ChatInterface } from './components/ChatInterface';
import { UnifiedSettings } from './components/UnifiedSettings';

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        setUser(session?.user ?? null);
      })();
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
          <div className="h-screen flex flex-col bg-neutral-950">
            {/* Header with theme toggle and settings (admin only) */}
            <Header onOpenSettings={() => setSettingsOpen(true)} />
            <div className="flex-1 flex overflow-hidden">
              {/* Sidebar - removed duplicate settings icon */}
              <Sidebar />
              <ChatInterface />
            </div>
            {/* Settings modal - only opens when admin clicks settings icon */}
            {settingsOpen && <UnifiedSettings onClose={() => setSettingsOpen(false)} />}
          </div>
        </ChatProvider>
      </AdminProvider>
    </ThemeProvider>
  );
}

export default App;
