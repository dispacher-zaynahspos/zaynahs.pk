import type { Metadata } from 'next';
import AdminClientLayout from './AdminClientLayout';

export const metadata: Metadata = {
  manifest: '/admin-manifest.json',
  title: {
    template: '%s | Admin Console',
    default: 'Admin Console',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Admin Console',
  },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminClientLayout>{children}</AdminClientLayout>;
}
