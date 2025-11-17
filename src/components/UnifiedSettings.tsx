import React, { useState, useEffect } from 'react';
import { X, Webhook, Bot, Users, Trash2, UserPlus } from 'lucide-react';
import { AIModel, Webhook as WebhookType } from '../types';
import { aiModelService, webhookService } from '../lib/adminService';
import { supabase } from '../lib/supabase';

interface UnifiedSettingsProps {
  onClose: () => void;
}

interface UserProfile {
  id: string;
  full_name: string;
  role: 'user' | 'admin';
  created_at: string;
}

export const UnifiedSettings: React.FC<UnifiedSettingsProps> = ({ onClose }) => {
  const [models, setModels] = useState<AIModel[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookType[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);

  const [editingModel, setEditingModel] = useState<Partial<AIModel> | null>(null);
  const [editingWebhook, setEditingWebhook] = useState<Partial<WebhookType> | null>(null);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserName, setNewUserName] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [modelsData, webhooksData] = await Promise.all([
        aiModelService.getAll(),
        webhookService.getAll(),
      ]);
      setModels(modelsData);
      setWebhooks(webhooksData);

      const { data: usersData } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersData) {
        setUsers(usersData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveModel = async () => {
    if (!editingModel || !editingModel.name) return;
    try {
      if (editingModel.id) {
        await aiModelService.update(editingModel.id, editingModel);
      } else {
        await aiModelService.create(editingModel as any);
      }
      setEditingModel(null);
      loadData();
    } catch (error) {
      console.error('Error saving model:', error);
      alert('Failed to save model');
    }
  };

  const handleSaveWebhook = async () => {
    if (!editingWebhook || !editingWebhook.model_id || !editingWebhook.url) return;
    try {
      if (editingWebhook.id) {
        await webhookService.update(editingWebhook.id, editingWebhook);
      } else {
        await webhookService.create(editingWebhook as any);
      }
      setEditingWebhook(null);
      loadData();
    } catch (error) {
      console.error('Error saving webhook:', error);
      alert('Failed to save webhook');
    }
  };

  const handleDeleteModel = async (id: string) => {
    if (!confirm('Delete this model? Associated webhooks will also be affected.')) return;
    try {
      await aiModelService.delete(id);
      loadData();
    } catch (error) {
      console.error('Error deleting model:', error);
    }
  };

  const handleDeleteWebhook = async (id: string) => {
    if (!confirm('Delete this webhook?')) return;
    try {
      await webhookService.delete(id);
      loadData();
    } catch (error) {
      console.error('Error deleting webhook:', error);
    }
  };

  const handleAddUser = async () => {
    if (!newUserEmail || !newUserPassword || !newUserName) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newUserEmail,
        password: newUserPassword,
      });

      if (authError) throw authError;

      if (authData.user) {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: authData.user.id,
            full_name: newUserName,
            role: 'user',
          });

        if (profileError) throw profileError;

        setNewUserEmail('');
        setNewUserPassword('');
        setNewUserName('');
        loadData();
        alert('User created successfully');
      }
    } catch (error: any) {
      console.error('Error creating user:', error);
      alert(`Failed to create user: ${error.message}`);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Delete this user? This action cannot be undone.')) return;

    try {
      const { error: profileError } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', userId);

      if (profileError) throw profileError;

      loadData();
      alert('User deleted successfully');
    } catch (error: any) {
      console.error('Error deleting user:', error);
      alert(`Failed to delete user: ${error.message}`);
    }
  };

  const handleToggleUserRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      loadData();
    } catch (error: any) {
      console.error('Error updating user role:', error);
      alert(`Failed to update user role: ${error.message}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-neutral-900 rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl border border-neutral-700">
        <div className="flex-1 overflow-y-auto p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-semibold text-white">Admin Settings</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-neutral-800 transition-colors"
            >
              <X size={20} className="text-neutral-400" />
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* AI Models Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Bot size={20} />
                    AI Models
                  </h3>
                  <button
                    onClick={() => setEditingModel({ name: '', description: '', use_case: 'general', icon: 'bot', is_active: true })}
                    className="px-4 py-2 bg-white text-black rounded-lg hover:bg-neutral-200 transition-colors text-sm font-medium"
                  >
                    Add Model
                  </button>
                </div>

                {/* Add/Edit Model Form */}
                {editingModel && (
                  <div className="bg-neutral-800 p-4 rounded-lg border border-neutral-700 mb-4">
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <input
                        type="text"
                        placeholder="Model Name"
                        value={editingModel.name || ''}
                        onChange={(e) => setEditingModel({ ...editingModel, name: e.target.value })}
                        className="px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-white text-sm"
                      />
                      <select
                        value={editingModel.use_case || 'general'}
                        onChange={(e) => setEditingModel({ ...editingModel, use_case: e.target.value as any })}
                        className="px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-white text-sm"
                      >
                        <option value="general">General</option>
                        <option value="code">Code</option>
                        <option value="content">Content</option>
                        <option value="analysis">Analysis</option>
                      </select>
                    </div>
                    <textarea
                      placeholder="Description"
                      value={editingModel.description || ''}
                      onChange={(e) => setEditingModel({ ...editingModel, description: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-white text-sm mb-3"
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <button onClick={() => setEditingModel(null)} className="px-3 py-1.5 rounded-lg bg-neutral-700 hover:bg-neutral-600 text-white text-sm">
                        Cancel
                      </button>
                      <button onClick={handleSaveModel} className="px-3 py-1.5 rounded-lg bg-white hover:bg-neutral-200 text-black text-sm font-medium">
                        Save Model
                      </button>
                    </div>
                  </div>
                )}

                {/* Models List */}
                <div className="space-y-2">
                  {models.map((model) => (
                    <div key={model.id} className="flex items-center justify-between p-3 rounded-lg bg-neutral-800 border border-neutral-700">
                      <div>
                        <p className="text-white font-medium">{model.name}</p>
                        <p className="text-sm text-neutral-400">{model.description}</p>
                        <p className="text-xs text-neutral-500 mt-1">Use case: {model.use_case}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setEditingModel(model)} className="px-3 py-1.5 rounded bg-neutral-700 hover:bg-neutral-600 text-white text-sm">
                          Edit
                        </button>
                        <button onClick={() => handleDeleteModel(model.id)} className="px-3 py-1.5 rounded bg-red-900/20 hover:bg-red-900/30 text-red-400 text-sm">
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Webhooks Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Webhook size={20} />
                    Webhooks
                  </h3>
                  <button
                    onClick={() => setEditingWebhook({ name: '', url: '', model_id: '', is_active: true, timeout_seconds: 30 })}
                    className="px-4 py-2 bg-white text-black rounded-lg hover:bg-neutral-200 transition-colors text-sm font-medium"
                  >
                    Add Webhook
                  </button>
                </div>

                {/* Add/Edit Webhook Form */}
                {editingWebhook && (
                  <div className="bg-neutral-800 p-4 rounded-lg border border-neutral-700 mb-4">
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <input
                        type="text"
                        placeholder="Webhook Name"
                        value={editingWebhook.name || ''}
                        onChange={(e) => setEditingWebhook({ ...editingWebhook, name: e.target.value })}
                        className="px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-white text-sm"
                      />
                      <select
                        value={editingWebhook.model_id || ''}
                        onChange={(e) => setEditingWebhook({ ...editingWebhook, model_id: e.target.value })}
                        className="px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-white text-sm"
                      >
                        <option value="">Select AI Model</option>
                        {models.map((model) => (
                          <option key={model.id} value={model.id}>{model.name}</option>
                        ))}
                      </select>
                    </div>
                    <input
                      type="url"
                      placeholder="Webhook URL (e.g., https://your-n8n-instance.com/webhook/...)"
                      value={editingWebhook.url || ''}
                      onChange={(e) => setEditingWebhook({ ...editingWebhook, url: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-white text-sm mb-3"
                    />
                    <div className="flex gap-2">
                      <button onClick={() => setEditingWebhook(null)} className="px-3 py-1.5 rounded-lg bg-neutral-700 hover:bg-neutral-600 text-white text-sm">
                        Cancel
                      </button>
                      <button onClick={handleSaveWebhook} className="px-3 py-1.5 rounded-lg bg-white hover:bg-neutral-200 text-black text-sm font-medium">
                        Save Webhook
                      </button>
                    </div>
                  </div>
                )}

                {/* Webhooks List */}
                <div className="space-y-2">
                  {webhooks.map((webhook) => {
                    const model = models.find(m => m.id === webhook.model_id);
                    return (
                      <div key={webhook.id} className="flex items-center justify-between p-3 rounded-lg bg-neutral-800 border border-neutral-700">
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium">{webhook.name}</p>
                          <p className="text-sm text-neutral-400 font-mono truncate">{webhook.url}</p>
                          {model && <p className="text-xs text-neutral-500 mt-1">Mapped to: {model.name}</p>}
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button onClick={() => setEditingWebhook(webhook)} className="px-3 py-1.5 rounded bg-neutral-700 hover:bg-neutral-600 text-white text-sm">
                            Edit
                          </button>
                          <button onClick={() => handleDeleteWebhook(webhook.id)} className="px-3 py-1.5 rounded bg-red-900/20 hover:bg-red-900/30 text-red-400 text-sm">
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* User Management Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Users size={20} />
                    User Management
                  </h3>
                </div>

                {/* Add User Form */}
                <div className="bg-neutral-800 p-4 rounded-lg border border-neutral-700 mb-4">
                  <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                    <UserPlus size={16} />
                    Add New User
                  </h4>
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      className="px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-white text-sm"
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      className="px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-white text-sm"
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      value={newUserPassword}
                      onChange={(e) => setNewUserPassword(e.target.value)}
                      className="px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-white text-sm"
                    />
                  </div>
                  <button
                    onClick={handleAddUser}
                    className="px-4 py-2 bg-white text-black rounded-lg hover:bg-neutral-200 transition-colors text-sm font-medium"
                  >
                    Create User
                  </button>
                </div>

                {/* Users List */}
                <div className="space-y-2">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 rounded-lg bg-neutral-800 border border-neutral-700">
                      <div>
                        <p className="text-white font-medium">{user.full_name}</p>
                        <p className="text-sm text-neutral-400 truncate max-w-md">{user.id}</p>
                        <p className="text-xs text-neutral-500 mt-1">
                          Created: {new Date(user.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleUserRole(user.id, user.role)}
                          className={`px-3 py-1.5 rounded text-sm font-medium ${
                            user.role === 'admin'
                              ? 'bg-yellow-900/20 text-yellow-400 hover:bg-yellow-900/30'
                              : 'bg-neutral-700 text-white hover:bg-neutral-600'
                          }`}
                        >
                          {user.role === 'admin' ? 'Admin' : 'User'}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-2 rounded hover:bg-red-900/20 text-red-400 transition-colors"
                          title="Delete user"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
