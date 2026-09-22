export interface MediaItem {
  id: string;
  original_filename: string;
  seo_filename: string;
  file_url: string;
  alt_text: string;
  title: string;
  description: string;
  caption: string;
  ai_generated: boolean;
  ai_enabled: boolean;
  bucket: string;
  created_at: string;
  file_size?: number;
  mime_type?: string;
}

export interface RichMediaPreviewModalProps {
  url?: string | null;
  item?: MediaItem | null;
  onClose: () => void;
  onUpdateTags?: (item: MediaItem) => void;
  mode?: 'library' | 'selector' | 'preview';
}

export const normalizeUrl = (url: string): string => {
  try {
    const u = new URL(url);
    return decodeURIComponent(u.pathname).toLowerCase();
  } catch {
    return decodeURIComponent(url).toLowerCase();
  }
};
