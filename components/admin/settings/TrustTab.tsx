'use client';

import React from 'react';
import {
  LiveViewsConfig,
  TrustBadgesConfig,
  HomepageTrustBadgesConfig,
} from './trust';

interface TrustTabProps {
  enableFakeViews: boolean;
  setEnableFakeViews: (val: boolean) => void;
  minViews: number;
  setMinViews: (val: number) => void;
  maxViews: number;
  setMaxViews: (val: number) => void;
  enableTrustBadges: boolean;
  setEnableTrustBadges: (val: boolean) => void;
  deliveryEstimateText: string;
  setDeliveryEstimateText: (val: string) => void;
  freeShippingText: string;
  setFreeShippingText: (val: string) => void;
  promoCodeText: string;
  setPromoCodeText: (val: string) => void;
  safeCheckoutText: string;
  setSafeCheckoutText: (val: string) => void;
  safeCheckoutMethods: string[];
  setSafeCheckoutMethods: (updateFn: (prev: string[]) => string[]) => void;
  
  trustBadge1Title: string;
  setTrustBadge1Title: (val: string) => void;
  trustBadge1Desc: string;
  setTrustBadge1Desc: (val: string) => void;
  trustBadge1Icon: string;
  setTrustBadge1Icon: (val: string) => void;
  trustBadge1Enabled: boolean;
  setTrustBadge1Enabled: (val: boolean) => void;

  trustBadge2Title: string;
  setTrustBadge2Title: (val: string) => void;
  trustBadge2Desc: string;
  setTrustBadge2Desc: (val: string) => void;
  trustBadge2Icon: string;
  setTrustBadge2Icon: (val: string) => void;
  trustBadge2Enabled: boolean;
  setTrustBadge2Enabled: (val: boolean) => void;

  trustBadge3Title: string;
  setTrustBadge3Title: (val: string) => void;
  trustBadge3Desc: string;
  setTrustBadge3Desc: (val: string) => void;
  trustBadge3Icon: string;
  setTrustBadge3Icon: (val: string) => void;
  trustBadge3Enabled: boolean;
  setTrustBadge3Enabled: (val: boolean) => void;

  trustBadge4Title: string;
  setTrustBadge4Title: (val: string) => void;
  trustBadge4Desc: string;
  setTrustBadge4Desc: (val: string) => void;
  trustBadge4Icon: string;
  setTrustBadge4Icon: (val: string) => void;
  trustBadge4Enabled: boolean;
  setTrustBadge4Enabled: (val: boolean) => void;
}

export default function TrustTab({
  enableFakeViews,
  setEnableFakeViews,
  minViews,
  setMinViews,
  maxViews,
  setMaxViews,
  enableTrustBadges,
  setEnableTrustBadges,
  deliveryEstimateText,
  setDeliveryEstimateText,
  freeShippingText,
  setFreeShippingText,
  promoCodeText,
  setPromoCodeText,
  safeCheckoutText,
  setSafeCheckoutText,
  safeCheckoutMethods,
  setSafeCheckoutMethods,
  
  trustBadge1Title,
  setTrustBadge1Title,
  trustBadge1Desc,
  setTrustBadge1Desc,
  trustBadge1Icon,
  setTrustBadge1Icon,
  trustBadge1Enabled,
  setTrustBadge1Enabled,

  trustBadge2Title,
  setTrustBadge2Title,
  trustBadge2Desc,
  setTrustBadge2Desc,
  trustBadge2Icon,
  setTrustBadge2Icon,
  trustBadge2Enabled,
  setTrustBadge2Enabled,

  trustBadge3Title,
  setTrustBadge3Title,
  trustBadge3Desc,
  setTrustBadge3Desc,
  trustBadge3Icon,
  setTrustBadge3Icon,
  trustBadge3Enabled,
  setTrustBadge3Enabled,

  trustBadge4Title,
  setTrustBadge4Title,
  trustBadge4Desc,
  setTrustBadge4Desc,
  trustBadge4Icon,
  setTrustBadge4Icon,
  trustBadge4Enabled,
  setTrustBadge4Enabled,
}: TrustTabProps) {
  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-[#16162a] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-6 transition-colors">
        <h3 className="text-base font-bold text-gray-900 dark:text-white">Live Views & Trust Badge Settings</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <LiveViewsConfig
            enableFakeViews={enableFakeViews}
            setEnableFakeViews={setEnableFakeViews}
            minViews={minViews}
            setMinViews={setMinViews}
            maxViews={maxViews}
            setMaxViews={setMaxViews}
          />

          <TrustBadgesConfig
            enableTrustBadges={enableTrustBadges}
            setEnableTrustBadges={setEnableTrustBadges}
            deliveryEstimateText={deliveryEstimateText}
            setDeliveryEstimateText={setDeliveryEstimateText}
            freeShippingText={freeShippingText}
            setFreeShippingText={setFreeShippingText}
            promoCodeText={promoCodeText}
            setPromoCodeText={setPromoCodeText}
            safeCheckoutText={safeCheckoutText}
            setSafeCheckoutText={setSafeCheckoutText}
            safeCheckoutMethods={safeCheckoutMethods}
            setSafeCheckoutMethods={setSafeCheckoutMethods}
          />

          <HomepageTrustBadgesConfig
            trustBadge1Title={trustBadge1Title}
            setTrustBadge1Title={setTrustBadge1Title}
            trustBadge1Desc={trustBadge1Desc}
            setTrustBadge1Desc={setTrustBadge1Desc}
            trustBadge1Icon={trustBadge1Icon}
            setTrustBadge1Icon={setTrustBadge1Icon}
            trustBadge1Enabled={trustBadge1Enabled}
            setTrustBadge1Enabled={setTrustBadge1Enabled}

            trustBadge2Title={trustBadge2Title}
            setTrustBadge2Title={setTrustBadge2Title}
            trustBadge2Desc={trustBadge2Desc}
            setTrustBadge2Desc={setTrustBadge2Desc}
            trustBadge2Icon={trustBadge2Icon}
            setTrustBadge2Icon={setTrustBadge2Icon}
            trustBadge2Enabled={trustBadge2Enabled}
            setTrustBadge2Enabled={setTrustBadge2Enabled}

            trustBadge3Title={trustBadge3Title}
            setTrustBadge3Title={setTrustBadge3Title}
            trustBadge3Desc={trustBadge3Desc}
            setTrustBadge3Desc={setTrustBadge3Desc}
            trustBadge3Icon={trustBadge3Icon}
            setTrustBadge3Icon={setTrustBadge3Icon}
            trustBadge3Enabled={trustBadge3Enabled}
            setTrustBadge3Enabled={setTrustBadge3Enabled}

            trustBadge4Title={trustBadge4Title}
            setTrustBadge4Title={setTrustBadge4Title}
            trustBadge4Desc={trustBadge4Desc}
            setTrustBadge4Desc={setTrustBadge4Desc}
            trustBadge4Icon={trustBadge4Icon}
            setTrustBadge4Icon={setTrustBadge4Icon}
            trustBadge4Enabled={trustBadge4Enabled}
            setTrustBadge4Enabled={setTrustBadge4Enabled}
          />
        </div>
      </div>
    </div>
  );
}
