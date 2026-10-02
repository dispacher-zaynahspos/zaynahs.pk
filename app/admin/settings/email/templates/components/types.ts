export interface EmailTemplate {
  id: string;
  emailType?: string;
  email_type?: string;
  category: 'customer' | 'admin';
  label: string;
  description?: string;
  enabled: boolean;
  subject: string;
  customHtml?: string;
  custom_html?: string;
  updatedAt?: string;
  updated_at?: string;
}
