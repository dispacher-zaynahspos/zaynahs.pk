import React from 'react';
import { Edit, Trash2, Image as ImageIcon } from '@/components/common/Icons';
import { Collection } from '@/lib/types';
import TableThumbnail from '@/components/admin/TableThumbnail';

interface CollectionTableProps {
  collections: Collection[];
  searchQuery: string;
  onEdit: (col: Collection) => void;
  onDelete: (id: string, name: string) => void;
  onPreviewImage: (url: string) => void;
}

export default function CollectionTable({
  collections,
  searchQuery,
  onEdit,
  onDelete,
  onPreviewImage,
}: CollectionTableProps) {
  const filteredCollections = collections.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Desktop table */}
      <div className="overflow-x-auto hidden md:block">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50/50 dark:bg-gray-800/30 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider font-bold">
          <tr>
            <th className="px-6 py-4">Collection</th>
            <th className="px-6 py-4">Categories Included</th>
            <th className="px-6 py-4 text-center">Status</th>
            <th className="px-6 py-4 text-center">Sort Order</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
          {filteredCollections.map(col => (
            <tr key={col.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  {col.image_url ? (
                    <TableThumbnail 
                      url={col.image_url} 
                      alt={col.name} 
                      onPreview={onPreviewImage} 
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <div className="font-bold text-gray-900 dark:text-white">{col.name}</div>
                    <div className="text-xs text-gray-500">/{col.slug}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-wrap gap-1.5">
                  {(col.categories || []).map(cat => (
                    <span key={cat.id} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-[10px] font-bold rounded-md">
                      {cat.name}
                    </span>
                  ))}
                  {(!col.categories || col.categories.length === 0) && (
                    <span className="text-gray-400 text-xs italic">Empty</span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 text-center">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  col.active 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                }`}>
                  {col.active ? 'Active' : 'Hidden'}
                </span>
              </td>
              <td className="px-6 py-4 text-center font-mono text-gray-500">
                {col.sort_order}
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(col)}
                    className="p-2 text-gray-400 hover:text-[#e94560] hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(col.id, col.name)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {filteredCollections.map(col => (
          <div key={col.id} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#16162a] p-3 space-y-3">
            <div className="flex items-center gap-3">
              {col.image_url ? (
                <TableThumbnail url={col.image_url} alt={col.name} onPreview={onPreviewImage} />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 shrink-0">
                  <ImageIcon className="w-5 h-5" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-bold text-gray-900 dark:text-white truncate">{col.name}</div>
                <div className="text-xs text-gray-500 truncate">/{col.slug}</div>
              </div>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider shrink-0 ${
                col.active
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
              }`}>
                {col.active ? 'Active' : 'Hidden'}
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {(col.categories || []).map(cat => (
                <span key={cat.id} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-[10px] font-bold rounded-md">
                  {cat.name}
                </span>
              ))}
              {(!col.categories || col.categories.length === 0) && (
                <span className="text-gray-400 text-xs italic">Empty</span>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-2">
              <span className="text-[10px] font-mono text-gray-400">Order: {col.sort_order}</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onEdit(col)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-white/5 hover:text-[#e94560] rounded-lg transition-colors cursor-pointer"
                >
                  <Edit className="h-3.5 w-3.5" /> Edit
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(col.id, col.name)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-500 bg-red-50 dark:bg-red-900/20 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
