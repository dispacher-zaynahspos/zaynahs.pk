'use client';

import React from 'react';
import GeneralTab from '../settings/GeneralTab';
import HeaderTab from '../settings/HeaderTab';
import NavigationTab from '../settings/NavigationTab';
import ProductsTab from '../settings/ProductsTab';
import TrustTab from '../settings/TrustTab';
import WhatsappTab from '../settings/WhatsappTab';
import PoliciesTab from '../settings/PoliciesTab';
import FooterTab from '../settings/FooterTab';
import { TabId } from './index';

interface SettingsTabRendererCoreProps {
  activeTab: TabId;
  s: any;
}

export function SettingsTabRendererCore({ activeTab, s }: SettingsTabRendererCoreProps) {
  switch (activeTab) {
    case 'general':
      return (
        <GeneralTab
          storeName={s.storeName}
          setStoreName={s.setStoreName}
          storeUrl={s.storeUrl}
          setStoreUrl={s.setStoreUrl}
          whatsappNumber={s.whatsappNumber}
          setWhatsappNumber={s.setWhatsappNumber}
          currency={s.currency}
          setCurrency={s.setCurrency}
          currencySymbol={s.currencySymbol}
          setCurrencySymbol={s.setCurrencySymbol}
          orderPrefix={s.orderPrefix}
          setOrderPrefix={s.setOrderPrefix}
          nextOrderSequence={s.nextOrderSequence}
          setNextOrderSequence={s.setNextOrderSequence}
          setNextOrderSequenceDirty={s.setNextOrderSequenceDirty}
          tagline={s.tagline}
          setTagline={s.setTagline}
          address={s.address}
          setAddress={s.setAddress}
          showStock={s.showStock}
          setShowStock={s.setShowStock}
          showComparePrice={s.showComparePrice}
          setShowComparePrice={s.setShowComparePrice}
          enableSearch={s.enableSearch}
          setEnableSearch={s.setEnableSearch}
          enableCategoryFilter={s.enableCategoryFilter}
          setEnableCategoryFilter={s.setEnableCategoryFilter}
          logoUrl={s.logoUrl}
          setLogoUrl={s.setLogoUrl}
          logoWidth={s.logoWidth}
          setLogoWidth={s.setLogoWidth}
          faviconUrl={s.faviconUrl}
          setFaviconUrl={s.setFaviconUrl}
          bannerUrl={s.bannerUrl}
          setBannerUrl={s.setBannerUrl}
          handleRemoveImage={s.handleRemoveImage}
        />
      );
    case 'header':
      return (
        <HeaderTab
          popularSearches={s.popularSearches}
          setPopularSearches={s.setPopularSearches}
          headerSticky={s.headerSticky}
          setHeaderSticky={s.setHeaderSticky}
          headerStickyDesktop={s.headerStickyDesktop}
          setHeaderStickyDesktop={s.setHeaderStickyDesktop}
          headerStickyMobile={s.headerStickyMobile}
          setHeaderStickyMobile={s.setHeaderStickyMobile}
          headerShowTopBar={s.headerShowTopBar}
          setHeaderShowTopBar={s.setHeaderShowTopBar}
          headerShowNewsletter={s.headerShowNewsletter}
          setHeaderShowNewsletter={s.setHeaderShowNewsletter}
          headerTopBarPhone={s.headerTopBarPhone}
          setHeaderTopBarPhone={s.setHeaderTopBarPhone}
          headerTopBarEmail={s.headerTopBarEmail}
          setHeaderTopBarEmail={s.setHeaderTopBarEmail}
          headerNewsletterText={s.headerNewsletterText}
          setHeaderNewsletterText={s.setHeaderNewsletterText}
          headerDesktopLogoAlign={s.headerDesktopLogoAlign}
          setHeaderDesktopLogoAlign={s.setHeaderDesktopLogoAlign}
          headerDesktopSearchAlign={s.headerDesktopSearchAlign}
          setHeaderDesktopSearchAlign={s.setHeaderDesktopSearchAlign}
          headerDesktopWishlistAlign={s.headerDesktopWishlistAlign}
          setHeaderDesktopWishlistAlign={s.setHeaderDesktopWishlistAlign}
          headerDesktopCartAlign={s.headerDesktopCartAlign}
          setHeaderDesktopCartAlign={s.setHeaderDesktopCartAlign}
          headerDesktopThemeAlign={s.headerDesktopThemeAlign}
          setHeaderDesktopThemeAlign={s.setHeaderDesktopThemeAlign}
          headerMobileMenuAlign={s.headerMobileMenuAlign}
          setHeaderMobileMenuAlign={s.setHeaderMobileMenuAlign}
          headerMobileLogoAlign={s.headerMobileLogoAlign}
          setHeaderMobileLogoAlign={s.setHeaderMobileLogoAlign}
          headerMobileSearchAlign={s.headerMobileSearchAlign}
          setHeaderMobileSearchAlign={s.setHeaderMobileSearchAlign}
          headerMobileCartAlign={s.headerMobileCartAlign}
          setHeaderMobileCartAlign={s.setHeaderMobileCartAlign}
          headerMobileWishlistAlign={s.headerMobileWishlistAlign}
          setHeaderMobileWishlistAlign={s.setHeaderMobileWishlistAlign}
          headerTopBarBg={s.headerTopBarBg}
          setHeaderTopBarBg={s.setHeaderTopBarBg}
          headerTopBarTextColor={s.headerTopBarTextColor}
          setHeaderTopBarTextColor={s.setHeaderTopBarTextColor}
          headerBg={s.headerBg}
          setHeaderBg={s.setHeaderBg}
          headerTextColor={s.headerTextColor}
          setHeaderTextColor={s.setHeaderTextColor}
          headerBorderColor={s.headerBorderColor}
          setHeaderBorderColor={s.setHeaderBorderColor}
        />
      );
    case 'navigation':
      return (
        <NavigationTab
          headerDesktopMenuAlign={s.headerDesktopMenuAlign}
          setHeaderDesktopMenuAlign={s.setHeaderDesktopMenuAlign}
          navigationMenu={s.navigationMenu}
          openAddMenuModal={s.openAddMenuModal}
          moveMenuItemUp={s.moveMenuItemUp}
          moveMenuItemDown={s.moveMenuItemDown}
          indentMenuItem={s.indentMenuItem}
          outdentMenuItem={s.outdentMenuItem}
          openEditMenuModal={s.openEditMenuModal}
          deleteMenuItem={s.handleDeleteMenuItem}
          isMenuModalOpen={s.isMenuModalOpen}
          setIsMenuModalOpen={s.setIsMenuModalOpen}
          menuItemLabel={s.menuItemLabel}
          setMenuItemLabel={s.setMenuItemLabel}
          menuItemLinkType={s.menuItemLinkType}
          setMenuItemLinkType={s.setMenuItemLinkType}
          menuItemUrl={s.menuItemUrl}
          setMenuItemUrl={s.setMenuItemUrl}
          menuItemCategoryId={s.menuItemCategoryId}
          setMenuItemCategoryId={s.setMenuItemCategoryId}
          menuItemProductId={s.menuItemProductId}
          setMenuItemProductId={s.setMenuItemProductId}
          menuItemSystemPage={s.menuItemSystemPage}
          setMenuItemSystemPage={s.setMenuItemSystemPage}
          categoriesList={s.categoriesList}
          productsList={s.productsList}
          handleSaveMenuItem={s.handleSaveMenuItem}
          editingMenuItemId={s.editingMenuItemId}
        />
      );
    case 'products':
      return (
        <ProductsTab
          enableVariantSwatches={s.enableVariantSwatches}
          setEnableVariantSwatches={s.setEnableVariantSwatches}
          swatchShape={s.swatchShape}
          setSwatchShape={s.setSwatchShape}
          swatchLimit={s.swatchLimit}
          setSwatchLimit={s.setSwatchLimit}
          defaultVariantIndex={s.defaultVariantIndex}
          setDefaultVariantIndex={s.setDefaultVariantIndex}
          imageHoverStyle={s.imageHoverStyle}
          setImageHoverStyle={s.setImageHoverStyle}
          imageAspectRatio={s.imageAspectRatio}
          setImageAspectRatio={s.setImageAspectRatio}
          titleLineLimit={s.titleLineLimit}
          setTitleLineLimit={s.setTitleLineLimit}
          archiveSwatchSize={s.archiveSwatchSize}
          setArchiveSwatchSize={s.setArchiveSwatchSize}
          productSwatchSize={s.productSwatchSize}
          setProductSwatchSize={s.setProductSwatchSize}
          archiveSwatchAlign={s.archiveSwatchAlign}
          setArchiveSwatchAlign={s.setArchiveSwatchAlign}
          cardShowDescription={s.cardShowDescription}
          setCardShowDescription={s.setCardShowDescription}
          cardShowSwatches={s.cardShowSwatches}
          setCardShowSwatches={s.setCardShowSwatches}
          cardShowSizes={s.cardShowSizes}
          setCardShowSizes={s.setCardShowSizes}
          cardShowMaterials={s.cardShowMaterials}
          setCardShowMaterials={s.setCardShowMaterials}
          cardShowCustom={s.cardShowCustom}
          setCardShowCustom={s.setCardShowCustom}
          cardShowCustom2={s.cardShowCustom2}
          setCardShowCustom2={s.setCardShowCustom2}
          cardShowTypeColor={s.cardShowTypeColor}
          setCardShowTypeColor={s.setCardShowTypeColor}
          cardShowTypeSize={s.cardShowTypeSize}
          setCardShowTypeSize={s.setCardShowTypeSize}
          cardShowTypeMaterial={s.cardShowTypeMaterial}
          setCardShowTypeMaterial={s.setCardShowTypeMaterial}
          cardShowTypeCustom={s.cardShowTypeCustom}
          setCardShowTypeCustom={s.setCardShowTypeCustom}
          cardMobileColumns={s.cardMobileColumns}
          setCardMobileColumns={s.setCardMobileColumns}
        />
      );
    case 'trust':
      return (
        <TrustTab
          enableFakeViews={s.enableFakeViews}
          setEnableFakeViews={s.setEnableFakeViews}
          minViews={s.minViews}
          setMinViews={s.setMinViews}
          maxViews={s.maxViews}
          setMaxViews={s.setMaxViews}
          enableTrustBadges={s.enableTrustBadges}
          setEnableTrustBadges={s.setEnableTrustBadges}
          deliveryEstimateText={s.deliveryEstimateText}
          setDeliveryEstimateText={s.setDeliveryEstimateText}
          freeShippingText={s.freeShippingText}
          setFreeShippingText={s.setFreeShippingText}
          promoCodeText={s.promoCodeText}
          setPromoCodeText={s.setPromoCodeText}
          safeCheckoutText={s.safeCheckoutText}
          setSafeCheckoutText={s.setSafeCheckoutText}
          safeCheckoutMethods={s.safeCheckoutMethods}
          setSafeCheckoutMethods={s.setSafeCheckoutMethods}
          trustBadge1Title={s.trustBadge1Title}
          setTrustBadge1Title={s.setTrustBadge1Title}
          trustBadge1Desc={s.trustBadge1Desc}
          setTrustBadge1Desc={s.setTrustBadge1Desc}
          trustBadge1Icon={s.trustBadge1Icon}
          setTrustBadge1Icon={s.setTrustBadge1Icon}
          trustBadge1Enabled={s.trustBadge1Enabled}
          setTrustBadge1Enabled={s.setTrustBadge1Enabled}
          trustBadge2Title={s.trustBadge2Title}
          setTrustBadge2Title={s.setTrustBadge2Title}
          trustBadge2Desc={s.trustBadge2Desc}
          setTrustBadge2Desc={s.setTrustBadge2Desc}
          trustBadge2Icon={s.trustBadge2Icon}
          setTrustBadge2Icon={s.setTrustBadge2Icon}
          trustBadge2Enabled={s.trustBadge2Enabled}
          setTrustBadge2Enabled={s.setTrustBadge2Enabled}
          trustBadge3Title={s.trustBadge3Title}
          setTrustBadge3Title={s.setTrustBadge3Title}
          trustBadge3Desc={s.trustBadge3Desc}
          setTrustBadge3Desc={s.setTrustBadge3Desc}
          trustBadge3Icon={s.trustBadge3Icon}
          setTrustBadge3Icon={s.setTrustBadge3Icon}
          trustBadge3Enabled={s.trustBadge3Enabled}
          setTrustBadge3Enabled={s.setTrustBadge3Enabled}
          trustBadge4Title={s.trustBadge4Title}
          setTrustBadge4Title={s.setTrustBadge4Title}
          trustBadge4Desc={s.trustBadge4Desc}
          setTrustBadge4Desc={s.setTrustBadge4Desc}
          trustBadge4Icon={s.trustBadge4Icon}
          setTrustBadge4Icon={s.setTrustBadge4Icon}
          trustBadge4Enabled={s.trustBadge4Enabled}
          setTrustBadge4Enabled={s.setTrustBadge4Enabled}
        />
      );
    case 'whatsapp':
      return (
        <WhatsappTab
          whatsappGreeting={s.whatsappGreeting}
          setWhatsappGreeting={s.setWhatsappGreeting}
          whatsappFooter={s.whatsappFooter}
          setWhatsappFooter={s.setWhatsappFooter}
        />
      );
    case 'policies':
      return (
        <PoliciesTab
          faqContent={s.faqContent}
          setFaqContent={s.setFaqContent}
          returnPolicyContent={s.returnPolicyContent}
          setReturnPolicyContent={s.setReturnPolicyContent}
          privacyPolicyContent={s.privacyPolicyContent}
          setPrivacyPolicyContent={s.setPrivacyPolicyContent}
          showFaqInNav={s.showFaqInNav}
          setShowFaqInNav={s.setShowFaqInNav}
          showReturnsInNav={s.showReturnsInNav}
          setShowReturnsInNav={s.setShowReturnsInNav}
          showPrivacyInNav={s.showPrivacyInNav}
          setShowPrivacyInNav={s.setShowPrivacyInNav}
          showFaqInFooter={s.showFaqInFooter}
          setShowFaqInFooter={s.setShowFaqInFooter}
          showReturnsInFooter={s.showReturnsInFooter}
          setShowReturnsInFooter={s.setShowReturnsInFooter}
          showPrivacyInFooter={s.showPrivacyInFooter}
          setShowPrivacyInFooter={s.setShowPrivacyInFooter}
        />
      );
    case 'footer':
      return (
        <FooterTab
          footerCol1Title={s.footerCol1Title}
          setFooterCol1Title={s.setFooterCol1Title}
          footerText={s.footerText}
          setFooterText={s.setFooterText}
          footerCol2Title={s.footerCol2Title}
          setFooterCol2Title={s.setFooterCol2Title}
          footerCol2Text={s.footerCol2Text}
          setFooterCol2Text={s.setFooterCol2Text}
          footerCol3Title={s.footerCol3Title}
          setFooterCol3Title={s.setFooterCol3Title}
          footerCol4Title={s.footerCol4Title}
          setFooterCol4Title={s.setFooterCol4Title}
          footerCol4Text={s.footerCol4Text}
          setFooterCol4Text={s.setFooterCol4Text}
          footerBottomText={s.footerBottomText}
          setFooterBottomText={s.setFooterBottomText}
          storeName={s.storeName}
          footerShowPayments={s.footerShowPayments}
          setFooterShowPayments={s.setFooterShowPayments}
          footerShowMenu={s.footerShowMenu}
          setFooterShowMenu={s.setFooterShowMenu}
          footerShowNewsletter={s.footerShowNewsletter}
          setFooterShowNewsletter={s.setFooterShowNewsletter}
          footerShowSocial={s.footerShowSocial}
          setFooterShowSocial={s.setFooterShowSocial}
          socialFacebook={s.socialFacebook}
          setSocialFacebook={s.setSocialFacebook}
          socialInstagram={s.socialInstagram}
          setSocialInstagram={s.setSocialInstagram}
          socialYoutube={s.socialYoutube}
          setSocialYoutube={s.setSocialYoutube}
          socialWhatsapp={s.socialWhatsapp}
          setSocialWhatsapp={s.setSocialWhatsapp}
          socialTiktok={s.socialTiktok}
          setSocialTiktok={s.setSocialTiktok}
          socialSnapchat={s.socialSnapchat}
          setSocialSnapchat={s.setSocialSnapchat}
          socialTwitter={s.socialTwitter}
          setSocialTwitter={s.setSocialTwitter}
          floatingContactsEnabled={s.floatingContactsEnabled}
          setFloatingContactsEnabled={s.setFloatingContactsEnabled}
          floatingWhatsappEnabled={s.floatingWhatsappEnabled}
          setFloatingWhatsappEnabled={s.setFloatingWhatsappEnabled}
          floatingInstagramEnabled={s.floatingInstagramEnabled}
          setFloatingInstagramEnabled={s.setFloatingInstagramEnabled}
          floatingTiktokEnabled={s.floatingTiktokEnabled}
          setFloatingTiktokEnabled={s.setFloatingTiktokEnabled}
          floatingSnapchatEnabled={s.floatingSnapchatEnabled}
          setFloatingSnapchatEnabled={s.setFloatingSnapchatEnabled}
          floatingTwitterEnabled={s.floatingTwitterEnabled}
          setFloatingTwitterEnabled={s.setFloatingTwitterEnabled}
          floatingContactsPosition={s.floatingContactsPosition}
          setFloatingContactsPosition={s.setFloatingContactsPosition}
          floatingContactsScale={s.floatingContactsScale}
          setFloatingContactsScale={s.setFloatingContactsScale}
          floatingContactsBottomMobile={s.floatingContactsBottomMobile}
          setFloatingContactsBottomMobile={s.setFloatingContactsBottomMobile}
          floatingContactsBottomDesktop={s.floatingContactsBottomDesktop}
          setFloatingContactsBottomDesktop={s.setFloatingContactsBottomDesktop}
          floatingContactsSideMobile={s.floatingContactsSideMobile}
          setFloatingContactsSideMobile={s.setFloatingContactsSideMobile}
          floatingContactsSideDesktop={s.floatingContactsSideDesktop}
          setFloatingContactsSideDesktop={s.setFloatingContactsSideDesktop}
          floatingWhatsappPreset={s.floatingWhatsappPreset}
          setFloatingWhatsappPreset={s.setFloatingWhatsappPreset}
          floatingWhatsappNumber={s.floatingWhatsappNumber}
          setFloatingWhatsappNumber={s.setFloatingWhatsappNumber}
        />
      );
    default:
      return null;
  }
}
