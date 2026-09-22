'use client';

import React from 'react';
import {
  FooterColumnsConfig,
  FooterVisibilityConfig,
  SocialMediaLinksConfig,
  FloatingContactsConfig,
} from './footer';

interface FooterTabProps {
  footerCol1Title: string;
  setFooterCol1Title: (val: string) => void;
  footerText: string;
  setFooterText: (val: string) => void;
  footerCol2Title: string;
  setFooterCol2Title: (val: string) => void;
  footerCol2Text: string;
  setFooterCol2Text: (val: string) => void;
  footerCol3Title: string;
  setFooterCol3Title: (val: string) => void;
  footerCol4Title: string;
  setFooterCol4Title: (val: string) => void;
  footerCol4Text: string;
  setFooterCol4Text: (val: string) => void;
  footerBottomText: string;
  setFooterBottomText: (val: string) => void;
  storeName: string;

  footerShowPayments: boolean;
  setFooterShowPayments: (val: boolean) => void;
  footerShowMenu: boolean;
  setFooterShowMenu: (val: boolean) => void;
  footerShowNewsletter: boolean;
  setFooterShowNewsletter: (val: boolean) => void;
  footerShowSocial: boolean;
  setFooterShowSocial: (val: boolean) => void;

  socialFacebook: string;
  setSocialFacebook: (val: string) => void;
  socialInstagram: string;
  setSocialInstagram: (val: string) => void;
  socialYoutube: string;
  setSocialYoutube: (val: string) => void;
  socialWhatsapp: string;
  setSocialWhatsapp: (val: string) => void;
  socialTiktok: string;
  setSocialTiktok: (val: string) => void;
  socialSnapchat: string;
  setSocialSnapchat: (val: string) => void;
  socialTwitter: string;
  setSocialTwitter: (val: string) => void;

  floatingContactsEnabled: boolean;
  setFloatingContactsEnabled: (val: boolean) => void;
  floatingWhatsappEnabled: boolean;
  setFloatingWhatsappEnabled: (val: boolean) => void;
  floatingInstagramEnabled: boolean;
  setFloatingInstagramEnabled: (val: boolean) => void;
  floatingTiktokEnabled: boolean;
  setFloatingTiktokEnabled: (val: boolean) => void;
  floatingSnapchatEnabled: boolean;
  setFloatingSnapchatEnabled: (val: boolean) => void;
  floatingTwitterEnabled: boolean;
  setFloatingTwitterEnabled: (val: boolean) => void;

  floatingContactsPosition: 'left' | 'right';
  setFloatingContactsPosition: (val: 'left' | 'right') => void;
  floatingContactsScale: number;
  setFloatingContactsScale: (val: number) => void;
  floatingContactsBottomMobile: number;
  setFloatingContactsBottomMobile: (val: number) => void;
  floatingContactsBottomDesktop: number;
  setFloatingContactsBottomDesktop: (val: number) => void;
  floatingContactsSideMobile: number;
  setFloatingContactsSideMobile: (val: number) => void;
  floatingContactsSideDesktop: number;
  setFloatingContactsSideDesktop: (val: number) => void;
  floatingWhatsappPreset: string;
  setFloatingWhatsappPreset: (val: string) => void;
  floatingWhatsappNumber: string;
  setFloatingWhatsappNumber: (val: string) => void;
}

