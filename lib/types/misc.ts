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
  emailType: string;
  category: 'customer' | 'admin';
  label: string;
  description?: string;
  enabled: boolean;
  subject: string;
  customHtml?: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  productId?: string | null;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  contact?: string;
  rating: number;
  comment?: string;
  approved: boolean;
  hidden?: boolean;
  isManual?: boolean;
  screenshotUrl?: string;
  images?: string[];
  deletedAt?: string | null;
  createdAt: string;
}

export interface SocialProof {
  id: string;
  imageUrl: string;
  caption?: string;
  sourceType: 'whatsapp' | 'instagram' | 'facebook' | 'manual';
  active: boolean;
  sortOrder: number;
  createdAt: string;
  deletedAt?: string | null;
  productIds?: string[];
  linkedProducts?: { id: string; name: string; slug?: string; image?: string }[];
}

export interface VariantPresetValue {
  label: string;
  hex?: string;
  imageUrl?: string;
}

export interface VariantPreset {
  id: string;
  name: string;
  attribute: 'color' | 'size' | 'material' | 'custom';
  values: VariantPresetValue[];
  createdAt: string;
  deletedAt?: string | null;
}
