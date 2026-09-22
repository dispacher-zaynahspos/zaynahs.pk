import {
  LayoutDashboard,
  ShoppingBag,
  FolderOpen,
  ClipboardList,
  Settings,
  Layers,
  Images,
  Award,
  Users,
  Layout,
  MessageSquare,
  TrendingUp,
  ShoppingCart,
  Package,
  Shield,
  HelpCircle,
  Globe,
  Truck,
  Ruler,
  CreditCard,
  Zap,
  Mail,
  RefreshCw,
  Navigation,
  MessageCircle,
  Trash2,
  User,
  Star
} from '@/components/common/Icons';

export interface NavItem {
  label: string;
  href: string;
  icon: any;
}

export interface NavSection {
  key: string;
  label: string;
  items: NavItem[];
}

export function getNavSections(aiEnabled: boolean, metaSyncEnabled?: boolean): NavSection[] {
  return [
    {
      key: 'dashboard', label: '', items: [
        { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
      ]
    },
    {
      key: 'catalog', label: 'CATALOG', items: [
        { label: 'Products', href: '/admin/products', icon: ShoppingBag },
        { label: 'Inventory', href: '/admin/inventory', icon: Package },
        { label: 'Categories', href: '/admin/categories', icon: FolderOpen },
        { label: 'Collections', href: '/admin/collections', icon: Layers },
        { label: 'Variants', href: '/admin/variants', icon: Layers },
        { label: 'Size Guides', href: '/admin/size-guides', icon: Ruler },
        { label: 'Media', href: '/admin/media', icon: Images },
        ...(aiEnabled ? [{ label: 'SEO Copywriter', href: '/admin/seo', icon: Zap }] : []),
      ]
    },
    {
      key: 'orders', label: 'ORDERS', items: [
        { label: 'Orders Log', href: '/admin/orders', icon: ClipboardList },
        { label: 'Abandoned Carts', href: '/admin/abandoned-carts', icon: ShoppingCart },
      ]
    },
    {
      key: 'customers', label: 'CUSTOMERS', items: [
        { label: 'Customers', href: '/admin/customers', icon: Users },
        { label: 'WhatsApp Leads', href: '/admin/leads', icon: MessageSquare },
        { label: 'Traffic', href: '/admin/traffic', icon: Globe },
      ]
    },
    {
      key: 'reviews', label: 'REVIEWS', items: [
        { label: 'Reviews', href: '/admin/reviews', icon: Star },
        { label: 'Badges', href: '/admin/badges', icon: Award },
      ]
    },
    {
      key: 'reporting', label: '', items: [
        { label: 'Reporting', href: '/admin/reporting', icon: TrendingUp },
      ]
    },
    {
      key: 'trash', label: 'TRASH', items: [
        { label: 'Trash Bin', href: '/admin/trash', icon: Trash2 },
      ]
    },
    {
      key: 'settings', label: 'SETTINGS', items: [
        { label: 'General', href: '/admin/settings?tab=general', icon: Settings },
        { label: 'Profile & Account', href: '/admin/settings/profile', icon: User },
        { label: 'Header', href: '/admin/settings?tab=header', icon: Layout },
        { label: 'Navigation', href: '/admin/settings?tab=navigation', icon: Navigation },
        { label: 'Products', href: '/admin/settings?tab=products', icon: Package },
        { label: 'Trust & Badges', href: '/admin/settings?tab=trust', icon: Shield },
        { label: 'WhatsApp', href: '/admin/settings?tab=whatsapp', icon: MessageCircle },
        { label: 'Policies & FAQ', href: '/admin/settings?tab=policies', icon: HelpCircle },
        { label: 'Footer & Social', href: '/admin/settings?tab=footer', icon: Globe },
        { label: 'Shipping & Pay', href: '/admin/settings?tab=shipping', icon: Truck },
        { label: 'Premium', href: '/admin/settings?tab=premium', icon: Award },
        { label: 'Courier Manager', href: '/admin/settings/courier', icon: Truck },
        { label: 'Coupons', href: '/admin/settings?tab=coupons', icon: CreditCard },
        { label: 'Pixels & SEO', href: '/admin/settings?tab=pixels', icon: Globe },
        { label: 'AI Settings', href: '/admin/settings?tab=ai_settings', icon: Zap },
        { label: 'Email & SMTP', href: '/admin/settings?tab=email', icon: Mail },
        ...(metaSyncEnabled ? [{ label: 'Meta Sync', href: '/admin/settings?tab=meta_sync', icon: RefreshCw }] : []),
        { label: 'Homepage Customizer', href: '/admin/settings/customizer', icon: Layout },
      ]
    },
  ];
}
