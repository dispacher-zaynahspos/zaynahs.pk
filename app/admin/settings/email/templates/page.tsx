'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, Edit, Eye, Check, X, Mail, RotateCcw } from '@/components/common/Icons';
import { Modal } from '@/components/common/Modal';
import { useConfirm } from '@/components/admin/shared/AdminConfirmProvider';
import { toast } from 'sonner';

interface EmailTemplate {
  id: string;
  email_type?: string;
  emailType?: string;
  category: 'customer' | 'admin';
  label: string;
  description?: string;
  enabled: boolean;
  subject: string;
  custom_html?: string;
  customHtml?: string;
  updated_at?: string;
  updatedAt?: string;
}

export default function EmailTemplatesPage() {
  const { confirm } = useConfirm();
  const [templates, setTemplates] = useState<Record<string, EmailTemplate[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Preview Modal States
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
  const [previewContent, setPreviewContent] = useState<{ subject: string; html: string } | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/email-templates');
      const data = await res.json();
      if (data.success) {
        setTemplates(data.templates || {});
      } else {
        setError(data.error || 'Failed to fetch templates');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred while loading templates');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleEnable = async (type: string, currentStatus: boolean) => {
    // Optimistic UI update
    const prevTemplates = { ...templates };
    const updated = { ...templates };
    for (const cat in updated) {
      updated[cat] = updated[cat].map(t => 
        (t.email_type === type || t.emailType === type) ? { ...t, enabled: !currentStatus } : t
      );
    }
    setTemplates(updated);

    try {
      const res = await fetch(`/api/email-templates/${type}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !currentStatus })
      });
      const data = await res.json();
      if (!data.success) {
        // Rollback
        setTemplates(prevTemplates);
        toast.error(data.error || 'Failed to update status');
      } else {
        toast.success(`Template ${!currentStatus ? 'enabled' : 'disabled'} successfully`);
      }
    } catch (err: unknown) {
      setTemplates(prevTemplates);
      toast.error(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  const handleBulkToggleCategory = async (category: string, enable: boolean) => {
    const list = templates[category] || [];
    if (list.length === 0) return;

    // Optimistic UI update
    const prevTemplates = { ...templates };
    const updated = {
      ...templates,
      [category]: list.map(t => ({ ...t, enabled: enable }))
    };
    setTemplates(updated);

    try {
      const promises = list.map(t => {
        const type = t.email_type || t.emailType;
        if (!type) return Promise.resolve();
        return fetch(`/api/email-templates/${type}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ enabled: enable })
        });
      });
      await Promise.all(promises);
      toast.success(`All ${category === 'customer' ? 'Customer' : 'Admin'} templates ${enable ? 'enabled' : 'disabled'}`);
    } catch (err: unknown) {
      setTemplates(prevTemplates);
      toast.error('Failed to update templates');
    }
  };

  const handleResetSingleTemplate = async (type: string, label: string) => {
    const confirmed = await confirm({
      title: `Reset ${label}?`,
      message: 'This will discard your custom HTML template and restore the built-in theme-linked default layout and subject. Continue?',
      variant: 'warning',
      confirmText: 'Reset to Default'
    });
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/email-templates/${type}?action=reset`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`${label} reset to default successfully`);
        setTemplates(prev => {
          const updated = { ...prev };
          for (const cat in updated) {
            updated[cat] = updated[cat].map(t =>
              (t.email_type === type || t.emailType === type)
                ? { ...t, custom_html: undefined, customHtml: undefined, subject: data.template?.subject || t.subject }
                : t
            );
          }
          return updated;
        });
      } else {
        toast.error(data.error || 'Failed to reset template');
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error resetting template');
    }
  };

  const handleResetCategoryToDefault = async (category: string) => {
    const catLabel = category === 'customer' ? 'Customer Templates' : 'Admin Alerts';
    const confirmed = await confirm({
      title: `Reset All ${catLabel}?`,
      message: `This will reset all ${catLabel} back to their built-in default layouts and subjects. Continue?`,
      variant: 'warning',
      confirmText: 'Reset All'
    });
    if (!confirmed) return;

    try {
      const res = await fetch('/api/email-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset-all', category })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || `All ${catLabel} reset to default`);
        await fetchTemplates();
      } else {
        toast.error(data.error || 'Failed to reset templates');
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error resetting templates');
    }
  };

  const handleOpenPreview = async (template: EmailTemplate) => {
    const type = template.email_type || template.emailType || '';
    if (!type) {
      toast.error('Invalid template type');
      return;
    }
    setPreviewTemplate(template);
    setPreviewContent(null);
    setPreviewLoading(true);
    try {
      const isCustom = Boolean(template.custom_html || template.customHtml);
      const res = await fetch(`/api/email-templates/${type}/preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDefaultMode: !isCustom })
      });
      const data = await res.json();
      if (data.success) {
        setPreviewContent({ subject: data.subject, html: data.html });
      } else {
        toast.error(data.error || 'Failed to generate preview');
        setPreviewTemplate(null);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to generate preview');
      setPreviewTemplate(null);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleSendTest = async () => {
    if (!previewTemplate) return;
    const type = previewTemplate.email_type || previewTemplate.emailType || '';
    if (!type) {
      toast.error('Invalid template type');
      return;
    }
    try {
      setSendingTest(true);
      const res = await fetch(`/api/email-templates/${type}/send-test`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || 'Test email dispatched successfully!');
      } else {
        toast.error(data.error || 'Failed to send test email');
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to send test email');
    } finally {
      setSendingTest(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl">
        <div className="flex items-center gap-3">
          <a href="/admin/settings" className="p-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
            <ChevronLeft className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </a>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Email Notification Templates</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Customize subjects, HTML code and triggers</p>
          </div>
        </div>
        
        {/* Skeleton Loaders */}
        <div className="space-y-8">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white dark:bg-[#16162a] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
              <div className="h-5 w-48 bg-gray-200 dark:bg-gray-800 rounded-md animate-pulse"></div>
              <div className="space-y-3">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="h-16 w-full bg-gray-100 dark:bg-gray-800/50 rounded-xl animate-pulse"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 max-w-5xl">
        <div className="flex items-center gap-3">
          <a href="/admin/settings" className="p-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
            <ChevronLeft className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </a>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Error</h1>
        </div>
        <div className="bg-red-55/10 border border-red-200 dark:border-red-900/50 p-6 rounded-2xl text-center">
          <p className="text-sm font-semibold text-red-600 dark:text-red-400">{error}</p>
          <button onClick={fetchTemplates} className="mt-4 px-4 py-2 bg-[#e94560] text-white rounded-xl text-xs font-bold transition-all">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl pb-16">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <a href="/admin/settings" className="p-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
            <ChevronLeft className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </a>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Email Notification Templates</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Customize subjects, HTML layouts, and email notifications</p>
          </div>
        </div>
      </div>

      {/* Categories */}
      {['customer', 'admin'].map((category) => {
        const list = templates[category] || [];
        if (list.length === 0) return null;
        return (
          <div key={category} className="bg-white dark:bg-[#16162a] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-black text-[#e94560] uppercase tracking-wider">
                  {category === 'customer' ? 'Customer Emails' : 'Admin Alerts'}
                </h2>
                {category === 'admin' && (
                  <span className="text-[10px] font-medium bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full">
                    Default: OFF
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleBulkToggleCategory(category, true)}
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  Enable All
                </button>
                <span className="text-gray-300 dark:text-gray-700">|</span>
                <button
                  onClick={() => handleBulkToggleCategory(category, false)}
                  className="text-xs font-semibold text-rose-500 hover:text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                >
                  Disable All
                </button>
                <span className="text-gray-300 dark:text-gray-700">|</span>
                <button
                  onClick={() => handleResetCategoryToDefault(category)}
                  className="text-xs font-semibold text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white hover:underline cursor-pointer flex items-center gap-1"
                >
                  <RotateCcw className="h-3 w-3" />
                  Reset All
                </button>
              </div>
            </div>
            <div className="divide-y divide-gray-150 dark:divide-gray-800">
              {list.map((template) => {
                const type = template.email_type || template.emailType || '';
                const isCustom = Boolean(template.custom_html || template.customHtml);
                return (
                  <div key={type || template.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 first:pt-0 last:pb-0 gap-4">
                    <div className="space-y-1 max-w-xl">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="text-sm font-bold text-gray-900 dark:text-white">{template.label}</span>
                        <span className="text-[10px] bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full text-gray-500 dark:text-gray-400 font-bold font-mono uppercase">
                          {type}
                        </span>
                        {isCustom ? (
                          <span className="text-[10px] bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full font-bold">
                            Custom HTML
                          </span>
                        ) : (
                          <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                            Default (Theme Linked)
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                        {template.description || 'No description provided'}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 self-end sm:self-center">
                      {/* Toggle Switch */}
                      <button
                        onClick={() => handleToggleEnable(type, template.enabled)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          template.enabled ? 'bg-[#10b981]' : 'bg-gray-200 dark:bg-gray-800'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            template.enabled ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>

                      <div className="flex gap-2">
                        {isCustom && (
                          <button
                            onClick={() => handleResetSingleTemplate(type, template.label)}
                            className="flex items-center justify-center p-2 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-all cursor-pointer"
                            title="Reset to default theme-linked template"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenPreview(template)}
                          className="flex items-center justify-center p-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-all cursor-pointer"
                          title="Preview template"
                        >
                          <Eye className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        </button>
                        <a
                          href={`/admin/settings/email/templates/${type}`}
                          className="flex items-center justify-center p-2 rounded-xl bg-[#1a1a2e] dark:bg-[#e94560] text-white hover:opacity-90 transition-all cursor-pointer"
                          title="Edit template"
                        >
                          <Edit className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Preview Modal */}
      {previewTemplate && (
        <Modal
          open={true}
          onClose={() => setPreviewTemplate(null)}
          variant="sheet"
          size="lg"
          showClose={false}
          className="!bg-transparent !border-0 !shadow-none !rounded-none !overflow-visible !max-h-[92dvh] sm:!max-h-[90vh]"
        >
          <div className="bg-white dark:bg-[#16162a] w-full rounded-t-3xl sm:rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl flex flex-col max-h-[92dvh] sm:max-h-[85vh] overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-800">
              <div>
                <h3 className="text-base font-black text-gray-900 dark:text-white">
                  Preview: {previewTemplate.label}
                </h3>
                {previewContent && (
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 truncate">
                    Subject: <span className="font-semibold text-gray-750 dark:text-gray-300">{previewContent.subject}</span>
                  </p>
                )}
              </div>
              <button 
                onClick={() => setPreviewTemplate(null)}
                aria-label="Close preview"
                className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl text-gray-500 dark:text-gray-400 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body / Iframe */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-gray-50 dark:bg-black/20 flex flex-col justify-center min-h-[300px]">
              {previewLoading ? (
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#e94560]"></div>
                  <p className="text-xs text-gray-500 font-semibold">Generating template mock preview...</p>
                </div>
              ) : previewContent ? (
                <iframe
                  title="Email Preview"
                  srcDoc={previewContent.html}
                  className="w-full h-[450px] border border-gray-200 dark:border-gray-800 rounded-xl bg-white"
                />
              ) : (
                <div className="text-center py-8">
                  <p className="text-xs text-gray-500 font-semibold">Failed to load preview details.</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 sm:px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#111122] pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
              <button
                onClick={handleSendTest}
                disabled={sendingTest || !previewContent}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 rounded-xl border border-gray-250 dark:border-gray-850 bg-white dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 px-5 py-2.5 min-h-[44px] sm:min-h-0 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
              >
                <Mail className="h-3.5 w-3.5" />
                <span>{sendingTest ? 'Sending Test...' : 'Send Test to My Email'}</span>
              </button>
              <button
                onClick={() => setPreviewTemplate(null)}
                className="flex-1 sm:flex-initial flex items-center justify-center rounded-xl bg-[#1a1a2e] dark:bg-[#e94560] text-white hover:opacity-90 px-6 py-2.5 min-h-[44px] sm:min-h-0 text-xs font-bold transition-all cursor-pointer"
              >
                Close Preview
              </button>
            </div>

          </div>
        </Modal>
      )}
    </div>
  );
}
