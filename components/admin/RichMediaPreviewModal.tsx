'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { X, Sliders, Loader2 } from '@/components/common/Icons';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { 
  RichMediaPreviewModalProps, 
  MediaInfoPanel, 
  ImageEditorControls,
  useRichMediaPreviewState
} from './rich-media-preview';

export default function RichMediaPreviewModal({ url, item: initialItem, onClose, onUpdateTags, mode = 'preview' }: RichMediaPreviewModalProps) {
  const state = useRichMediaPreviewState({ url, item: initialItem });

  if (!state.mounted || (!state.previewItem && !state.loading)) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#16162a] rounded-3xl max-w-5xl w-full border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] md:max-h-[85vh] will-change-transform">
        
        {/* Left/Center: Image Viewport */}
        <div className="flex-1 bg-gray-950 flex items-center justify-center p-6 relative overflow-hidden group select-none min-h-[300px]">
          {state.loading ? (
            <div className="flex flex-col items-center justify-center text-white space-y-3 opacity-50">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="text-xs font-mono tracking-widest uppercase">Loading Preview...</span>
            </div>
          ) : state.previewItem?.mime_type?.startsWith('video/') ? (
            <video src={state.previewItem.file_url} className="max-w-full max-h-[60vh] object-contain" controls autoPlay playsInline />
          ) : state.previewItem ? (
            <div className="relative overflow-hidden flex items-center justify-center">
              {state.showEditor ? (
                <ReactCrop
                  crop={state.crop}
                  onChange={(_, percentCrop) => state.setCrop(percentCrop)}
                  onComplete={(c) => state.setCompletedCrop(c)}
                  aspect={state.aspect}
                  className="max-h-[60vh] rounded-lg shadow-lg"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    ref={state.imgRef}
                    src={state.previewItem.file_url}
                    alt={state.previewItem.alt_text}
                    style={{
                      transform: `rotate(${state.rotation}deg) scaleX(${state.flipH ? -1 : 1}) scaleY(${state.flipV ? -1 : 1})`,
                      filter: `brightness(${state.brightness}%) contrast(${state.contrast}%) saturate(${state.saturation}%) blur(${state.blur}px) grayscale(${state.grayscale}%) sepia(${state.sepia}%) invert(${state.invert}%)`,
                      transition: 'transform 0.2s ease, filter 0.1s ease'
                    }}
                    className="max-w-full max-h-[60vh] object-contain block"
                  />
                </ReactCrop>
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={state.previewItem.file_url}
                  alt={state.previewItem.alt_text}
                  style={{
                    transform: `rotate(${state.rotation}deg) scaleX(${state.flipH ? -1 : 1}) scaleY(${state.flipV ? -1 : 1})`,
                    filter: `brightness(${state.brightness}%) contrast(${state.contrast}%) saturate(${state.saturation}%) blur(${state.blur}px) grayscale(${state.grayscale}%) sepia(${state.sepia}%) invert(${state.invert}%)`,
                    transition: 'transform 0.2s ease, filter 0.1s ease'
                  }}
                  className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-lg"
                />
              )}
            </div>
          ) : null}

          {!state.loading && state.previewItem && (
            <div className="absolute top-4 left-4 z-10 flex gap-2">
              <span className="text-[10px] font-mono text-gray-400 bg-black/45 px-2.5 py-1 rounded-full uppercase tracking-wider">
                {state.previewItem.mime_type?.split('/')[1] || 'media'} • {state.formatBytes(state.previewItem.file_size)}
              </span>
            </div>
          )}
        </div>

        {/* Right Side: Control Panel */}
        <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-gray-100 dark:border-gray-800 flex flex-col max-h-[50vh] md:max-h-full bg-white dark:bg-[#16162a]">
          
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
            <div>
              <h3 className="font-black text-sm text-gray-900 dark:text-white uppercase tracking-wider">
                {state.showEditor ? 'Edit Image' : 'Media Preview'}
              </h3>
              {!state.loading && state.previewItem && (
                <p className="text-[10px] text-gray-500 truncate max-w-[180px]">{state.previewItem.original_filename}</p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer min-h-[36px]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {!state.loading && state.previewItem && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {!state.previewItem.mime_type?.startsWith('video/') && (
                <div className="flex bg-gray-100 dark:bg-gray-800/60 p-1 rounded-xl shrink-0">
                  <button
                    type="button"
                    onClick={() => state.setShowEditor(false)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${!state.showEditor ? 'bg-white dark:bg-[#16162a] text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500'}`}
                  >
                    Details & Info
                  </button>
                  <button
                    type="button"
                    onClick={() => state.setShowEditor(true)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${state.showEditor ? 'bg-white dark:bg-[#16162a] text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500'}`}
                  >
                    <Sliders className="inline w-3 h-3 mr-1" />
                    Adjust & Filters
                  </button>
                </div>
              )}

              {!state.showEditor ? (
                <MediaInfoPanel
                  previewItem={state.previewItem}
                  mode={mode}
                  isMediaUsed={state.isMediaUsed}
                  formatBytes={state.formatBytes}
                  handleCopyUrl={state.handleCopyUrl}
                  handleDownloadMedia={state.handleDownloadMedia}
                  onClose={onClose}
                  onUpdateTags={onUpdateTags}
                />
              ) : (
                <ImageEditorControls
                  rotation={state.rotation}
                  setRotation={state.setRotation}
                  flipH={state.flipH}
                  setFlipH={state.setFlipH}
                  flipV={state.flipV}
                  setFlipV={state.setFlipV}
                  brightness={state.brightness}
                  setBrightness={state.setBrightness}
                  contrast={state.contrast}
                  setContrast={state.setContrast}
                  saturation={state.saturation}
                  setSaturation={state.setSaturation}
                  blur={state.blur}
                  setBlur={state.setBlur}
                  aspect={state.aspect}
                  handleAspectClick={state.handleAspectClick}
                  manualWidth={state.manualWidth}
                  setManualWidth={state.setManualWidth}
                  manualHeight={state.manualHeight}
                  setManualHeight={state.setManualHeight}
                  handleManualSizeKeyDown={state.handleManualSizeKeyDown}
                  applyManualSize={state.applyManualSize}
                  applyQuickFilter={state.applyQuickFilter}
                  resetEditor={state.resetEditor}
                  saveEditedImage={state.saveEditedImage}
                  isSavingEdits={state.isSavingEdits}
                />
              )}
            </div>
          )}
        </div>

      </div>
    </div>,
    document.body
  );
}
