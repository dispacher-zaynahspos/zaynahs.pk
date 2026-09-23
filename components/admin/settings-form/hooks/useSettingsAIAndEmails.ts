'use client';

import { useState } from 'react';
import { StoreSettings } from '@/lib/types';

interface UseSettingsAIAndEmailsProps {
  initialSettings: StoreSettings;
}

const defaultEmailNotifications = {
  welcome: true,
  password_reset: true,
  password_changed: true,
  order_placed: true,
  order_confirmed: true,
  order_shipped: true,
  order_delivered: true,
  order_cancelled: true,
  order_refunded: true,
  review_request: true,
  admin_new_order: true,
  admin_order_cancelled: true,
  admin_low_stock: true,
  admin_new_customer: true,
  admin_new_review: true,
  admin_contact_form: true,
};

export function useSettingsAIAndEmails({ initialSettings }: UseSettingsAIAndEmailsProps) {
  // AI settings States
  const [aiEnabled, setAiEnabled] = useState(initialSettings.ai_enabled ?? false);
  const [contentProvider, setContentProvider] = useState(initialSettings.content_provider || 'groq');
  const [contentModel, setContentModel] = useState(initialSettings.content_model || 'llama-3.3-70b-versatile');
  const [aiModelCredentials, setAiModelCredentials] = useState<Record<string, Record<string, string>>>(
    initialSettings.ai_model_credentials || {}
  );
  const [visionProvider, setVisionProvider] = useState(initialSettings.vision_provider || 'gemini');
  const [visionModel, setVisionModel] = useState(
    initialSettings.vision_model && !initialSettings.vision_model.includes('2.5') && !initialSettings.vision_model.includes('1.5') && !initialSettings.vision_model.includes('2.0') && !initialSettings.vision_model.includes('3.5') && !initialSettings.vision_model.includes('3.1')
      ? initialSettings.vision_model
      : 'gemini-3.6-flash'
  );

  const pConfig: {
    tone?: string;
    language?: string;
    customInstructions?: string;
    targetAudiences?: string[];
    productTypes?: string[];
  } = initialSettings.ai_persona_config || {};
  const jsonbAudiences = Array.isArray(pConfig.targetAudiences) && pConfig.targetAudiences.length > 0
    ? pConfig.targetAudiences
    : null;
  const jsonbProductTypes = Array.isArray(pConfig.productTypes) && pConfig.productTypes.length > 0
    ? pConfig.productTypes
    : null;

  const flatAudiencesParsed = initialSettings.target_audiences
    ? initialSettings.target_audiences.split(',').map((s: string) => s.trim()).filter(Boolean)
    : [];
  const flatProductTypesParsed = initialSettings.product_types
    ? initialSettings.product_types.split(',').map((s: string) => s.trim()).filter(Boolean)
    : [];

  const [aiPersonaConfig, setAiPersonaConfig] = useState({
    tone: pConfig.tone || 'Professional',
    language: pConfig.language || 'English',
    customInstructions: pConfig.customInstructions || '',
    targetAudiences: jsonbAudiences ?? flatAudiencesParsed,
    productTypes: jsonbProductTypes ?? flatProductTypesParsed,
  });
  const [autoContentSeo, setAutoContentSeo] = useState(initialSettings.auto_content_seo ?? true);
  const [autoMediaAi, setAutoMediaAi] = useState(initialSettings.auto_media_ai ?? true);
  const [categoryDefaultTemplate, setCategoryDefaultTemplate] = useState(initialSettings.category_default_template || '');
  const [productDefaultTemplate, setProductDefaultTemplate] = useState(initialSettings.product_default_template || '');
  const [categoryDescriptionPrompt, setCategoryDescriptionPrompt] = useState(
    initialSettings.category_description_prompt || ''
  );
  const [categoryDescriptionLimit, setCategoryDescriptionLimit] = useState(
    initialSettings.category_description_limit ?? 150
  );
  const [productDescriptionPrompt, setProductDescriptionPrompt] = useState(
    initialSettings.product_description_prompt || ''
  );
  const [productDescriptionLimit, setProductDescriptionLimit] = useState(
    initialSettings.product_description_limit ?? 250
  );
  const [productShortPrompt, setProductShortPrompt] = useState(initialSettings.product_short_prompt || '');
  const [productShortLimit, setProductShortLimit] = useState(initialSettings.product_short_limit ?? 100);
  const [collectionDefaultTemplate, setCollectionDefaultTemplate] = useState(
    initialSettings.collection_default_template || ''
  );
  const [collectionDescriptionPrompt, setCollectionDescriptionPrompt] = useState(
    initialSettings.collection_description_prompt || ''
  );
  const [collectionDescriptionLimit, setCollectionDescriptionLimit] = useState(
    initialSettings.collection_description_limit ?? 80
  );

  // SMTP/Email Settings States
  const [smtpEmail, setSmtpEmail] = useState(initialSettings.smtp_email || '');
  const [smtpAppPassword, setSmtpAppPassword] = useState(initialSettings.smtp_app_password || '');
  const [smtpFromName, setSmtpFromName] = useState(initialSettings.smtp_from_name || '');
  const [adminNotificationEmail, setAdminNotificationEmail] = useState(
    initialSettings.admin_notification_email || ''
  );
  const [lowStockThreshold, setLowStockThreshold] = useState(initialSettings.low_stock_threshold ?? 5);

  // Abandoned Cart Settings States
  const [abandonedCartEmailEnabled, setAbandonedCartEmailEnabled] = useState(
    initialSettings.abandonedCartEmailEnabled ?? false
  );
  const [abandonedCartAdminNotify, setAbandonedCartAdminNotify] = useState(
    initialSettings.abandonedCartAdminNotify ?? false
  );
  const [abandonedCartEmailSubject, setAbandonedCartEmailSubject] = useState(
    initialSettings.abandonedCartEmailSubject || 'You left items in your cart!'
  );
  const [abandonedCartEmailTemplate, setAbandonedCartEmailTemplate] = useState(
    initialSettings.abandonedCartEmailTemplate ||
      'Hi {{name}},\n\nYou left some items in your cart. Complete your purchase here:\n{{checkout_url}}'
  );

  const [emailNotifications, setEmailNotifications] = useState<Record<string, boolean>>(() => {
    const raw = initialSettings.email_notifications;
    if (!raw) return defaultEmailNotifications;
    try {
      const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
      return { ...defaultEmailNotifications, ...parsed };
    } catch {
      return defaultEmailNotifications;
    }
  });

  return {
    aiEnabled,
    setAiEnabled,
    contentProvider,
    setContentProvider,
    contentModel,
    setContentModel,
    aiModelCredentials,
    setAiModelCredentials,
    visionProvider,
    setVisionProvider,
    visionModel,
    setVisionModel,
    aiPersonaConfig,
    setAiPersonaConfig,
    autoContentSeo,
    setAutoContentSeo,
    autoMediaAi,
    setAutoMediaAi,
    categoryDefaultTemplate,
    setCategoryDefaultTemplate,
    productDefaultTemplate,
    setProductDefaultTemplate,
    categoryDescriptionPrompt,
    setCategoryDescriptionPrompt,
    categoryDescriptionLimit,
    setCategoryDescriptionLimit,
    productDescriptionPrompt,
    setProductDescriptionPrompt,
    productDescriptionLimit,
    setProductDescriptionLimit,
    productShortPrompt,
    setProductShortPrompt,
    productShortLimit,
    setProductShortLimit,
    collectionDefaultTemplate,
    setCollectionDefaultTemplate,
    collectionDescriptionPrompt,
    setCollectionDescriptionPrompt,
    collectionDescriptionLimit,
    setCollectionDescriptionLimit,
    smtpEmail,
    setSmtpEmail,
    smtpAppPassword,
    setSmtpAppPassword,
    smtpFromName,
    setSmtpFromName,
    adminNotificationEmail,
    setAdminNotificationEmail,
    lowStockThreshold,
    setLowStockThreshold,
    abandonedCartEmailEnabled,
    setAbandonedCartEmailEnabled,
    abandonedCartAdminNotify,
    setAbandonedCartAdminNotify,
    abandonedCartEmailSubject,
    setAbandonedCartEmailSubject,
    abandonedCartEmailTemplate,
    setAbandonedCartEmailTemplate,
    emailNotifications,
    setEmailNotifications,
  };
}
