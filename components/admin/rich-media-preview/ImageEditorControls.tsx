'use client';

import React from 'react';
import { 
  RotateCw, 
  FlipHorizontal, 
  FlipVertical, 
  Undo,
  Save,
  Plus,
  Loader2
} from '@/components/common/Icons';
import { Crop as CropIcon } from 'lucide-react';

interface ImageEditorControlsProps {
  rotation: number;
  setRotation: React.Dispatch<React.SetStateAction<number>>;
  flipH: boolean;
  setFlipH: React.Dispatch<React.SetStateAction<boolean>>;
  flipV: boolean;
  setFlipV: React.Dispatch<React.SetStateAction<boolean>>;
  brightness: number;
  setBrightness: (v: number) => void;
  contrast: number;
  setContrast: (v: number) => void;
  saturation: number;
  setSaturation: (v: number) => void;
  blur: number;
  setBlur: (v: number) => void;
  aspect: number | undefined;
  handleAspectClick: (aspect: number | undefined) => void;
  manualWidth: string;
  setManualWidth: (v: string) => void;
  manualHeight: string;
  setManualHeight: (v: string) => void;
  handleManualSizeKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  applyManualSize: () => void;
  applyQuickFilter: (name: string) => void;
  resetEditor: () => void;
  saveEditedImage: (overwrite: boolean) => void;
  isSavingEdits: boolean;
}

