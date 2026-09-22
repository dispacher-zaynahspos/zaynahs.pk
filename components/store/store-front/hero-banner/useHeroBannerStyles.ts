import { HomepageSection } from '@/lib/types';

export function formatCssDimension(val: any, defaultVal: string): string {
  if (val === undefined || val === null || val === '') return defaultVal;
  const valStr = val.toString().trim();
  if (/^\d+$/.test(valStr)) {
    return `${valStr}px`;
  }
  return valStr;
}

export function useHeroBannerStyles(section: HomepageSection) {
  const heightDesktop = formatCssDimension(section.settings?.height_desktop, '450px');
  const heightTablet = formatCssDimension(section.settings?.height_tablet, '350px');
  const heightMobile = formatCssDimension(section.settings?.height_mobile, '250px');
  const opacity = section.settings?.overlay_opacity ?? 0.3;
  const overlayColor = section.settings?.overlay_color ?? '#000000';

  // Global settings
  const showBackdrop = section.settings?.show_backdrop_container ?? false;
  const backdropClass = showBackdrop
    ? ' bg-black/35 border border-white/10 p-5 md:p-8 rounded-2xl shadow-xl'
    : 'bg-transparent border-none p-0';

  // Desktop alignments
  const contentPosDesktopX =
    section.settings?.content_position_desktop_x || section.settings?.content_position_desktop || 'center';
  let containerJustifyDesktop = 'md:justify-center';
  if (contentPosDesktopX === 'left') containerJustifyDesktop = 'md:justify-start';
  if (contentPosDesktopX === 'right') containerJustifyDesktop = 'md:justify-end';

  const contentPosDesktopY = section.settings?.content_position_desktop_y || 'middle';
  let containerAlignDesktop = 'md:items-center';
  if (contentPosDesktopY === 'top') containerAlignDesktop = 'md:items-start';
  if (contentPosDesktopY === 'bottom') containerAlignDesktop = 'md:items-end';

  // Mobile alignments
  const contentPosMobileX = section.settings?.content_position_mobile_x || 'center';
  let containerJustifyMobile = 'justify-center';
  if (contentPosMobileX === 'left') containerJustifyMobile = 'justify-start';
  if (contentPosMobileX === 'right') containerJustifyMobile = 'justify-end';

  const contentPosMobileY = section.settings?.content_position_mobile_y || 'middle';
  let containerAlignMobile = 'items-center';
  if (contentPosMobileY === 'top') containerAlignMobile = 'items-start';
  if (contentPosMobileY === 'bottom') containerAlignMobile = 'items-end';

  // Tablet alignments
  const contentPosTabletX = section.settings?.content_position_tablet_x || 'center';
  let containerJustifyTablet = 'justify-center';
  if (contentPosTabletX === 'left') containerJustifyTablet = 'justify-start';
  if (contentPosTabletX === 'right') containerJustifyTablet = 'justify-end';

  const contentPosTabletY = section.settings?.content_position_tablet_y || 'middle';
  let containerAlignTablet = 'items-center';
  if (contentPosTabletY === 'top') containerAlignTablet = 'items-start';
  if (contentPosTabletY === 'bottom') containerAlignTablet = 'items-end';

  // Desktop text align
  const textAlignDesktop = section.settings?.text_align_desktop || 'center';
  let textColAlignDesktop = 'md:text-center md:items-center';
  if (textAlignDesktop === 'left') textColAlignDesktop = 'md:text-left md:items-start';
  if (textAlignDesktop === 'right') textColAlignDesktop = 'md:text-right md:items-end';

  // Tablet text align
  const textAlignTablet = section.settings?.text_align_tablet || 'center';
  let textColAlignTablet = 'text-center items-center';
  if (textAlignTablet === 'left') textColAlignTablet = 'text-left items-start';
  if (textAlignTablet === 'right') textColAlignTablet = 'text-right items-end';

  // Mobile text align
  const textAlignMobile = section.settings?.text_align_mobile || 'center';
  let textColAlignMobile = 'text-center items-center';
  if (textAlignMobile === 'left') textColAlignMobile = 'text-left items-start';
  if (textAlignMobile === 'right') textColAlignMobile = 'text-right items-end';

  // Heading size classes
  const headingSizeDesktop = section.settings?.heading_size_desktop || '5xl';
  const headingSizeTablet = section.settings?.heading_size_tablet || '3xl';
  const headingSizeMobile = section.settings?.heading_size_mobile || '2xl';

  let headingDesktopClass = 'md:text-5xl';
  if (headingSizeDesktop === '2xl') headingDesktopClass = 'md:text-2xl';
  if (headingSizeDesktop === '3xl') headingDesktopClass = 'md:text-3xl';
  if (headingSizeDesktop === '4xl') headingDesktopClass = 'md:text-4xl';
  if (headingSizeDesktop === '6xl') headingDesktopClass = 'md:text-6xl';

  let headingTabletClass = 'text-3xl';
  if (headingSizeTablet === 'lg') headingTabletClass = 'text-lg';
  if (headingSizeTablet === 'xl') headingTabletClass = 'text-xl';
  if (headingSizeTablet === '2xl') headingTabletClass = 'text-2xl';
  if (headingSizeTablet === '4xl') headingTabletClass = 'text-4xl';
  if (headingSizeTablet === '5xl') headingTabletClass = 'text-5xl';

  let headingMobileClass = 'text-2xl';
  if (headingSizeMobile === 'lg') headingMobileClass = 'text-lg';
  if (headingSizeMobile === 'xl') headingMobileClass = 'text-xl';
  if (headingSizeMobile === '3xl') headingMobileClass = 'text-3xl';

  // Image focal points and zoom
  const imageScaleDesktop = section.settings?.image_scale_desktop ?? 100;
  const imageFocalXDesktop = section.settings?.image_focal_x_desktop ?? 50;
  const imageFocalYDesktop = section.settings?.image_focal_y_desktop ?? 50;

  const imageScaleTablet = section.settings?.image_scale_tablet ?? 100;
  const imageFocalXTablet = section.settings?.image_focal_x_tablet ?? 50;
  const imageFocalYTablet = section.settings?.image_focal_y_tablet ?? 50;

  const imageScaleMobile = section.settings?.image_scale_mobile ?? 100;
  const imageFocalXMobile = section.settings?.image_focal_x_mobile ?? 50;
  const imageFocalYMobile = section.settings?.image_focal_y_mobile ?? 50;

  const contentWidthDesktop = formatCssDimension(section.settings?.content_width_desktop, '576px');
  const contentWidthTablet = formatCssDimension(section.settings?.content_width_tablet, '600px');
  const contentWidthMobile = formatCssDimension(section.settings?.content_width_mobile, '100%');

  const taglineColor = section.settings?.tagline_color || '#ffffff';
  const headingColor = section.settings?.heading_color || '#ffffff';
  const subtitleColor = section.settings?.subtitle_color || '#e0e0e0';

  const primaryButtonBg = section.settings?.btn_bg_color || '#e94560';
  const primaryButtonTextColor = section.settings?.btn_text_color || '#ffffff';
  const secondaryButtonBg = section.settings?.sec_btn_bg_color || 'transparent';
  const secondaryButtonTextColor = section.settings?.sec_btn_text_color || '#ffffff';

  return {
    heightDesktop,
    heightTablet,
    heightMobile,
    opacity,
    overlayColor,
    backdropClass,
    containerJustifyDesktop,
    containerAlignDesktop,
    containerJustifyMobile,
    containerAlignMobile,
    containerJustifyTablet,
    containerAlignTablet,
    textColAlignDesktop,
    textColAlignTablet,
    textColAlignMobile,
    headingDesktopClass,
    headingTabletClass,
    headingMobileClass,
    imageScaleDesktop,
    imageFocalXDesktop,
    imageFocalYDesktop,
    imageScaleTablet,
    imageFocalXTablet,
    imageFocalYTablet,
    imageScaleMobile,
    imageFocalXMobile,
    imageFocalYMobile,
    contentWidthDesktop,
    contentWidthTablet,
    contentWidthMobile,
    taglineColor,
    headingColor,
    subtitleColor,
    primaryButtonBg,
    primaryButtonTextColor,
    secondaryButtonBg,
    secondaryButtonTextColor,
  };
}
