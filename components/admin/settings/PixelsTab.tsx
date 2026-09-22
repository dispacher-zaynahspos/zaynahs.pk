'use client';

import React from 'react';
import {
  GoogleSearchPreviewCard,
  SeoMetaSettingsCard,
  TrackingPixelsCard
} from './pixels';

interface PixelsTabProps {
  metaPixelId: string;
  setMetaPixelId: (val: string) => void;
  ga4MeasurementId: string;
  setGa4MeasurementId: (val: string) => void;
  gtmContainerId: string;
  setGtmContainerId: (val: string) => void;
  tiktokPixelId: string;
  setTiktokPixelId: (val: string) => void;
  twitterPixelId: string;
  setTwitterPixelId: (val: string) => void;
  snapchatPixelId: string;
  setSnapchatPixelId: (val: string) => void;
  pinterestTagId: string;
  setPinterestTagId: (val: string) => void;
  twitterHandle: string;
  setTwitterHandle: (val: string) => void;
  metaTitleSuffix: string;
  setMetaTitleSuffix: (val: string) => void;
  metaTitle: string;
  setMetaTitle: (val: string) => void;
  metaDescription: string;
  setMetaDescription: (val: string) => void;
  metaSyncEnabled: boolean;
  setMetaSyncEnabled: (val: boolean) => void;
  storeName: string;
  storeUrl: string;
  faviconUrl?: string;
}

export default function PixelsTab({
  metaPixelId,
  setMetaPixelId,
  ga4MeasurementId,
  setGa4MeasurementId,
  gtmContainerId,
  setGtmContainerId,
  tiktokPixelId,
  setTiktokPixelId,
  twitterPixelId,
  setTwitterPixelId,
  snapchatPixelId,
  setSnapchatPixelId,
  pinterestTagId,
  setPinterestTagId,
  twitterHandle,
  setTwitterHandle,
  metaTitleSuffix,
  setMetaTitleSuffix,
  metaTitle,
  setMetaTitle,
  metaDescription,
  setMetaDescription,
  metaSyncEnabled,
  setMetaSyncEnabled,
  storeName,
  storeUrl,
  faviconUrl,
}: PixelsTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      {/* LEFT COLUMN: SEO Settings & Google Live Preview */}
      <div className="space-y-8">
        <GoogleSearchPreviewCard
          metaTitle={metaTitle}
          metaDescription={metaDescription}
          metaTitleSuffix={metaTitleSuffix}
          storeName={storeName}
          storeUrl={storeUrl}
          faviconUrl={faviconUrl}
        />

        <SeoMetaSettingsCard
          metaTitle={metaTitle}
          setMetaTitle={setMetaTitle}
          metaDescription={metaDescription}
          setMetaDescription={setMetaDescription}
          metaTitleSuffix={metaTitleSuffix}
          setMetaTitleSuffix={setMetaTitleSuffix}
          twitterHandle={twitterHandle}
          setTwitterHandle={setTwitterHandle}
          storeName={storeName}
        />
      </div>

      {/* RIGHT COLUMN: Analytics & Tracking Pixels */}
      <TrackingPixelsCard
        metaSyncEnabled={metaSyncEnabled}
        setMetaSyncEnabled={setMetaSyncEnabled}
        metaPixelId={metaPixelId}
        setMetaPixelId={setMetaPixelId}
        ga4MeasurementId={ga4MeasurementId}
        setGa4MeasurementId={setGa4MeasurementId}
        gtmContainerId={gtmContainerId}
        setGtmContainerId={setGtmContainerId}
        tiktokPixelId={tiktokPixelId}
        setTiktokPixelId={setTiktokPixelId}
        snapchatPixelId={snapchatPixelId}
        setSnapchatPixelId={setSnapchatPixelId}
        pinterestTagId={pinterestTagId}
        setPinterestTagId={setPinterestTagId}
        twitterPixelId={twitterPixelId}
        setTwitterPixelId={setTwitterPixelId}
      />
    </div>
  );
}

