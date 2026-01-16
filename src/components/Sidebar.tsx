import React, { useMemo, useState } from 'react';
import { Plus, Trash2, Edit2, Check, X, Search, Pin, PinOff, LogOut, LayoutGrid, Clock } from 'lucide-react';
import { useChat } from '../contexts/ChatContext';
import { useAdmin } from '../contexts/AdminContext';
import { supabase } from '../lib/supabase';
import { DeleteChatDialog } from './DeleteChatDialog';

export const Sidebar: React.FC = () => {
  const {
    conversations,
    currentConversationId,
    createConversation,
    deleteConversation,
    renameConversation,
    setCurrentConversation,
    togglePinConversation,
  } = useChat();

  const { userProfile } = useAdmin();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const handleNewChat = async () => {
    await createConversation();
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPendingDeleteId(id);
  };

  const handleSaveEdit = async (id: string) => {
    if (editTitle.trim()) {
      await renameConversation(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const startEditing = (id: string, currentTitle: string) => {
    setEditingId(id);
    setEditTitle(currentTitle);
  };



  const handleLogout = async () => {
    if (confirm('Are you sure you want to log out?')) {
      await supabase.auth.signOut();
      window.location.reload();
    }
  };

  const filteredConversations = useMemo(() => {
    const lower = searchQuery.toLowerCase();
    return conversations.filter(conv => conv.title.toLowerCase().includes(lower));
  }, [conversations, searchQuery]);

  const pinned = filteredConversations.filter(conv => conv.is_pinned);
  const regular = filteredConversations.filter(conv => !conv.is_pinned);

  return (
    <aside className="hidden h-full min-h-0 w-[280px] flex-col border-r border-[color:var(--border)] bg-[color:var(--surface-contrast)] p-3 text-[color:var(--text-secondary)] lg:flex">
      {/* New Chat Button */}
      <button
        onClick={handleNewChat}
        className="mb-4 flex w-full items-center gap-3 rounded-lg border border-[color:var(--border)] bg-white p-3 text-sm font-semibold text-[color:var(--text-primary)] shadow-sm transition-all hover:border-blue-300 hover:shadow-md dark:bg-neutral-800 dark:hover:border-neutral-600"
      >
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
          <Plus size={14} strokeWidth={3} />
        </div>
        New Chat
      </button>

      {/* Navigation Links */}
      <div className="space-y-1 mb-6">
        <button className="nav-item">
          <LayoutGrid size={18} />
          <span>Library</span>
        </button>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--text-muted)]" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search . . ."
            className="w-full rounded-lg bg-transparent px-9 py-2 text-sm text-[color:var(--text-primary)] placeholder-[color:var(--text-muted)] focus:bg-[color:var(--panel-accent)] focus:outline-none"
          />
        </div>
      </div>

      {/* Conversation Lists */}
      <div className="flex-1 space-y-6 overflow-y-auto px-1 scrollbar-hide">
        {[{ label: 'Pinned', items: pinned, icon: Pin }, { label: 'Recent', items: regular, icon: Clock }].map(({ label, items, icon: Icon }) => (
          (items.length > 0 || label === 'Recent') && (
            <section key={label}>
              <div className="mb-2 flex items-center gap-2 px-3 text-xs font-bold uppercase tracking-wider text-[color:var(--text-muted)] opacity-70">
                <Icon size={11} className="stroke-[2.5]" />
                {label}
              </div>

              {items.length === 0 ? (
                <p className="px-4 text-xs italic text-[color:var(--text-muted)]">No chats yet</p>
              ) : (
                <ul className="space-y-1">
                  {items.map(conv => (
                    <li key={conv.id} className="relative group px-1">
                      {editingId === conv.id ? (
                        <div className="flex items-center gap-1 p-2 rounded-lg bg-[color:var(--surface)] ring-2 ring-blue-500/20 shadow-sm border border-[color:var(--border)]">
                          <input
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveEdit(conv.id);
                              if (e.key === 'Escape') setEditingId(null);
                            }}
                            className="flex-1 min-w-0 bg-transparent text-sm font-medium text-[color:var(--text-primary)] focus:outline-none"
                            autoFocus
                            placeholder="Conversation title..."
                          />
                          <button
                            onClick={() => handleSaveEdit(conv.id)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-1 text-[color:var(--text-muted)] hover:text-[color:var(--text-primary)] hover:bg-[color:var(--panel-accent)] rounded"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => setCurrentConversation(conv.id)}
                          className={`
                            group/card relative flex items-center justify-between rounded-lg px-3 py-2.5 cursor-pointer transition-all duration-200 border border-transparent
                            ${currentConversationId === conv.id
                              ? 'bg-white shadow-sm !border-[color:var(--border)] dark:bg-neutral-800'
                              : 'hover:bg-[color:var(--panel-accent)] hover:border-[color:var(--border)]'}
                          `}
                        >
                          <div className="flex flex-col flex-1 min-w-0 pr-16 max-w-full">
                            <span className={`text-sm truncate font-medium ${currentConversationId === conv.id ? 'text-[color:var(--text-primary)]' : 'text-[color:var(--text-secondary)] group-hover/card:text-[color:var(--text-primary)]'}`}>
                              {conv.title}
                            </span>
                          </div>

                          {/* Action Buttons - Visible on Hover */}
                          <div className={`
                            absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5
                            opacity-0 group-hover:opacity-100 transition-all duration-200
                            ${currentConversationId === conv.id ? 'opacity-100' : ''}
                          `}>
                            <div className="absolute inset-y-0 -left-6 w-6 bg-gradient-to-r from-transparent to-[color:var(--panel-accent)] pointer-events-none group-data-[active=true]:to-white dark:group-data-[active=true]:to-neutral-800" />

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                togglePinConversation(conv.id);
                              }}
                              className="p-1.5 rounded-md text-[color:var(--text-muted)] hover:text-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors"
                              title={conv.is_pinned ? "Unpin" : "Pin conversation"}
                            >
                              {conv.is_pinned ? <PinOff size={13} /> : <Pin size={13} />}
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                startEditing(conv.id, conv.title);
                              }}
                              className="p-1.5 rounded-md text-[color:var(--text-muted)] hover:text-[color:var(--text-primary)] hover:bg-[color:var(--panel-accent)] transition-colors"
                              title="Rename"
                            >
                              <Edit2 size={13} />
                            </button>

                            <button
                              onClick={(e) => handleDelete(conv.id, e)}
                              className="p-1.5 rounded-md text-[color:var(--text-muted)] hover:text-red-500 hover:bg-red-50/50 dark:hover:bg-red-900/20 transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )
        ))}
      </div>

      {/* User Footer */}
      {userProfile && (
        <div className="mt-4 border-t border-[color:var(--border)] pt-4">
          <div className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-[color:var(--panel-accent)]">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-purple-500 to-pink-500 text-sm font-bold text-white shadow-sm">
              {userProfile.full_name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium text-[color:var(--text-primary)]">{userProfile.full_name}</p>
              <p className="truncate text-xs text-[color:var(--text-muted)] capitalize">{userProfile.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-[color:var(--text-muted)] hover:text-[color:var(--danger)]"
              title="Log out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      )}

      <DeleteChatDialog
        isOpen={Boolean(pendingDeleteId)}
        conversationTitle={conversations.find(c => c.id === pendingDeleteId)?.title}
        onClose={() => setPendingDeleteId(null)}
        onConfirm={async () => {
          if (pendingDeleteId) {
            await deleteConversation(pendingDeleteId);
          }
        }}
      />
    </aside>
  );
};
