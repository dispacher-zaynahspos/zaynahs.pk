import { getCollections } from '@/lib/services/collections';
import { getCategories } from '@/lib/services/categories';
import { getSettings } from '@/lib/services/settings';
import CollectionManager from '@/components/admin/CollectionManager';
import AdminPageHeader from '@/components/admin/shared/AdminPageHeader';

export const metadata = {
  title: 'Manage Collections - Admin',
  description: 'Group your categories into top-level collections.',
};

export default async function CollectionsPage() {
  const [collections, categories, settings] = await Promise.all([
    getCollections(),
    getCategories(),
    getSettings()
  ]);

  return (
    <main className="min-h-screen bg-gray-50/50 dark:bg-black">
      <AdminPageHeader
        title="Collections"
      />
      <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
        <CollectionManager initialCollections={collections} categories={categories} aiEnabled={settings.ai_enabled} storeUrl={settings.storeUrl || undefined} />
      </div>
    </main>
  );
}
