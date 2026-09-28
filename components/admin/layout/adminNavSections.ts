import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  FolderOpen,
  Layers,
  Ruler,
  Images,
  Zap,
  ClipboardList,
  ShoppingCart,
  Users,
  MessageSquare,
  Mail,
  TrendingUp,
  Globe,
  Star,
  Award,
  Palette,
  Settings,
  Truck,
  User,
  Trash2,
  Shield,
  Navigation,
  HelpCircle,
  CreditCard,
  MessageCircle,
  Layout,
  RefreshCw,
} from '@/components/common/Icons';

export interface NavItem {
  label: string;
  href: string;
  icon: any;
  badgeKey?: 'pending' | 'pendingCarts' | 'leads';
  keywords?: string[];
  external?: boolean;
}

export interface NavSection {
  key: string;
  label: string;
  items: NavItem[];
}

/**
 * Single source of truth for all admin navigation sections & items.
 * Used identically across Desktop Sidebar, Tablet Icon-Rail, Mobile Drawer, and Command Palette.
 */
export function getNavSections(aiEnabled: boolean, metaSyncEnabled?: boolean): NavSection[] {
  return [
    {
      key: 'dashboard',
      label: 'OVERVIEW',
      items: [
        {
          label: 'Dashboard',
          href: '/admin/dashboard',
          icon: LayoutDashboard,
          keywords: ['home', 'overview', 'stats', 'analytics', 'sales', 'metrics'],
        },
      ],
    },
    {
      key: 'catalog',
      label: 'CATALOG',
      items: [
        {
          label: 'Products',
          href: '/admin/products',
          icon: ShoppingBag,
          keywords: ['items', 'goods', 'catalog', 'stock', 'add product'],
        },
        {
          label: 'Inventory',
          href: '/admin/inventory',
          icon: Package,
          keywords: ['stock', 'units', 'warehouse', 'low stock', 'quantities'],
        },
        {
          label: 'Categories',
          href: '/admin/categories',
          icon: FolderOpen,
          keywords: ['departments', 'groups', 'taxonomy', 'sections'],
        },
        {
          label: 'Collections',
          href: '/admin/collections',
          icon: Layers,
          keywords: ['curated', 'featured', 'bundles', 'series'],
        },
        {
          label: 'Variants',
          href: '/admin/variants',
          icon: Layers,
          keywords: ['sizes', 'colors', 'options', 'attributes'],
        },
        {
          label: 'Size Guides',
          href: '/admin/size-guides',
          icon: Ruler,
          keywords: ['measurements', 'charts', 'fitting', 'dimensions'],
        },
        {
          label: 'Media',
          href: '/admin/media',
          icon: Images,
          keywords: ['photos', 'gallery', 'uploads', 'assets', 'images', 'storage'],
        },
        ...(aiEnabled
          ? [
              {
                label: 'SEO Copywriter',
                href: '/admin/seo',
                icon: Zap,
                keywords: ['ai', 'description generator', 'seo tags', 'meta titles'],
              },
            ]
          : []),
      ],
    },
    {
      key: 'orders',
      label: 'ORDERS',
      items: [
        {
          label: 'Orders Log',
          href: '/admin/orders',
          icon: ClipboardList,
          badgeKey: 'pending',
          keywords: ['sales', 'receipts', 'purchases', 'pending orders', 'fulfill'],
        },
        {
          label: 'Abandoned Carts',
          href: '/admin/abandoned-carts',
          icon: ShoppingCart,
          badgeKey: 'pendingCarts',
          keywords: ['checkout recovery', 'incomplete', 'dropoff', 'unpaid'],
        },
      ],
    },
    {
      key: 'customers',
      label: 'CUSTOMERS',
      items: [
        {
          label: 'Customers',
          href: '/admin/customers',
          icon: Users,
          keywords: ['clients', 'buyers', 'users', 'profiles', 'history'],
        },
        {
          label: 'WhatsApp Leads',
          href: '/admin/leads',
          icon: MessageSquare,
          badgeKey: 'leads',
          keywords: ['whatsapp subscribers', 'chat leads', 'inquiries'],
        },
        {
          label: 'Contact Messages',
          href: '/admin/messages',
          icon: Mail,
          keywords: ['inbox', 'contact form', 'support inquiries', 'feedback'],
        },
      ],
    },
    {
      key: 'analytics',
      label: 'ANALYTICS',
      items: [
        {
          label: 'Reporting',
          href: '/admin/reporting',
          icon: TrendingUp,
          keywords: ['sales report', 'revenue', 'profits', 'analytics', 'charts', 'kpi'],
        },
        {
          label: 'Traffic',
          href: '/admin/traffic',
          icon: Globe,
          keywords: ['visitors', 'views', 'sessions', 'countries', 'browsers'],
        },
      ],
    },
    {
      key: 'reviews',
      label: 'REVIEWS',
      items: [
        {
          label: 'Reviews',
          href: '/admin/reviews',
          icon: Star,
          keywords: ['ratings', 'feedback', 'testimonials', 'stars', 'comments'],
        },
        {
          label: 'Badges',
          href: '/admin/badges',
          icon: Award,
          keywords: ['trust seals', 'guarantees', 'highlights', 'accreditations'],
        },
      ],
    },
    {
      key: 'store',
      label: 'STORE & SETTINGS',
      items: [
        {
          label: 'Theme Customizer',
          href: '/admin/settings/customizer',
          icon: Palette,
          keywords: ['homepage', 'builder', 'customizer', 'design', 'banners', 'colors', 'layout'],
        },
        {
          label: 'Shop Settings',
          href: '/admin/settings',
          icon: Settings,
          keywords: ['configuration', 'store settings', 'general', 'whatsapp', 'shipping', 'payments'],
        },
        {
          label: 'Courier Manager',
          href: '/admin/settings/courier',
          icon: Truck,
          keywords: ['delivery', 'couriers', 'tcs', 'trax', 'postex', 'leopards', 'tracking'],
        },
        {
          label: 'Profile & Security',
          href: '/admin/settings/profile',
          icon: User,
          keywords: ['password', 'account credentials', 'admin login', 'security'],
        },
        {
          label: 'Trash Bin',
          href: '/admin/trash',
          icon: Trash2,
          keywords: ['deleted items', 'restore products', 'archive'],
        },
      ],
    },
  ];
}

