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
