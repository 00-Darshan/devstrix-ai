import React from 'react';
import { Settings, Moon, Sun } from 'lucide-react';
import { useAdmin } from '../contexts/AdminContext';
import { useTheme } from '../contexts/ThemeContext';
import { useChat } from '../contexts/ChatContext';
import { ModelSelector } from './ModelSelector';
import logoMark from '../assets/devstrix-logo.svg';

interface HeaderProps {
  onOpenSettings?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings }) => {
  const { isAdmin } = useAdmin();
  const { theme, toggleTheme } = useTheme();
  const { selectedModel, availableModels, setSelectedModel } = useChat();

  return (
    <header className="sticky top-0 z-20 flex w-full items-center justify-between border-b border-[color:var(--border)] bg-[color:var(--surface)]/80 px-4 py-3 backdrop-blur-md">
      {/* Left: Brand */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-md text-white">
          <img src={logoMark} alt="Logo" className="h-6 w-6 brightness-200 invert" />
        </div>
        <div className="hidden flex-col leading-tight sm:flex">
          <span className="text-lg font-bold tracking-tight text-[color:var(--text-primary)]">DevstriX</span>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-[color:var(--text-muted)]">Workspace</span>
        </div>
      </div>

      {/* Center: Model Selector */}
      <div className="flex flex-1 justify-center max-w-sm px-4">
        {availableModels.length > 0 && selectedModel ? (
          <ModelSelector
            selectedModel={selectedModel}
            models={availableModels}
            onChange={setSelectedModel}
            compact={true}
          />
        ) : (
          isAdmin && <span className="text-xs text-amber-500 font-medium">No models configured</span>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1">
        <button
          onClick={toggleTheme}
          className="btn-ghost rounded-full p-2.5 text-[color:var(--text-muted)] hover:text-[color:var(--text-primary)]"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        
        {isAdmin && (
          <button
            onClick={onOpenSettings}
            className="btn-ghost rounded-full p-2.5 text-[color:var(--text-muted)] hover:text-[color:var(--text-primary)]"
            aria-label="Settings"
          >
            <Settings size={20} />
          </button>
        )}
      </div>
    </header>
  );
};
