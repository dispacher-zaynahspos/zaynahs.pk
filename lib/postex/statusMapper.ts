import { PostExOrderDist, CleanFulfillmentStatus } from './types';

/**
 * Extracts newest milestone status message from timeline history (sorted descending)
 */
export function getLatestPostExStatus(dist?: PostExOrderDist): string {
  if (!dist) return 'Booked';
  const list = dist.transactionStatusHistory;
  if (Array.isArray(list) && list.length > 0) {
    const sorted = [...list].sort((a, b) => {
      const timeA = new Date(a.modifiedDatetime || a.createdDatetime || a.datetime || 0).getTime();
      const timeB = new Date(b.modifiedDatetime || b.createdDatetime || b.datetime || 0).getTime();
      return timeB - timeA;
    });
    const msg = sorted[0]?.transactionStatusMessage;
    if (msg && msg.trim()) return msg.trim();
  }
  return dist.transactionStatus || dist.orderStatus || 'Booked';
}

/**
 * Maps courier message to clean unified e-commerce fulfillment status
 */
export function mapPostExToFulfillmentStatus(rawStatus?: string): CleanFulfillmentStatus {
  if (!rawStatus) return 'PENDING_LOADSHEET';
  const s = rawStatus.toLowerCase().trim();

  if (s.includes('cancel')) return 'CANCELLED';
  if (s.includes('delivered') || s === 'deliver' || s.includes('cash collected')) return 'DELIVERED';
  if (s.includes('out for delivery') || s.includes('with rider') || s.includes('waiting for delivery')) {
    return 'OUT_FOR_DELIVERY';
  }
  if (
    s.includes('attempt') ||
    s.includes('unreachable') ||
    s.includes('refused') ||
    s.includes('failed') ||
    s.includes('hold') ||
    s.includes('review')
  ) {
    return 'ACTION_REQUIRED';
  }
  if (s.includes('return') && !s.includes('return to sender requested')) {
    return 'RETURNED';
  }
  if (
    s.includes('transit') ||
    s.includes('depart') ||
    s.includes('arrive') ||
    s.includes('hub') ||
    s.includes('station') ||
    s.includes('postex warehouse') ||
    s.includes('picked by postex')
  ) {
    return 'IN_TRANSIT';
  }
  if (s === 'unbooked' || s.includes('unassigned') || s.includes('un-assigned')) {
    return 'PENDING_LOADSHEET';
  }

  return 'BOOKED';
}

/**
 * Detailed Milestone Preservation: Prevents generic "In Transit" from wiping specific city locations
 */
export function determineNewStatus(currentStatus: string, fetchedStatus: string): string {
  if (!fetchedStatus) return currentStatus;
  const clean = fetchedStatus.trim();
  const f = clean.toLowerCase();

  if (!clean || f === 'unknown' || f === 'null' || f === 'undefined' || f.includes('not found')) {
    return currentStatus;
  }
  if (f.includes('unassigned') || f.includes('un-assigned') || f === 'success') {
    return 'Booked';
  }

  const isDetailed = (txt: string) => {
    const l = txt.toLowerCase();
    return l.includes('depart') || l.includes('arrive') || l.includes('received at') || l.includes('at transit');
  };

  // Preserve location milestone if fetched status is merely generic "In Transit"
  if (isDetailed(currentStatus) && (f === 'in transit' || f === 'in-transit' || f === 'intransit')) {
    return currentStatus;
  }

  return clean;
}
