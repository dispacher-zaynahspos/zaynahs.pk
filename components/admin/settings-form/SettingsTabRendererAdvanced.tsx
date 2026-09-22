'use client';

import React from 'react';
import ShippingTab from '../settings/ShippingTab';
import PremiumTab from '../settings/PremiumTab';
import CouponsTab from '../settings/CouponsTab';
import PixelsTab from '../settings/PixelsTab';
import AITab from '../settings/AITab';
import EmailTab from '../settings/EmailTab';
import MetaSyncTab from '../settings/MetaSyncTab';
import { TabId } from './index';

interface SettingsTabRendererAdvancedProps {
  activeTab: TabId;
  s: any;
}

export function SettingsTabRendererAdvanced({ activeTab, s }: SettingsTabRendererAdvancedProps) {
  switch (activeTab) {
    case 'shipping':
      return (
        <ShippingTab
          shippingMethods={s.shippingMethods}
          paymentMethods={s.paymentMethods}
          loadingLists={s.loadingLists}
          newShipName={s.newShipName}
          setNewShipName={s.setNewShipName}
          newShipCost={s.newShipCost}
          setNewShipCost={s.setNewShipCost}
          newShipDays={s.newShipDays}
          setNewShipDays={s.setNewShipDays}
          newPayName={s.newPayName}
          setNewPayName={s.setNewPayName}
          newPayCode={s.newPayCode}
          setNewPayCode={s.setNewPayCode}
          newPayInstructions={s.newPayInstructions}
          setNewPayInstructions={s.setNewPayInstructions}
          editingShipId={s.editingShipId}
          setEditingShipId={s.setEditingShipId}
          editShipName={s.editShipName}
          setEditShipName={s.setEditShipName}
          editShipCost={s.editShipCost}
          setEditShipCost={s.setEditShipCost}
          editShipDays={s.editShipDays}
          setEditShipDays={s.setEditShipDays}
          editingPayId={s.editingPayId}
          setEditingPayId={s.setEditingPayId}
          editPayName={s.editPayName}
          setEditPayName={s.setEditPayName}
          editPayCode={s.editPayCode}
          setEditPayCode={s.setEditPayCode}
          editPayInstructions={s.editPayInstructions}
          setEditPayInstructions={s.setEditPayInstructions}
          handleAddShipping={s.handleAddShipping}
          handleToggleShippingActive={s.handleToggleShippingActive}
          handleDeleteShipping={s.handleDeleteShipping}
          startEditShipping={s.startEditShipping}
          handleSaveShippingEdit={s.handleSaveShippingEdit}
          handleAddPayment={s.handleAddPayment}
          handleTogglePaymentActive={s.handleTogglePaymentActive}
          handleDeletePayment={s.handleDeletePayment}
          startEditPayment={s.startEditPayment}
          handleSavePaymentEdit={s.handleSavePaymentEdit}
          onReorderShipping={s.handleReorderShipping}
          onReorderPayment={s.handleReorderPayment}
          cartTimerMinutes={s.cartTimerMinutes}
          setCartTimerMinutes={s.setCartTimerMinutes}
          cartTimerMessage={s.cartTimerMessage}
          setCartTimerMessage={s.setCartTimerMessage}
          freeShippingThreshold={s.freeShippingThreshold}
          setFreeShippingThreshold={s.setFreeShippingThreshold}
          recentlyViewedLimit={s.recentlyViewedLimit}
          setRecentlyViewedLimit={s.setRecentlyViewedLimit}
          currencySymbol={s.currencySymbol}
        />
      );
    case 'premium':
      return (
        <PremiumTab
          initialSettings={s.initialSettings}
          productsList={s.productsList}
          recentBuyersEnabled={s.recentBuyersEnabled}
          setRecentBuyersEnabled={s.setRecentBuyersEnabled}
          cookieConsentEnabled={s.cookieConsentEnabled}
          setCookieConsentEnabled={s.setCookieConsentEnabled}
          freeShippingBarEnabled={s.freeShippingBarEnabled}
          setFreeShippingBarEnabled={s.setFreeShippingBarEnabled}
          volumeDiscountsEnabled={s.volumeDiscountsEnabled}
          setVolumeDiscountsEnabled={s.setVolumeDiscountsEnabled}
          frequentlyBoughtTogetherEnabled={s.frequentlyBoughtTogetherEnabled}
          setFrequentlyBoughtTogetherEnabled={s.setFrequentlyBoughtTogetherEnabled}
          stockUrgencyEnabled={s.stockUrgencyEnabled}
          setStockUrgencyEnabled={s.setStockUrgencyEnabled}
          flashSaleEnabled={s.flashSaleEnabled}
          setFlashSaleEnabled={s.setFlashSaleEnabled}
          flashSaleStartDate={s.flashSaleStartDate}
          setFlashSaleStartDate={s.setFlashSaleStartDate}
          flashSaleEndDate={s.flashSaleEndDate}
          setFlashSaleEndDate={s.setFlashSaleEndDate}
          globalFlashSaleDiscountType={s.globalFlashSaleDiscountType}
          setGlobalFlashSaleDiscountType={s.setGlobalFlashSaleDiscountType}
          globalFlashSaleDiscountValue={s.globalFlashSaleDiscountValue}
          setGlobalFlashSaleDiscountValue={s.setGlobalFlashSaleDiscountValue}
          socialFeedsEnabled={s.socialFeedsEnabled}
          setSocialFeedsEnabled={s.setSocialFeedsEnabled}
          cartTimerEnabled={s.cartTimerEnabled}
          setCartTimerEnabled={s.setCartTimerEnabled}
          sizeGuideEnabled={s.sizeGuideEnabled}
          setSizeGuideEnabled={s.setSizeGuideEnabled}
          couponCodesEnabled={s.couponCodesEnabled}
          setCouponCodesEnabled={s.setCouponCodesEnabled}
          enableFakeViews={s.enableFakeViews}
          setEnableFakeViews={s.setEnableFakeViews}
          minViews={s.minViews}
          setMinViews={s.setMinViews}
          maxViews={s.maxViews}
          setMaxViews={s.setMaxViews}
          exitIntentEnabled={s.exitIntentEnabled}
          setExitIntentEnabled={s.setExitIntentEnabled}
          exitIntentTitle={s.exitIntentTitle}
          setExitIntentTitle={s.setExitIntentTitle}
          exitIntentText={s.exitIntentText}
          setExitIntentText={s.setExitIntentText}
          exitIntentCoupon={s.exitIntentCoupon}
          setExitIntentCoupon={s.setExitIntentCoupon}
          exitIntentImageUrl={s.exitIntentImageUrl}
          setExitIntentImageUrl={s.setExitIntentImageUrl}
          exitIntentDelayMobile={s.exitIntentDelayMobile}
          setExitIntentDelayMobile={s.setExitIntentDelayMobile}
          cookieConsentText={s.cookieConsentText}
          setCookieConsentText={s.setCookieConsentText}
          cookieConsentButtonText={s.cookieConsentButtonText}
          setCookieConsentButtonText={s.setCookieConsentButtonText}
          spinWheelEnabled={s.spinWheelEnabled}
          setSpinWheelEnabled={s.setSpinWheelEnabled}
          spinWheelSegments={s.spinWheelSegments}
          setSpinWheelSegments={s.setSpinWheelSegments}
          cartTimerMinutes={s.cartTimerMinutes}
          setCartTimerMinutes={s.setCartTimerMinutes}
          cartTimerMessage={s.cartTimerMessage}
          setCartTimerMessage={s.setCartTimerMessage}
          freeShippingThreshold={s.freeShippingThreshold}
          setFreeShippingThreshold={s.setFreeShippingThreshold}
          recentlyViewedLimit={s.recentlyViewedLimit}
          setRecentlyViewedLimit={s.setRecentlyViewedLimit}
          volumeDiscountThreshold={s.volumeDiscountThreshold}
          setVolumeDiscountThreshold={s.setVolumeDiscountThreshold}
          volumeDiscountPercentage={s.volumeDiscountPercentage}
          setVolumeDiscountPercentage={s.setVolumeDiscountPercentage}
          recentBuyersSource={s.recentBuyersSource}
          setRecentBuyersSource={s.setRecentBuyersSource}
          recentBuyersNames={s.recentBuyersNames}
          setRecentBuyersNames={s.setRecentBuyersNames}
          recentBuyersCities={s.recentBuyersCities}
          setRecentBuyersCities={s.setRecentBuyersCities}
          recentBuyersProductPool={s.recentBuyersProductPool}
          setRecentBuyersProductPool={s.setRecentBuyersProductPool}
          recentBuyersCustomProducts={s.recentBuyersCustomProducts}
          setRecentBuyersCustomProducts={s.setRecentBuyersCustomProducts}
          recentBuyersInitialDelay={s.recentBuyersInitialDelay}
          setRecentBuyersInitialDelay={s.setRecentBuyersInitialDelay}
          recentBuyersInterval={s.recentBuyersInterval}
          setRecentBuyersInterval={s.setRecentBuyersInterval}
          recentBuyersDisplayDuration={s.recentBuyersDisplayDuration}
          setRecentBuyersDisplayDuration={s.setRecentBuyersDisplayDuration}
          recentBuyersShowOnCheckout={s.recentBuyersShowOnCheckout}
          setRecentBuyersShowOnCheckout={s.setRecentBuyersShowOnCheckout}
          handleRemoveImage={s.handleRemoveImage}
          headerShowNewsletter={s.headerShowNewsletter}
          setHeaderShowNewsletter={s.setHeaderShowNewsletter}
          headerNewsletterText={s.headerNewsletterText}
          setHeaderNewsletterText={s.setHeaderNewsletterText}
          headerShowTopBar={s.headerShowTopBar}
          setHeaderShowTopBar={s.setHeaderShowTopBar}
          headerTopBarPhone={s.headerTopBarPhone}
          setHeaderTopBarPhone={s.setHeaderTopBarPhone}
          headerTopBarEmail={s.headerTopBarEmail}
          setHeaderTopBarEmail={s.setHeaderTopBarEmail}
          enableTicker={s.enableTicker}
          setEnableTicker={s.setEnableTicker}
          tickerText={s.tickerText}
          setTickerText={s.setTickerText}
        />
      );
    case 'coupons':
      return (
        <CouponsTab
          coupons={s.coupons}
          loadingCoupons={s.loadingCoupons}
          couponCode={s.couponCode}
          setCouponCode={s.setCouponCode}
          couponDiscountType={s.couponDiscountType}
          setCouponDiscountType={s.setCouponDiscountType}
          couponValue={s.couponValue}
          setCouponValue={s.setCouponValue}
          couponMinCartAmount={s.couponMinCartAmount}
          setCouponMinCartAmount={s.setCouponMinCartAmount}
          couponActive={s.couponActive}
          setCouponActive={s.setCouponActive}
          editingCouponId={s.editingCouponId}
          setEditingCouponId={s.setEditingCouponId}
          currencySymbol={s.currencySymbol}
          volumeDiscountsEnabled={s.volumeDiscountsEnabled}
          setVolumeDiscountsEnabled={s.setVolumeDiscountsEnabled}
          volumeDiscountThreshold={s.volumeDiscountThreshold}
          setVolumeDiscountThreshold={s.setVolumeDiscountThreshold}
          volumeDiscountPercentage={s.volumeDiscountPercentage}
          setVolumeDiscountPercentage={s.setVolumeDiscountPercentage}
          handleSaveCoupon={s.handleSaveCoupon}
          handleEditCoupon={s.handleEditCoupon}
          handleDeleteCoupon={s.handleDeleteCoupon}
        />
      );
    case 'pixels':
      return (
        <PixelsTab
          metaPixelId={s.metaPixelId}
          setMetaPixelId={s.setMetaPixelId}
          metaSyncEnabled={s.metaSyncEnabled}
          setMetaSyncEnabled={s.setMetaSyncEnabled}
          ga4MeasurementId={s.ga4MeasurementId}
          setGa4MeasurementId={s.setGa4MeasurementId}
          gtmContainerId={s.gtmContainerId}
          setGtmContainerId={s.setGtmContainerId}
          tiktokPixelId={s.tiktokPixelId}
          setTiktokPixelId={s.setTiktokPixelId}
          twitterPixelId={s.twitterPixelId}
          setTwitterPixelId={s.setTwitterPixelId}
          snapchatPixelId={s.snapchatPixelId}
          setSnapchatPixelId={s.setSnapchatPixelId}
          pinterestTagId={s.pinterestTagId}
          setPinterestTagId={s.setPinterestTagId}
          twitterHandle={s.twitterHandle}
          setTwitterHandle={s.setTwitterHandle}
          metaTitleSuffix={s.metaTitleSuffix}
          setMetaTitleSuffix={s.setMetaTitleSuffix}
          metaTitle={s.metaTitle}
          setMetaTitle={s.setMetaTitle}
          metaDescription={s.metaDescription}
          setMetaDescription={s.setMetaDescription}
          storeName={s.storeName}
          storeUrl={s.storeUrl}
          faviconUrl={s.faviconUrl}
        />
      );
    case 'ai_settings':
      return (
        <AITab
          aiEnabled={s.aiEnabled}
          setAiEnabled={s.setAiEnabled}
          contentProvider={s.contentProvider}
          setContentProvider={s.setContentProvider}
          contentModel={s.contentModel}
          setContentModel={s.setContentModel}
          aiModelCredentials={s.aiModelCredentials}
          setAiModelCredentials={s.setAiModelCredentials}
          visionProvider={s.visionProvider}
          setVisionProvider={s.setVisionProvider}
          visionModel={s.visionModel}
          setVisionModel={s.setVisionModel}
          aiPersonaConfig={s.aiPersonaConfig}
          setAiPersonaConfig={s.setAiPersonaConfig}
          autoContentSeo={s.autoContentSeo}
          setAutoContentSeo={s.setAutoContentSeo}
          autoMediaAi={s.autoMediaAi}
          setAutoMediaAi={s.setAutoMediaAi}
          categoryDefaultTemplate={s.categoryDefaultTemplate}
          setCategoryDefaultTemplate={s.setCategoryDefaultTemplate}
          productDefaultTemplate={s.productDefaultTemplate}
          setProductDefaultTemplate={s.setProductDefaultTemplate}
          categoryDescriptionPrompt={s.categoryDescriptionPrompt}
          setCategoryDescriptionPrompt={s.setCategoryDescriptionPrompt}
          categoryDescriptionLimit={s.categoryDescriptionLimit}
          setCategoryDescriptionLimit={s.setCategoryDescriptionLimit}
          productDescriptionPrompt={s.productDescriptionPrompt}
          setProductDescriptionPrompt={s.setProductDescriptionPrompt}
          productDescriptionLimit={s.productDescriptionLimit}
          setProductDescriptionLimit={s.setProductDescriptionLimit}
          productShortPrompt={s.productShortPrompt}
          setProductShortPrompt={s.setProductShortPrompt}
          productShortLimit={s.productShortLimit}
          setProductShortLimit={s.setProductShortLimit}
          collectionDefaultTemplate={s.collectionDefaultTemplate}
          setCollectionDefaultTemplate={s.setCollectionDefaultTemplate}
          collectionDescriptionPrompt={s.collectionDescriptionPrompt}
          setCollectionDescriptionPrompt={s.setCollectionDescriptionPrompt}
          collectionDescriptionLimit={s.collectionDescriptionLimit}
          setCollectionDescriptionLimit={s.setCollectionDescriptionLimit}
        />
      );
    case 'email':
      return (
        <EmailTab
          smtpEmail={s.smtpEmail}
          setSmtpEmail={s.setSmtpEmail}
          smtpAppPassword={s.smtpAppPassword}
          setSmtpAppPassword={s.setSmtpAppPassword}
          smtpFromName={s.smtpFromName}
          setSmtpFromName={s.setSmtpFromName}
          adminNotificationEmail={s.adminNotificationEmail}
          setAdminNotificationEmail={s.setAdminNotificationEmail}
          emailNotifications={s.emailNotifications}
          setEmailNotifications={s.setEmailNotifications}
          lowStockThreshold={s.lowStockThreshold}
          setLowStockThreshold={s.setLowStockThreshold}
          abandonedCartEmailEnabled={s.abandonedCartEmailEnabled}
          setAbandonedCartEmailEnabled={s.setAbandonedCartEmailEnabled}
          abandonedCartAdminNotify={s.abandonedCartAdminNotify}
          setAbandonedCartAdminNotify={s.setAbandonedCartAdminNotify}
          abandonedCartEmailSubject={s.abandonedCartEmailSubject}
          setAbandonedCartEmailSubject={s.setAbandonedCartEmailSubject}
          abandonedCartEmailTemplate={s.abandonedCartEmailTemplate}
          setAbandonedCartEmailTemplate={s.setAbandonedCartEmailTemplate}
        />
      );
    case 'meta_sync':
      return <MetaSyncTab />;
    default:
      return null;
  }
}