export default function ImageEditorControls({
  setRotation,
  flipH,
  setFlipH,
  flipV,
  setFlipV,
  brightness,
  setBrightness,
  contrast,
  setContrast,
  saturation,
  setSaturation,
  blur,
  setBlur,
  aspect,
  handleAspectClick,
  manualWidth,
  setManualWidth,
  manualHeight,
  setManualHeight,
  handleManualSizeKeyDown,
  applyManualSize,
  applyQuickFilter,
  resetEditor,
  saveEditedImage,
  isSavingEdits,
}: ImageEditorControlsProps) {
  return (
    <div className="flex flex-col h-full justify-between">
      <div className="space-y-5 text-xs">
        {/* Transformations */}
        <div className="space-y-2">
          <h4 className="font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider text-[10px]">Transform</h4>
          <div className="grid grid-cols-4 gap-1.5">
            <button
              type="button"
              onClick={() => setRotation(r => (r + 90) % 360)}
              className="flex flex-col items-center justify-center p-2 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl cursor-pointer"
              title="Rotate 90° Clockwise"
            >
              <RotateCw className="w-4 h-4 text-gray-700 dark:text-gray-300" />
              <span className="text-[8px] mt-1 text-gray-500">Rotate</span>
            </button>
            <button
              type="button"
              onClick={() => setFlipH(f => !f)}
              className={`flex flex-col items-center justify-center p-2 rounded-xl cursor-pointer ${flipH ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 border border-blue-200 dark:border-blue-800' : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              title="Flip Horizontal"
            >
              <FlipHorizontal className="w-4 h-4" />
              <span className="text-[8px] mt-1 text-gray-500">Flip H</span>
            </button>
            <button
              type="button"
              onClick={() => setFlipV(f => !f)}
              className={`flex flex-col items-center justify-center p-2 rounded-xl cursor-pointer ${flipV ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 border border-blue-200 dark:border-blue-800' : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              title="Flip Vertical"
            >
              <FlipVertical className="w-4 h-4" />
              <span className="text-[8px] mt-1 text-gray-500">Flip V</span>
            </button>
            <button
              type="button"
              onClick={resetEditor}
              className="flex flex-col items-center justify-center p-2 bg-gray-50 dark:bg-gray-800 hover:bg-red-500/10 hover:text-red-500 rounded-xl cursor-pointer"
              title="Reset All Adjustments"
            >
              <Undo className="w-4 h-4" />
              <span className="text-[8px] mt-1 text-gray-500">Reset</span>
            </button>
          </div>
        </div>

        {/* Crop Aspects */}
        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <h4 className="font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider text-[10px]">Crop Aspect Ratio</h4>
            <div className="flex items-center gap-1 opacity-80 hover:opacity-100 transition-opacity">
              <input 
                type="number" 
                className="w-12 text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-1 py-0.5 rounded border-none text-center outline-none focus:ring-1 focus:ring-blue-500 placeholder-blue-300"
                value={manualWidth}
                onChange={(e) => setManualWidth(e.target.value)}
                onKeyDown={handleManualSizeKeyDown}
                onBlur={applyManualSize}
                placeholder="W"
              />
              <span className="text-[10px] font-bold text-gray-400">×</span>
              <input 
                type="number" 
                className="w-12 text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-1 py-0.5 rounded border-none text-center outline-none focus:ring-1 focus:ring-blue-500 placeholder-blue-300"
                value={manualHeight}
                onChange={(e) => setManualHeight(e.target.value)}
                onKeyDown={handleManualSizeKeyDown}
                onBlur={applyManualSize}
                placeholder="H"
              />
              <span className="text-[10px] font-bold text-gray-400 ml-0.5">px</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button type="button" onClick={() => handleAspectClick(undefined)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${aspect === undefined ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}><CropIcon className="w-3 h-3" /> Custom</button>
            <button type="button" onClick={() => handleAspectClick(1)} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${aspect === 1 ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>1:1</button>
            <button type="button" onClick={() => handleAspectClick(3 / 4)} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${aspect === 3 / 4 ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>3:4</button>
            <button type="button" onClick={() => handleAspectClick(4 / 3)} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${aspect === 4 / 3 ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>4:3</button>
            <button type="button" onClick={() => handleAspectClick(9 / 16)} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${aspect === 9 / 16 ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>9:16</button>
            <button type="button" onClick={() => handleAspectClick(16 / 9)} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${aspect === 16 / 9 ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>16:9</button>
          </div>
        </div>

        {/* Quick Filters */}
        <div className="space-y-2">
          <h4 className="font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider text-[10px]">Quick Filters</h4>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { name: 'None', key: 'none' },
              { name: 'B&W', key: 'grayscale' },
              { name: 'Sepia', key: 'sepia' },
              { name: 'Invert', key: 'invert' },
              { name: 'Vintage', key: 'vintage' },
              { name: 'Cool Tint', key: 'cool' },
              { name: 'Moody', key: 'moody' },
              { name: 'Warm Sun', key: 'warm' },
              { name: 'Cinema', key: 'cinematic' },
            ].map(f => (
              <button key={f.key} type="button" onClick={() => applyQuickFilter(f.key)} className="py-1 px-2 bg-gray-50 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 rounded-lg text-[10px] font-medium transition-all text-center cursor-pointer truncate">{f.name}</button>
            ))}
          </div>
        </div>

        {/* Manual Adjustments Sliders */}
        <div className="space-y-3">
          <h4 className="font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider text-[10px]">Manual Adjustments</h4>
          
          <div className="space-y-1">
            <div className="flex justify-between font-semibold"><span className="text-gray-600 dark:text-gray-400">Brightness</span><span className="text-blue-600 dark:text-blue-400">{brightness}%</span></div>
            <input type="range" min="0" max="200" value={brightness} onChange={e => setBrightness(Number(e.target.value))} className="w-full accent-blue-600 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer" />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between font-semibold"><span className="text-gray-600 dark:text-gray-400">Contrast</span><span className="text-blue-600 dark:text-blue-400">{contrast}%</span></div>
            <input type="range" min="0" max="200" value={contrast} onChange={e => setContrast(Number(e.target.value))} className="w-full accent-blue-600 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer" />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between font-semibold"><span className="text-gray-600 dark:text-gray-400">Saturation</span><span className="text-blue-600 dark:text-blue-400">{saturation}%</span></div>
            <input type="range" min="0" max="200" value={saturation} onChange={e => setSaturation(Number(e.target.value))} className="w-full accent-blue-600 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer" />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between font-semibold"><span className="text-gray-600 dark:text-gray-400">Blur</span><span className="text-blue-600 dark:text-blue-400">{blur}px</span></div>
            <input type="range" min="0" max="10" step="0.5" value={blur} onChange={e => setBlur(Number(e.target.value))} className="w-full accent-blue-600 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer" />
          </div>
        </div>
      </div>

      {/* Editor Footer / Save Operations */}
      <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/10 shrink-0 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => saveEditedImage(true)}
            disabled={isSavingEdits}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] cursor-pointer min-h-[44px] transition-all disabled:opacity-50 active:scale-95"
          >
            {isSavingEdits ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Save In-place
          </button>
          <button
            type="button"
            onClick={() => saveEditedImage(false)}
            disabled={isSavingEdits}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 font-bold text-[11px] hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer min-h-[44px] transition-all disabled:opacity-50 active:scale-95"
          >
            {isSavingEdits ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            Save As Copy
          </button>
        </div>
      </div>
    </div>
  );
}
