'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft } from '@/components/common/Icons';
import { useConfirm } from '@/components/admin/shared/AdminConfirmProvider';
import { toast } from 'sonner';

import {
  EmailTemplate,
  VARIABLES_BY_TYPE,
  TemplateEditorForm,
  TemplateVariablesSidebar,
  EmailPreviewModal,
} from '../components';

export default function TemplateEditorPage() {
  const params = useParams();
  const router = useRouter();
  const { confirm } = useConfirm();
  const emailType = params.type as string;

  const [template, setTemplate] = useState<EmailTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [enabled, setEnabled] = useState(true);
  const [subject, setSubject] = useState('');
  const [mode, setMode] = useState<'default' | 'custom'>('default');
  const [customHtml, setCustomHtml] = useState('');

  // Preview state
  const [previewContent, setPreviewContent] = useState<{ subject: string; html: string } | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  useEffect(() => {
    fetchTemplate();
  }, [emailType]);

  const fetchTemplate = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/email-templates/${emailType}`);
      const data = await res.json();
      if (data.success && data.template) {
        const t = data.template;
        setTemplate(t);
        setEnabled(t.enabled);
        setSubject(t.subject);
        setCustomHtml(t.customHtml || '');
        setMode(t.customHtml ? 'custom' : 'default');
      } else {
        toast.error('Failed to load template details');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error occurred while loading template');
    } finally {
      setLoading(false);
    }
  };

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('html-textarea') as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const placeholder = `{{${variable}}}`;
    const newText = text.substring(0, start) + placeholder + text.substring(end);
    setCustomHtml(newText);
    
    // Restore focus and cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + placeholder.length, start + placeholder.length);
    }, 0);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = {
        subject,
        enabled,
        customHtml: mode === 'custom' ? customHtml : null
      };

      const res = await fetch(`/api/email-templates/${emailType}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (data.success) {
        toast.success('Template saved successfully!');
        setTemplate(data.template);
      } else {
        toast.error(data.error || 'Failed to save template');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error saving template');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    const confirmed = await confirm({
      title: 'Reset Template',
      message: 'This will discard your custom HTML template and use the built-in design. Continue?',
      variant: 'warning',
      confirmText: 'Discard'
    });
    if (!confirmed) return;

    try {
      setSaving(true);
      const res = await fetch(`/api/email-templates/${emailType}?action=reset`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Template reset to default successfully');
        setTemplate(data.template);
        setCustomHtml('');
        setMode('default');
      } else {
        toast.error(data.error || 'Failed to reset template');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error resetting template');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenPreview = async () => {
    setShowPreviewModal(true);
    setPreviewContent(null);
    setPreviewLoading(true);
    try {
      const res = await fetch(`/api/email-templates/${emailType}/preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          customHtml: mode === 'custom' ? customHtml : null,
          isDefaultMode: mode === 'default'
        })
      });
      const data = await res.json();
      if (data.success) {
        setPreviewContent({ subject: data.subject, html: data.html });
      } else {
        toast.error(data.error || 'Failed to load preview');
        setShowPreviewModal(false);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load preview');
      setShowPreviewModal(false);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleSendTest = async () => {
    try {
      setSendingTest(true);
      const res = await fetch(`/api/email-templates/${emailType}/send-test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          customHtml: mode === 'custom' ? customHtml : null,
          isDefaultMode: mode === 'default'
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || 'Test email dispatched successfully!');
      } else {
        toast.error(data.error || 'Failed to send test email');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to send test email');
    } finally {
      setSendingTest(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#e94560]" />
        <p className="text-xs text-gray-500 font-bold">Loading template customizer...</p>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="text-center py-12 max-w-5xl">
        <h2 className="text-sm font-bold text-red-[#e94560]">Template Not Found</h2>
        <a href="/admin/settings/email/templates" className="mt-4 inline-block text-xs font-bold text-[#e94560] hover:underline">
          Return to templates list
        </a>
      </div>
    );
  }

  const availableVars = VARIABLES_BY_TYPE[emailType] || [];

  return (
    <div className="space-y-6 max-w-5xl pb-16">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <a href="/admin/settings/email/templates" className="p-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
            <ChevronLeft className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </a>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Edit: {template.label}</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">{template.description}</p>
          </div>
        </div>
        
        {/* Toggle Enable at Top */}
        <div className="flex items-center gap-3 bg-white dark:bg-[#16162a] border border-gray-200 dark:border-gray-800 px-4 py-2 rounded-xl transition-colors">
          <span className="text-xs font-bold text-gray-750 dark:text-gray-300">Enabled</span>
          <button
            onClick={() => setEnabled(!enabled)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              enabled ? 'bg-[#10b981]' : 'bg-gray-200 dark:bg-gray-800'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                enabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <TemplateEditorForm
          subject={subject}
          setSubject={setSubject}
          mode={mode}
          setMode={setMode}
          customHtml={customHtml}
          setCustomHtml={setCustomHtml}
          template={template}
          handleReset={handleReset}
        />

        <TemplateVariablesSidebar
          availableVars={availableVars}
          mode={mode}
          insertVariable={insertVariable}
          handleOpenPreview={handleOpenPreview}
          handleSendTest={handleSendTest}
          sendingTest={sendingTest}
          handleSave={handleSave}
          saving={saving}
        />
      </div>

      <EmailPreviewModal
        showPreviewModal={showPreviewModal}
        setShowPreviewModal={setShowPreviewModal}
        template={template}
        previewContent={previewContent}
        previewLoading={previewLoading}
        sendingTest={sendingTest}
        handleSendTest={handleSendTest}
      />
    </div>
  );
}
