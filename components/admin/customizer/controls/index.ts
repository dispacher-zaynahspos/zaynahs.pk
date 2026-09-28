'use client';

/**
 * Customizer shared control library (Phase 1 foundation, RULE SSOT1).
 * One design language, aligned label-left/control-right, device-aware.
 *
 * Import from '@/components/admin/customizer/controls'.
 */
export { ControlRow, DeviceBadge, HelpTip, DEVICE_ICON } from './ControlPrimitives';
export {
  ToggleControl,
  TextControl,
  TextareaControl,
  SelectControl,
  SegmentedControl,
  SliderControl,
  LinkControl,
} from './BasicControls';
export {
  ColorControl,
  SpacingControl,
  AlignmentControl,
} from './ColorSpacingControls';
export type { SpacingValue } from './ColorSpacingControls';
export { AccordionGroup, SettingsSearch } from './AccordionGroup';
export { RepeaterControl } from './RepeaterControl';
export type { RepeaterControlProps } from './RepeaterControl';
// Media URL + library picker is the existing single-source field.
export { default as MediaControl } from '../shared/MediaField';
