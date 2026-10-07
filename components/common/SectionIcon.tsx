'use client';

import React from 'react';
import {
  Truck, DollarSign, Sparkles, RefreshCw, ShieldCheck, Gift, Headphones,
  Package, Star, Heart, Tag, Clock, CheckCircle, CreditCard, Phone, Award,
  Zap, Lock,
} from '@/components/common/Icons';

/**
 * SSOT — shared SVG icon system for customizer "icon key" fields (value props,
 * etc.). UI/UX rule: NEVER render raw emoji in the storefront — store an icon
 * KEY and render the matching SVG here. Legacy emoji values are auto-migrated
 * to the closest key so saved data keeps working.
 */

type IconComp = React.ComponentType<React.SVGProps<SVGSVGElement>>;

export const SECTION_ICON_MAP: Record<string, IconComp> = {
  truck: Truck,
  delivery: Truck,
  cash: DollarSign,
  money: DollarSign,
  dollar: DollarSign,
  sparkles: Sparkles,
  quality: Sparkles,
  premium: Sparkles,
  returns: RefreshCw,
  refresh: RefreshCw,
  shield: ShieldCheck,
  secure: ShieldCheck,
  warranty: ShieldCheck,
  gift: Gift,
  support: Headphones,
  headphones: Headphones,
  package: Package,
  box: Package,
  star: Star,
  heart: Heart,
  tag: Tag,
  sale: Tag,
  clock: Clock,
  fast: Zap,
  zap: Zap,
  check: CheckCircle,
  verified: CheckCircle,
  card: CreditCard,
  payment: CreditCard,
  phone: Phone,
  whatsapp: Phone,
  award: Award,
  lock: Lock,
};

/** Ordered keys for an icon picker. */
export const SECTION_ICON_KEYS = Object.keys(SECTION_ICON_MAP);

/** Legacy emoji -> icon key (keeps old saved value-prop data working). */
const EMOJI_TO_KEY: Record<string, string> = {
  '\u{1F69A}': 'truck', '\u{1F69B}': 'truck', '\u{1F4E6}': 'package',
  '\u{1F4B5}': 'cash', '\u{1F4B0}': 'cash', '\u{1F4B2}': 'dollar', '\u{1F4B3}': 'card',
  '\u2728': 'sparkles', '\u2B50': 'star', '\u{1F31F}': 'star',
  '\u{1F504}': 'returns', '\u267B\uFE0F': 'returns', '\u{1F501}': 'refresh',
  '\u{1F6E1}\uFE0F': 'shield', '\u{1F512}': 'lock', '\u2705': 'check', '\u2714\uFE0F': 'check',
  '\u{1F381}': 'gift', '\u{1F3A7}': 'support', '\u260E\uFE0F': 'phone', '\u{1F4DE}': 'phone',
  '\u2764\uFE0F': 'heart', '\u{1F3F7}\uFE0F': 'tag', '\u23F0': 'clock', '\u{1F550}': 'clock',
  '\u26A1': 'zap', '\u{1F3C6}': 'award',
};

/** Resolve any stored value (key OR legacy emoji) to a known icon key. */
export function resolveIconKey(value?: string): string {
  if (!value) return 'sparkles';
  const v = value.trim();
  if (SECTION_ICON_MAP[v]) return v;
  if (EMOJI_TO_KEY[v]) return EMOJI_TO_KEY[v];
  return 'sparkles';
}

interface SectionIconProps {
  icon?: string;
  className?: string;
}

export function SectionIcon({ icon, className = 'h-6 w-6' }: SectionIconProps) {
  const Comp = SECTION_ICON_MAP[resolveIconKey(icon)] || Sparkles;
  return <Comp className={className} aria-hidden />;
}

export default SectionIcon;
