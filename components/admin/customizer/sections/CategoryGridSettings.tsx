'use client';

import React, { useState } from 'react';
import { HomepageSection, Category } from '@/lib/types';
import { Trash2, ChevronUp, ChevronDown } from '@/components/common/Icons';
import { moveItemInArray } from '@/lib/utils/arrayMove';
import ResponsiveGridColumnsControl from '../shared/ResponsiveGridColumnsControl';
import SectionSpacingControls from '../shared/SectionSpacingControls';
import { AccordionGroup } from '@/components/admin/customizer/controls';

interface CategoryGridSettingsProps {
  section: HomepageSection;
  categories: Category[];
  viewportMode?: 'desktop' | 'tablet' | 'mobile';
  onUpdateSection: (updates: Partial<HomepageSection>) => void;
  onSelectMedia: (
    fieldPath: 'settings' | 'content_data',
    fieldKey: string,
    isGridItem?: boolean,
    gridIndex?: number
  ) => void;
}

export default function CategoryGridSettings({
  section,
  categories,
  viewportMode,
  onUpdateSection,
  onSelectMedia
}: CategoryGridSettingsProps) {
  const contentData = section.content_data || {};
  const items = contentData.items || [];
  
  const [showBulkAdd, setShowBulkAdd] = useState(false);
  const [selectedBulkIds, setSelectedBulkIds] = useState<string[]>([]);

  const displayCategories = (categories || []).filter(c => c.slug !== 'shop');

  const handleItemsChange = (updatedItems: any[]) => {
    onUpdateSection({
      content_data: { ...contentData, items: updatedItems }
    });
  };

  const handleAddCard = () => {
    handleItemsChange([{ title: '', link: '', imageUrl: '' }, ...items]);
  };

  const handleBulkAddSubmit = () => {
    const newCards = (categories || [])
      .filter(c => selectedBulkIds.includes(c.id))
      .map(cat => ({
        title: cat.name,
        link: `/shop?category=${cat.slug}`,
        imageUrl: cat.image_url || '',
        ref_type: 'category' as const,
        ref_id: cat.id,
        image_mode: 'auto' as const,
      }));
    handleItemsChange([...newCards, ...items]);
    setSelectedBulkIds([]);
    setShowBulkAdd(false);
  };

  return (
    <div className="space-y-3">
      <AccordionGroup id={`cg-${section.id}-layout`} title="Layout & Style" defaultOpen>
      <div className="space-y-4 pt-2">
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

      {/* Responsive Columns per Device (Mobile: 1-3, Tablet: 2-4, Desktop: 3-8) */}
      <ResponsiveGridColumnsControl
        label="Category Grid Columns"
        viewportMode={viewportMode}
        desktopCols={Number(section.settings?.desktop_columns) || 4}
        tabletCols={Number(section.settings?.tablet_columns) || 3}
        mobileCols={Number(section.settings?.mobile_columns) || 2}
        onChangeDesktop={(cols) => onUpdateSection({ settings: { ...section.settings, desktop_columns: cols } })}
        onChangeTablet={(cols) => onUpdateSection({ settings: { ...section.settings, tablet_columns: cols } })}
        onChangeMobile={(cols) => onUpdateSection({ settings: { ...section.settings, mobile_columns: cols } })}
      />

      {/* Show/Hide Section Title Toggle */}
      <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-800 pb-2.5 pt-1">
        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Show Section Title</span>
        <label className="relative inline-flex items-center cursor-pointer select-none">
          <input
            type="checkbox"
            checked={section.settings?.show_title !== false}
            onChange={(e) => {
              onUpdateSection({
                settings: {
                  ...section.settings,
                  show_title: e.target.checked
                }
              });
            }}
            className="sr-only peer"
          />
          <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#e94560]" />
        </label>
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
      </div>
      </AccordionGroup>

      <AccordionGroup id={`cg-${section.id}-cards`} title="Grid Cards" defaultOpen>
      <div className="space-y-4 pt-2">
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
          <div className="space-y-2 p-3 bg-gray-50 dark:bg-[#0f0f1b] border border-gray-200 dark:border-gray-800 rounded-xl">
            <div className="flex justify-between items-center mb-1">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                  Select Categories to Add
                </label>
              </div>
              <span className="text-[10px] font-bold text-blue-500">{selectedBulkIds.length} Selected</span>
            </div>
            <div className="max-h-40 overflow-y-auto space-y-1.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#16162a] rounded-lg p-2">
              {displayCategories.map(cat => (
                <label key={cat.id} className="flex items-center gap-2 text-xs text-gray-800 dark:text-gray-200 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-1 rounded">
                  <input 
                    type="checkbox" 
                    checked={selectedBulkIds.includes(cat.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedBulkIds([...selectedBulkIds, cat.id]);
                      } else {
                        setSelectedBulkIds(selectedBulkIds.filter(id => id !== cat.id));
                      }
                    }}
                    className="accent-blue-500"
                  />
                  {cat.name}
                </label>
              ))}
            </div>
            <button
              onClick={handleBulkAddSubmit}
              disabled={selectedBulkIds.length === 0}
              className="w-full mt-2 py-1.5 text-xs font-bold bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white rounded-lg transition-colors cursor-pointer"
            >
              Add {selectedBulkIds.length} Selected Categories
            </button>
          </div>
        )}
      </div>
      
      {items.length === 0 ? (
        <p className="text-xs text-gray-500">No cards added yet. Use "Quick Add" or "Add Empty Card" to start.</p>
      ) : (
        <div className="space-y-3">
          {items.map((item: any, idx: number) => {
            const updateGridItem = (itemUpdates: any) => {
              const updatedItems = [...items];
              updatedItems[idx] = { ...item, ...itemUpdates };
              handleItemsChange(updatedItems);
            };

            const removeGridItem = () => {
              const updatedItems = [...items];
              updatedItems.splice(idx, 1);
              handleItemsChange(updatedItems);
            };

            const openMediaSelectorForGrid = () => {
              // Selecting an image manually switches this card to CUSTOM.
              updateGridItem({ image_mode: 'custom' });
              onSelectMedia('content_data', 'imageUrl', true, idx);
            };

            const linkedCat = item.ref_type === 'category' && item.ref_id
              ? (categories || []).find(c => c.id === item.ref_id)
              : undefined;
            const isAuto = item.image_mode === 'auto' && !!item.ref_id;
            const resetToAuto = () => {
              if (!linkedCat) return;
              updateGridItem({ image_mode: 'auto', imageUrl: linkedCat.image_url || '' });
            };
            const effectiveImage = isAuto ? (linkedCat?.image_url || item.imageUrl || '') : (item.imageUrl || '');

            return (
              <div key={idx} className="border border-gray-200 dark:border-gray-800 p-3 rounded-xl bg-gray-50/55 dark:bg-[#0f0f1b]/55 space-y-3 relative group">
                <button
                  onClick={removeGridItem}
                  className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 bg-white dark:bg-gray-800 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove card"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
                
                <div className="flex items-center justify-between text-[10px] font-bold text-gray-500 uppercase">
                  <div className="flex items-center gap-1.5">
                    <span>Card {idx + 1}</span>
                    <div className="flex items-center gap-0.5 ml-2">
                      <button
                        type="button"
                        onClick={() => handleItemsChange(moveItemInArray(items, idx, 'up'))}
                        disabled={idx === 0}
                        className="p-0.5 text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-20 transition-all cursor-pointer"
                        title="Move Up"
                      >
                        <ChevronUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleItemsChange(moveItemInArray(items, idx, 'down'))}
                        disabled={idx === items.length - 1}
                        className="p-0.5 text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-20 transition-all cursor-pointer"
                        title="Move Down"
                      >
                        <ChevronDown className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  {item.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.imageUrl} alt="Card preview" className="w-8 h-8 object-cover rounded-lg" />
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400">Quick Select Category</label>
                  <select
                    className="w-full px-2 py-1 text-xs rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#16162a] text-gray-900 dark:text-gray-100 focus:outline-none"
                    value={item.ref_type === 'category' ? (item.ref_id || '') : ''}
                    onChange={(e) => {
                      const catId = e.target.value;
                      if (!catId) return;
                      const cat = (categories || []).find(c => c.id === catId);
                      if (!cat) return;
                      const autoLabel = `/shop?category=${cat.slug}`;
                      // Fill label/link only if empty or previously auto-derived.
                      const labelIsAuto = !item.title || (categories || []).some(c => c.name === item.title);
                      const linkIsAuto = !item.link || /^\/shop\?(category|collection)=/.test(item.link);
                      updateGridItem({
                        ...(labelIsAuto ? { title: cat.name } : {}),
                        ...(linkIsAuto ? { link: autoLabel } : {}),
                        ref_type: 'category',
                        ref_id: cat.id,
                        image_mode: 'auto',
                        imageUrl: cat.image_url || item.imageUrl || '',
                      });
                    }}
                  >
                    <option value="">-- Select Category --</option>
                    {displayCategories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400">Card Label</label>
                    <input
                      type="text"
                      value={item.title || ''}
                      onChange={e => updateGridItem({ title: e.target.value })}
                      placeholder="e.g. Girls"
                      className="w-full px-2 py-1 text-xs rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#16162a] text-gray-900 dark:text-gray-100 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400">Target Link</label>
                    <input
                      type="text"
                      value={item.link || ''}
                      onChange={e => updateGridItem({ link: e.target.value })}
                      placeholder="e.g. /shop?category=girls"
                      className="w-full px-2 py-1 text-xs rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#16162a] text-gray-900 dark:text-gray-100 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-400 block">Card Image</label>
                  <div className="flex items-start gap-2.5">
                    <div className="relative w-14 h-14 shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                      {effectiveImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={effectiveImage} alt="Card" className="w-full h-full object-cover" />
                      ) : (
                        <span className="absolute inset-0 flex items-center justify-center text-[8px] text-gray-400 text-center px-1">No image</span>
                      )}
                      {item.ref_id && (
                        <span className={`absolute top-0.5 left-0.5 px-1 py-px rounded text-[7px] font-black tracking-wider ${isAuto ? 'bg-emerald-500 text-white' : 'bg-gray-700 text-white'}`}>
                          {isAuto ? 'AUTO' : 'CUSTOM'}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <button
                        type="button"
                        onClick={openMediaSelectorForGrid}
                        className="w-full px-2 py-1.5 text-[10px] font-bold bg-gray-100 dark:bg-white/10 hover:bg-gray-200 text-gray-700 dark:text-gray-300 rounded-lg cursor-pointer transition-colors"
                      >
                        Select Image
                      </button>
                      {linkedCat && !isAuto && (
                        <button
                          type="button"
                          onClick={resetToAuto}
                          className="w-full px-2 py-1.5 text-[10px] font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 rounded-lg cursor-pointer transition-colors"
                        >
                          Use category image
                        </button>
                      )}
                    </div>
                  </div>
                  {isAuto && linkedCat && (
                    <p className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold">
                      {linkedCat.image_url ? `Synced with ${linkedCat.name} category image` : `${linkedCat.name} has no image. Upload one or select manually.`}
                    </p>
                  )}
                  {item.ref_id && !linkedCat && (
                    <p className="text-[9px] text-amber-600 dark:text-amber-400 font-semibold">
                      Linked category was removed — showing last saved image.
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      </div>
      </AccordionGroup>

      <SectionSpacingControls section={section} onUpdateSection={onUpdateSection} />
    </div>
  );
}
