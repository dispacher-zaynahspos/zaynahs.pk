export interface WhatsAppSubscriber {
  id: string;
  name?: string;
  phone: string;
  email?: string;
  source_type?: string;
  created_at?: string;
}

export interface EmailSubscriber {
  id: string;
  email: string;
  source: string;
  subscribed: boolean;
  created_at?: string;
}

export interface EmailTemplate {
  id: string;
  email_type: string;
  category: 'customer' | 'admin';
  label: string;
  description?: string;
  enabled: boolean;
  subject: string;
  custom_html?: string;
  updated_at: string;
}

export interface Review {
  id: string;
  product_id?: string | null;
  customer_name: string;
  customer_phone?: string;
  customer_email?: string;
  contact?: string;
  rating: number;
  comment?: string;
  approved: boolean;
  hidden?: boolean;
  is_manual?: boolean;
  screenshot_url?: string;
  images?: string[];
  deleted_at?: string | null;
  created_at: string;
}

export interface SocialProof {
  id: string;
  image_url: string;
  caption?: string;
  source_type: 'whatsapp' | 'instagram' | 'facebook' | 'manual';
  active: boolean;
  sort_order: number;
  created_at: string;
  deleted_at?: string | null;
  product_ids?: string[];
  linked_products?: { id: string; name: string; slug?: string; image?: string }[];
}

export interface VariantPresetValue {
  label: string;
  hex?: string;
  image_url?: string;
}

export interface VariantPreset {
  id: string;
  name: string;
  attribute: 'color' | 'size' | 'material' | 'custom';
  values: VariantPresetValue[];
  created_at: string;
  deleted_at?: string | null;
}
