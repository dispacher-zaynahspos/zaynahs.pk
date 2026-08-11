'use client';

import React, { useState } from 'react';
import { HomepageSection, Category, Collection } from '@/lib/types';
import { Trash2, ChevronUp, ChevronDown } from '@/components/common/Icons';

interface CollectionsGridSettingsProps {
  section: HomepageSection;
  collections?: Collection[];
  categories?: Category[]; // Still available if needed
  onUpdateSection: (updates: Partial<HomepageSection>) => void;
  onSelectMedia: (
    fieldPath: 'settings' | 'content_data',
    fieldKey: string,
    isGridItem?: boolean,
    gridIndex?: number
  ) => void;
}

export default function CollectionsGridSettings({
  section,
  collections = [],
  categories = [],
  onUpdateSection,
  onSelectMedia
}: CollectionsGridSettingsProps) {
  const contentData = section.content_data || {};
  const items = contentData.items || [];
  
  const [showBulkAdd, setShowBulkAdd] = useState(false);
  const [selectedBulkIds, setSelectedBulkIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const displayCollections = collections.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleItemsChange = (updatedItems: any[]) => {
    onUpdateSection({
      content_data: { ...contentData, items: updatedItems }
    });
  };

  const handleAddCard = () => {
    handleItemsChange([{ title: '', link: '', imageUrl: '' }, ...items]);
  };

  const handleBulkAddSubmit = () => {
    const newCards = collections
      .filter(c => selectedBulkIds.includes(c.id))
      .map(col => ({
        title: col.name,
        link: `/shop?collection=${col.slug}`,
        imageUrl: col.imageUrl || ''
      }));
    handleItemsChange([...newCards, ...items]);
    setSelectedBulkIds([]);
    setShowBulkAdd(false);
    setSearchQuery('');
  };

  return (
    <div className="space-y-4">
      {/* Aspect Ratio Selector */}
      <div className="space-y-1.5 pb-2 border-b border-gray-200 dark:border-gray-800">
        <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
          Card Image Size (Aspect Ratio)
        </label>
        <select
          value={section.settings?.aspect_ratio || 'recommended'}
          onChange={(e) => {
            onUpdateSection({
              settings: {
                ...section.settings,
                aspect_ratio: e.target.value
              }
            });
          }}
          className="w-full px-2 py-1 text-xs rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#16162a] text-gray-900 dark:text-gray-100 focus:outline-none"
        >
          <option value="recommended">Recommended (3:4 Portrait)</option>
          <option value="1by1">Square (1:1)</option>
          <option value="auto">Auto (Natural)</option>
        </select>
      </div>

      {/* Show/Hide Card Title Badges Toggle */}
      <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-800 pb-2.5 pt-1">
        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Show Card Title Badges</span>
        <label className="relative inline-flex items-center cursor-pointer select-none">
          <input
            type="checkbox"
            checked={section.settings?.show_card_labels ?? true}
            onChange={(e) => {
              onUpdateSection({
                settings: {
                  ...section.settings,
                  show_card_labels: e.target.checked
                }
              });
            }}
            className="sr-only peer"
          />
          <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#e94560]" />
        </label>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-black text-gray-800 dark:text-gray-200 uppercase tracking-wider">Grid Cards</h4>
          <div className="flex gap-2">
            <button
              onClick={() => setShowBulkAdd(!showBulkAdd)}
              className={`px-2 py-1 text-[10px] font-bold rounded-lg cursor-pointer transition-colors ${showBulkAdd ? 'bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
            >
              {showBulkAdd ? 'Cancel Bulk Add' : 'Bulk Add'}
            </button>
            <button
              onClick={handleAddCard}
              className="px-2 py-1 text-[10px] font-bold bg-[#e94560] text-white hover:bg-[#d83550] rounded-lg cursor-pointer transition-colors"
            >
              + Add Empty
            </button>
          </div>
        </div>
        
        {/* Bulk Add UI */}
        {showBulkAdd && (
          <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl p-3 space-y-3 mb-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-blue-800 dark:text-blue-300">Select Collections to Add</span>
              <button
                onClick={handleBulkAddSubmit}
                disabled={selectedBulkIds.length === 0}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-md transition-colors"
              >
                Add Selected ({selectedBulkIds.length})
              </button>
            </div>
            
            <input
              type="text"
              placeholder="Search collections..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full text-xs px-2 py-1.5 rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#16162a]"
            />
            
            <div className="max-h-48 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
              {displayCollections.map(col => (
                <label key={col.id} className="flex items-center gap-2 p-1.5 hover:bg-white dark:hover:bg-[#16162a] rounded cursor-pointer transition-colors group">
                  <input 
                    type="checkbox"
                    checked={selectedBulkIds.includes(col.id)}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedBulkIds([...selectedBulkIds, col.id]);
                      else setSelectedBulkIds(selectedBulkIds.filter(id => id !== col.id));
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-3 w-3"
                  />
                  <div className="flex-1 flex justify-between items-center">
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                      {col.name}
                    </span>
                    {col.categories && col.categories.length > 0 && (
                      <span className="text-[9px] text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                        {col.categories.length} categories
                      </span>
                    )}
                  </div>
                </label>
              ))}
              {displayCollections.length === 0 && (
                <div className="text-xs text-center py-4 text-gray-500">No collections found.</div>
              )}
            </div>
          </div>
        )}

        <div className="space-y-3">
          {items.map((item: any, index: number) => (
            <div key={index} className="bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-800 rounded-xl p-3 relative group">
              <div className="absolute right-2 top-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => {
                    if (index > 0) {
                      const newItems = [...items];
                      [newItems[index], newItems[index - 1]] = [newItems[index - 1], newItems[index]];
                      handleItemsChange(newItems);
                    }
                  }}
                  className="p-1 bg-white dark:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white rounded shadow-sm border border-gray-200 dark:border-gray-700"
                  disabled={index === 0}
                >
                  <ChevronUp className="h-3 w-3" />
                </button>
                <button
                  onClick={() => {
                    if (index < items.length - 1) {
                      const newItems = [...items];
                      [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
                      handleItemsChange(newItems);
                    }
                  }}
                  className="p-1 bg-white dark:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white rounded shadow-sm border border-gray-200 dark:border-gray-700"
                  disabled={index === items.length - 1}
                >
                  <ChevronDown className="h-3 w-3" />
                </button>
                <button
                  onClick={() => {
                    const newItems = [...items];
                    newItems.splice(index, 1);
                    handleItemsChange(newItems);
                  }}
                  className="p-1 bg-white dark:bg-gray-800 text-gray-500 hover:text-red-500 rounded shadow-sm border border-gray-200 dark:border-gray-700 mt-2"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>

              <div className="grid grid-cols-12 gap-3 pr-10">
                <div className="col-span-12 sm:col-span-3">
                  <div className="aspect-square bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 relative group/img cursor-pointer"
                       onClick={() => onSelectMedia('content_data', 'imageUrl', true, index)}
                  >
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.imageUrl} alt={item.title || 'Image'} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-1 p-2 text-center">
                        <span className="text-xl">+</span>
                        <span className="text-[9px] font-bold uppercase tracking-wider">Add Image</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="col-span-12 sm:col-span-9 space-y-2">
                  <div>
                    <input
                      type="text"
                      placeholder="Title (e.g. Summer Collection)"
                      value={item.title || ''}
                      onChange={(e) => {
                        const newItems = [...items];
                        newItems[index] = { ...item, title: e.target.value };
                        handleItemsChange(newItems);
                      }}
                      className="w-full px-3 py-1.5 text-sm rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#16162a] text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#e94560]"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Link (e.g. /shop?collection=summer)"
                      value={item.link || ''}
                      onChange={(e) => {
                        const newItems = [...items];
                        newItems[index] = { ...item, link: e.target.value };
                        handleItemsChange(newItems);
                      }}
                      className="w-full px-3 py-1.5 text-xs rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#16162a] text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#e94560]"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="text-center py-6 text-xs text-gray-500 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl">
              No grid cards added yet.<br/>Use Bulk Add or Add Empty.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