/**
 * Settings tab direct shortcuts for Command Palette (Cmd+K).
 * Lets admins quickly jump straight to any specific sub-tab inside /admin/settings.
 */
export const SETTINGS_TAB_SHORTCUTS: NavItem[] = [
  {
    label: 'Settings: General',
    href: '/admin/settings?tab=general',
    icon: Settings,
    keywords: ['store name', 'branding', 'logo', 'currency', 'tagline'],
  },
  {
    label: 'Settings: Header',
    href: '/admin/settings?tab=header',
    icon: Layout,
    keywords: ['announcement bar', 'top bar', 'header layout'],
  },
  {
    label: 'Settings: Navigation',
    href: '/admin/settings?tab=navigation',
    icon: Navigation,
    keywords: ['navigation menu', 'header links', 'categories menu'],
  },
  {
    label: 'Settings: Products Display',
    href: '/admin/settings?tab=products',
    icon: Package,
    keywords: ['card style', 'product grid', 'price display', 'badges'],
  },
  {
    label: 'Settings: Trust & Badges',
    href: '/admin/settings?tab=trust',
    icon: Shield,
    keywords: ['trust seals', 'guarantee text', 'secure checkout'],
  },
  {
    label: 'Settings: WhatsApp Checkout',
    href: '/admin/settings?tab=whatsapp',
    icon: MessageCircle,
    keywords: ['whatsapp number', 'auto message format', 'phone number'],
  },
  {
    label: 'Settings: Policies & FAQ',
    href: '/admin/settings?tab=policies',
    icon: HelpCircle,
    keywords: ['return policy', 'privacy policy', 'terms', 'faqs'],
  },
  {
    label: 'Settings: Footer & Social',
    href: '/admin/settings?tab=footer',
    icon: Globe,
    keywords: ['instagram link', 'facebook link', 'footer text', 'copyright'],
  },
  {
    label: 'Settings: Shipping & Payment',
    href: '/admin/settings?tab=shipping',
    icon: Truck,
    keywords: ['shipping rate', 'cod', 'cash on delivery', 'free delivery threshold'],
  },
  {
    label: 'Settings: Premium Features',
    href: '/admin/settings?tab=premium',
    icon: Award,
    keywords: ['pro features', 'addons', 'advanced mode'],
  },
  {
    label: 'Settings: Coupons',
    href: '/admin/settings?tab=coupons',
    icon: CreditCard,
    keywords: ['discount codes', 'promo code', 'coupons', 'sales discount'],
  },
  {
    label: 'Settings: Pixels & Tracking',
    href: '/admin/settings?tab=pixels',
    icon: Globe,
    keywords: ['facebook pixel', 'meta pixel', 'tiktok pixel', 'google tag manager', 'gtm'],
  },
  {
    label: 'Settings: AI Settings',
    href: '/admin/settings?tab=ai_settings',
    icon: Zap,
    keywords: ['gemini api key', 'openrouter', 'groq', 'ai models'],
  },
  {
    label: 'Settings: Email & SMTP',
    href: '/admin/settings?tab=email',
    icon: Mail,
    keywords: ['smtp settings', 'order notifications', 'mail server'],
  },
];
