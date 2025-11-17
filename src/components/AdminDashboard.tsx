import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Edit2, Power, PowerOff, Save, Loader2 } from 'lucide-react';
import { AIModel, Webhook, AdminStats } from '../types';
import { aiModelService, webhookService, analyticsService } from '../lib/adminService';

interface AdminDashboardProps {
  onClose: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'models' | 'webhooks'>('stats');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [models, setModels] = useState<AIModel[]>([]);
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingModel, setEditingModel] = useState<Partial<AIModel> | null>(null);
  const [editingWebhook, setEditingWebhook] = useState<Partial<Webhook> | null>(null);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'stats') {
        const statsData = await analyticsService.getAdminStats();
        setStats(statsData);
      } else if (activeTab === 'models') {
        const modelsData = await aiModelService.getAll();
        setModels(modelsData);
      } else if (activeTab === 'webhooks') {
        const webhooksData = await webhookService.getAll();
        setWebhooks(webhooksData);
        if (models.length === 0) {
          const modelsData = await aiModelService.getAll();
          setModels(modelsData);
        }
      }
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveModel = async () => {
    if (!editingModel) return;

    try {
      if (editingModel.id) {
        await aiModelService.update(editingModel.id, editingModel);
      } else {
        await aiModelService.create(editingModel as Omit<AIModel, 'id' | 'created_at' | 'updated_at'>);
      }
      setEditingModel(null);
      loadData();
    } catch (error) {
      console.error('Error saving model:', error);
      alert('Failed to save model');
    }
  };

  const handleDeleteModel = async (id: string) => {
    if (!confirm('Are you sure you want to delete this model?')) return;

    try {
      await aiModelService.delete(id);
      loadData();
    } catch (error) {
      console.error('Error deleting model:', error);
      alert('Failed to delete model');
    }
  };

  const handleToggleModel = async (model: AIModel) => {
    try {
      await aiModelService.update(model.id, { is_active: !model.is_active });
      loadData();
    } catch (error) {
      console.error('Error toggling model:', error);
    }
  };

  const handleSaveWebhook = async () => {
    if (!editingWebhook || !editingWebhook.model_id) return;

    try {
      if (editingWebhook.id) {
        await webhookService.update(editingWebhook.id, editingWebhook);
      } else {
        await webhookService.create(editingWebhook as Omit<Webhook, 'id' | 'created_at' | 'updated_at'>);
      }
      setEditingWebhook(null);
      loadData();
    } catch (error) {
      console.error('Error saving webhook:', error);
      alert('Failed to save webhook');
    }
  };

  const handleDeleteWebhook = async (id: string) => {
    if (!confirm('Are you sure you want to delete this webhook?')) return;

    try {
      await webhookService.delete(id);
      loadData();
    } catch (error) {
      console.error('Error deleting webhook:', error);
      alert('Failed to delete webhook');
    }
  };

  const handleToggleWebhook = async (webhook: Webhook) => {
    try {
      await webhookService.update(webhook.id, { is_active: !webhook.is_active });
      loadData();
    } catch (error) {
      console.error('Error toggling webhook:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Admin Dashboard</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <X size={20} className="text-slate-600 dark:text-slate-400" />
          </button>
        </div>

        <div className="flex border-b border-slate-200 dark:border-slate-700">
          {['stats', 'models', 'webhooks'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-6 py-3 font-medium capitalize transition-colors ${
                activeTab === tab
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="animate-spin text-blue-600" size={32} />
            </div>
          ) : activeTab === 'stats' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <StatCard label="Total Users" value={stats?.totalUsers || 0} />
              <StatCard label="Total Conversations" value={stats?.totalConversations || 0} />
              <StatCard label="Total Messages" value={stats?.totalMessages || 0} />
              <StatCard label="Active Models" value={stats?.activeModels || 0} />
              <StatCard label="Total Tokens Used" value={stats?.totalTokensUsed.toLocaleString() || 0} />
              <StatCard label="Avg Response Time" value={`${stats?.avgResponseTime || 0}ms`} />
            </div>
          ) : activeTab === 'models' ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">AI Models</h3>
                <button
                  onClick={() => setEditingModel({ name: '', description: '', use_case: 'general', icon: 'bot', is_active: true })}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus size={18} />
                  Add Model
                </button>
              </div>

              {editingModel && (
                <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg border-2 border-blue-500">
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
                    {editingModel.id ? 'Edit Model' : 'New Model'}
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Model Name"
                      value={editingModel.name || ''}
                      onChange={(e) => setEditingModel({ ...editingModel, name: e.target.value })}
                      className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    />
                    <select
                      value={editingModel.use_case || 'general'}
                      onChange={(e) => setEditingModel({ ...editingModel, use_case: e.target.value as any })}
                      className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    >
                      <option value="general">General</option>
                      <option value="code">Code</option>
                      <option value="content">Content</option>
                      <option value="analysis">Analysis</option>
                      <option value="image">Image</option>
                      <option value="other">Other</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Icon Name"
                      value={editingModel.icon || ''}
                      onChange={(e) => setEditingModel({ ...editingModel, icon: e.target.value })}
                      className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    />
                    <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <input
                        type="checkbox"
                        checked={editingModel.is_active || false}
                        onChange={(e) => setEditingModel({ ...editingModel, is_active: e.target.checked })}
                        className="w-4 h-4"
                      />
                      Active
                    </label>
                    <textarea
                      placeholder="Description"
                      value={editingModel.description || ''}
                      onChange={(e) => setEditingModel({ ...editingModel, description: e.target.value })}
                      className="col-span-2 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <button
                      onClick={() => setEditingModel(null)}
                      className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveModel}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Save size={18} />
                      Save
                    </button>
                  </div>
                </div>
              )}

              <div className="grid gap-4">
                {models.map((model) => (
                  <div
                    key={model.id}
                    className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="font-semibold text-slate-900 dark:text-slate-100">{model.name}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          model.is_active
                            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                        }`}>
                          {model.is_active ? 'Active' : 'Inactive'}
                        </span>
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                          {model.use_case}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{model.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleModel(model)}
                        className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        title={model.is_active ? 'Deactivate' : 'Activate'}
                      >
                        {model.is_active ? (
                          <Power size={18} className="text-green-600" />
                        ) : (
                          <PowerOff size={18} className="text-gray-600" />
                        )}
                      </button>
                      <button
                        onClick={() => setEditingModel(model)}
                        className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      >
                        <Edit2 size={18} className="text-blue-600" />
                      </button>
                      <button
                        onClick={() => handleDeleteModel(model.id)}
                        className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      >
                        <Trash2 size={18} className="text-red-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Webhooks</h3>
                <button
                  onClick={() => setEditingWebhook({ name: '', url: '', model_id: '', is_active: true, timeout_seconds: 30 })}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus size={18} />
                  Add Webhook
                </button>
              </div>

              {editingWebhook && (
                <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg border-2 border-blue-500">
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
                    {editingWebhook.id ? 'Edit Webhook' : 'New Webhook'}
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Webhook Name"
                      value={editingWebhook.name || ''}
                      onChange={(e) => setEditingWebhook({ ...editingWebhook, name: e.target.value })}
                      className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    />
                    <select
                      value={editingWebhook.model_id || ''}
                      onChange={(e) => setEditingWebhook({ ...editingWebhook, model_id: e.target.value })}
                      className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    >
                      <option value="">Select Model</option>
                      {models.map((model) => (
                        <option key={model.id} value={model.id}>{model.name}</option>
                      ))}
                    </select>
                    <input
                      type="url"
                      placeholder="Webhook URL"
                      value={editingWebhook.url || ''}
                      onChange={(e) => setEditingWebhook({ ...editingWebhook, url: e.target.value })}
                      className="col-span-2 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    />
                    <input
                      type="text"
                      placeholder="API Key (optional)"
                      value={editingWebhook.api_key || ''}
                      onChange={(e) => setEditingWebhook({ ...editingWebhook, api_key: e.target.value })}
                      className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    />
                    <input
                      type="number"
                      placeholder="Timeout (seconds)"
                      value={editingWebhook.timeout_seconds || 30}
                      onChange={(e) => setEditingWebhook({ ...editingWebhook, timeout_seconds: parseInt(e.target.value) })}
                      className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                      min="1"
                      max="300"
                    />
                    <label className="col-span-2 flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <input
                        type="checkbox"
                        checked={editingWebhook.is_active || false}
                        onChange={(e) => setEditingWebhook({ ...editingWebhook, is_active: e.target.checked })}
                        className="w-4 h-4"
                      />
                      Active
                    </label>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <button
                      onClick={() => setEditingWebhook(null)}
                      className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveWebhook}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Save size={18} />
                      Save
                    </button>
                  </div>
                </div>
              )}

              <div className="grid gap-4">
                {webhooks.map((webhook) => {
                  const model = models.find(m => m.id === webhook.model_id);
                  return (
                    <div
                      key={webhook.id}
                      className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h4 className="font-semibold text-slate-900 dark:text-slate-100">{webhook.name}</h4>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            webhook.is_active
                              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                              : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                          }`}>
                            {webhook.is_active ? 'Active' : 'Inactive'}
                          </span>
                          {model && (
                            <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                              {model.name}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 font-mono">{webhook.url}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">Timeout: {webhook.timeout_seconds}s</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleWebhook(webhook)}
                          className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                          title={webhook.is_active ? 'Deactivate' : 'Activate'}
                        >
                          {webhook.is_active ? (
                            <Power size={18} className="text-green-600" />
                          ) : (
                            <PowerOff size={18} className="text-gray-600" />
                          )}
                        </button>
                        <button
                          onClick={() => setEditingWebhook(webhook)}
                          className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                          <Edit2 size={18} className="text-blue-600" />
                        </button>
                        <button
                          onClick={() => handleDeleteWebhook(webhook.id)}
                          className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                          <Trash2 size={18} className="text-red-600" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  label: string;
  value: string | number;
}

const StatCard: React.FC<StatCardProps> = ({ label, value }) => (
  <div className="bg-gradient-to-br from-blue-50 to-teal-50 dark:from-slate-900 dark:to-slate-800 p-6 rounded-xl border border-blue-200 dark:border-slate-700">
    <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">{label}</p>
    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{value}</p>
  </div>
);