export default function FooterTab(props: FooterTabProps) {
  return (
    <div className="space-y-8">
      <FooterColumnsConfig
        footerCol1Title={props.footerCol1Title}
        setFooterCol1Title={props.setFooterCol1Title}
        footerText={props.footerText}
        setFooterText={props.setFooterText}
        footerCol2Title={props.footerCol2Title}
        setFooterCol2Title={props.setFooterCol2Title}
        footerCol2Text={props.footerCol2Text}
        setFooterCol2Text={props.setFooterCol2Text}
        footerCol3Title={props.footerCol3Title}
        setFooterCol3Title={props.setFooterCol3Title}
        footerCol4Title={props.footerCol4Title}
        setFooterCol4Title={props.setFooterCol4Title}
        footerCol4Text={props.footerCol4Text}
        setFooterCol4Text={props.setFooterCol4Text}
        footerBottomText={props.footerBottomText}
        setFooterBottomText={props.setFooterBottomText}
        storeName={props.storeName}
      />

      <FooterVisibilityConfig
        footerShowMenu={props.footerShowMenu}
        setFooterShowMenu={props.setFooterShowMenu}
        footerShowNewsletter={props.footerShowNewsletter}
        setFooterShowNewsletter={props.setFooterShowNewsletter}
        footerShowSocial={props.footerShowSocial}
        setFooterShowSocial={props.setFooterShowSocial}
        footerShowPayments={props.footerShowPayments}
        setFooterShowPayments={props.setFooterShowPayments}
      />

      <SocialMediaLinksConfig
        socialFacebook={props.socialFacebook}
        setSocialFacebook={props.setSocialFacebook}
        socialInstagram={props.socialInstagram}
        setSocialInstagram={props.setSocialInstagram}
        socialYoutube={props.socialYoutube}
        setSocialYoutube={props.setSocialYoutube}
        socialWhatsapp={props.socialWhatsapp}
        setSocialWhatsapp={props.setSocialWhatsapp}
        socialTiktok={props.socialTiktok}
        setSocialTiktok={props.setSocialTiktok}
        socialSnapchat={props.socialSnapchat}
        setSocialSnapchat={props.setSocialSnapchat}
        socialTwitter={props.socialTwitter}
        setSocialTwitter={props.setSocialTwitter}
      />

      <FloatingContactsConfig
        floatingContactsEnabled={props.floatingContactsEnabled}
        setFloatingContactsEnabled={props.setFloatingContactsEnabled}
        floatingWhatsappEnabled={props.floatingWhatsappEnabled}
        setFloatingWhatsappEnabled={props.setFloatingWhatsappEnabled}
        floatingInstagramEnabled={props.floatingInstagramEnabled}
        setFloatingInstagramEnabled={props.setFloatingInstagramEnabled}
        floatingTiktokEnabled={props.floatingTiktokEnabled}
        setFloatingTiktokEnabled={props.setFloatingTiktokEnabled}
        floatingSnapchatEnabled={props.floatingSnapchatEnabled}
        setFloatingSnapchatEnabled={props.setFloatingSnapchatEnabled}
        floatingTwitterEnabled={props.floatingTwitterEnabled}
        setFloatingTwitterEnabled={props.setFloatingTwitterEnabled}
        floatingContactsPosition={props.floatingContactsPosition}
        setFloatingContactsPosition={props.setFloatingContactsPosition}
        floatingContactsScale={props.floatingContactsScale}
        setFloatingContactsScale={props.setFloatingContactsScale}
        floatingContactsBottomMobile={props.floatingContactsBottomMobile}
        setFloatingContactsBottomMobile={props.setFloatingContactsBottomMobile}
        floatingContactsBottomDesktop={props.floatingContactsBottomDesktop}
        setFloatingContactsBottomDesktop={props.setFloatingContactsBottomDesktop}
        floatingContactsSideMobile={props.floatingContactsSideMobile}
        setFloatingContactsSideMobile={props.setFloatingContactsSideMobile}
        floatingContactsSideDesktop={props.floatingContactsSideDesktop}
        setFloatingContactsSideDesktop={props.setFloatingContactsSideDesktop}
        floatingWhatsappPreset={props.floatingWhatsappPreset}
        setFloatingWhatsappPreset={props.setFloatingWhatsappPreset}
        floatingWhatsappNumber={props.floatingWhatsappNumber}
        setFloatingWhatsappNumber={props.setFloatingWhatsappNumber}
      />
    </div>
  );
}
