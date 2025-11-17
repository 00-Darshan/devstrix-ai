import React, { useState } from 'react';
import { Plus, MessageSquare, Trash2, Edit2, Check, X, Search, BookOpen, LogOut } from 'lucide-react';
import { useChat } from '../contexts/ChatContext';
import { useAdmin } from '../contexts/AdminContext';
import { supabase } from '../lib/supabase';

export const Sidebar: React.FC = () => {
  const {
    conversations,
    currentConversationId,
    createConversation,
    deleteConversation,
    renameConversation,
    setCurrentConversation,
  } = useChat();

  const { userProfile } = useAdmin();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleNewChat = async () => {
    await createConversation();
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this conversation?')) {
      await deleteConversation(id);
    }
  };

  const handleEdit = (id: string, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(id);
    setEditTitle(currentTitle);
  };

  const handleSaveEdit = async (id: string) => {
    if (editTitle.trim()) {
      await renameConversation(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleLogout = async () => {
    if (confirm('Are you sure you want to log out?')) {
      await supabase.auth.signOut();
      window.location.reload();
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-64 bg-neutral-950 border-r border-neutral-800 flex flex-col h-full">
      {/* New Chat Button */}
      <div className="p-3">
        <button
          onClick={handleNewChat}
          className="w-full flex items-center gap-2 px-3 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg transition-colors border border-neutral-700"
        >
          <Plus size={18} />
          <span className="text-sm font-medium">New chat</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="px-3 mb-2">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            placeholder="Search chats"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-white text-sm placeholder-neutral-500 focus:outline-none focus:border-neutral-700"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto px-2 space-y-1">
        {filteredConversations.length === 0 ? (
          <div className="text-center text-neutral-500 text-sm py-8 px-4">
            {searchQuery ? 'No chats found' : 'No chats yet'}
          </div>
        ) : (
          filteredConversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => setCurrentConversation(conv.id)}
              className={`group relative px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                currentConversationId === conv.id
                  ? 'bg-neutral-800'
                  : 'hover:bg-neutral-900'
              }`}
            >
              {editingId === conv.id ? (
                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEdit(conv.id);
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                    className="flex-1 px-2 py-1 text-sm border border-neutral-700 rounded bg-neutral-900 text-white focus:outline-none"
                    autoFocus
                  />
                  <button
                    onClick={() => handleSaveEdit(conv.id)}
                    className="p-1 text-green-500 hover:bg-neutral-800 rounded"
                  >
                    <Check size={14} />
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="p-1 text-red-500 hover:bg-neutral-800 rounded"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <MessageSquare size={16} className="text-neutral-500 flex-shrink-0" />
                    <p className="text-sm text-white truncate flex-1">
                      {conv.title}
                    </p>
                  </div>

                  <div className="absolute right-2 top-2 hidden group-hover:flex gap-1">
                    <button
                      onClick={(e) => handleEdit(conv.id, conv.title, e)}
                      className="p-1 hover:bg-neutral-800 rounded"
                    >
                      <Edit2 size={14} className="text-neutral-400" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(conv.id, e)}
                      className="p-1 hover:bg-neutral-800 rounded"
                    >
                      <Trash2 size={14} className="text-neutral-400" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>

      {/* Bottom Section - Library, User Profile, and Logout */}
      <div className="border-t border-neutral-800 p-3 space-y-1">
        <button
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-neutral-900 transition-colors text-left"
        >
          <BookOpen size={18} className="text-neutral-400" />
          <span className="text-sm text-neutral-300">Library</span>
        </button>

        {/* User Profile */}
        {userProfile && (
          <div className="flex items-center justify-between px-3 py-2 mt-2 rounded-lg hover:bg-neutral-900">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-medium text-white">
                  {userProfile.full_name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{userProfile.full_name}</p>
                <p className="text-xs text-neutral-500 truncate">{userProfile.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 hover:bg-neutral-800 rounded transition-colors"
              title="Log out"
            >
              <LogOut size={16} className="text-neutral-400" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
