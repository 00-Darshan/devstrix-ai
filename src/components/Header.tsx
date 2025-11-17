import React from 'react';
import { Settings, ChevronDown, Moon, Sun } from 'lucide-react';
import { useAdmin } from '../contexts/AdminContext';
import { useTheme } from '../contexts/ThemeContext';
import { useChat } from '../contexts/ChatContext';

interface HeaderProps {
  onOpenSettings?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings }) => {
  const { isAdmin } = useAdmin();
  const { theme, toggleTheme } = useTheme();
  const { selectedModel, availableModels, setSelectedModel } = useChat();

  return (
    <header className="bg-neutral-900 dark:bg-neutral-900 border-b border-neutral-800 dark:border-neutral-800 light:bg-neutral-100 light:border-neutral-300 px-4 py-3">
      <div className="flex items-center justify-between max-w-full">
        <div className="flex items-center gap-4">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <img
              src="https://shyparciytigoyiodpsr.supabase.co/storage/v1/object/public/company-logos/image.png"
              alt="Logo"
              className="w-8 h-8 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <h1 className="text-2xl font-bold text-white tracking-tight">DevstriX</h1>
          </div>

          {/* Model Selector */}
          {availableModels.length > 0 ? (
            selectedModel ? (
              <div className="flex items-center gap-2 px-3 py-2 bg-neutral-800 rounded-lg border border-neutral-700 ml-4">
                <span className="text-xs text-neutral-400">Model:</span>
                <span className="text-sm font-medium text-white">{selectedModel.name}</span>
                {availableModels.length > 1 && (
                  <button
                    onClick={() => {
                      const currentIndex = availableModels.findIndex(m => m.id === selectedModel.id);
                      const nextIndex = (currentIndex + 1) % availableModels.length;
                      setSelectedModel(availableModels[nextIndex]);
                    }}
                    className="p-1 hover:bg-neutral-700 rounded transition-colors"
                    title="Switch model"
                  >
                    <ChevronDown size={14} className="text-neutral-400" />
                  </button>
                )}
              </div>
            ) : (
              <div className="px-3 py-2 bg-yellow-900/20 rounded-lg border border-yellow-800 ml-4">
                <span className="text-sm text-yellow-400">No model selected</span>
              </div>
            )
          ) : isAdmin ? (
            <div className="px-3 py-2 bg-red-900/20 rounded-lg border border-red-800 ml-4">
              <span className="text-sm text-red-400">No models configured - Configure in settings</span>
            </div>
          ) : (
            <div className="px-3 py-2 bg-red-900/20 rounded-lg border border-red-800 ml-4">
              <span className="text-sm text-red-400">No models available - Contact admin</span>
            </div>
          )}
        </div>

        {/* Right side controls - Theme Toggle and Settings */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-neutral-800 transition-colors"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <Sun size={18} className="text-neutral-400 hover:text-white transition-colors" />
            ) : (
              <Moon size={18} className="text-neutral-400 hover:text-white transition-colors" />
            )}
          </button>

          {/* Settings Button - Only show for admins */}
          {isAdmin && (
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-lg hover:bg-neutral-800 transition-colors"
              title="Settings"
            >
              <Settings size={18} className="text-neutral-400" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
