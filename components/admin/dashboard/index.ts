export * from './types';
export * from './utils';
export { default as DashboardMetricsGrid } from './DashboardMetricsGrid';
// DUP6 SSOT: revenue chart / status breakdown / top products now live in the shared
// reporting-widgets folder (one source for Dashboard + Reporting).
export { RevenueChartSection, StatusBreakdownCard, TopProductsSection } from '@/components/admin/shared/reporting-widgets';
export { default as RecentActivityCard } from './RecentActivityCard';
export { default as InventorySnapshotCard } from './InventorySnapshotCard';
