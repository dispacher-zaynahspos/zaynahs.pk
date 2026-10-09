import { NextRequest, NextResponse } from 'next/server';
import { 
  getPendingAbandonmentEmails, 
  markAbandonmentEmailSent,
  purgeOldAbandonedCarts 
} from '@/lib/services/abandonedCarts';
import { sendTemplatedEmail } from '@/lib/email/sendTemplatedEmail';
import { getSettings } from '@/lib/services/settings';
import { getSiteUrl } from '@/lib/site-url-server';

/**
 * GET /api/cron/abandoned-cart
 * Vercel Cron job — runs daily.
 * 1) Purges abandoned carts older than 30 days to prevent DB storage bloat.
 * 2) Finds carts idle > 5 mins with customer email → sends abandonment email.
 */
export async function GET(req: NextRequest) {
  // Verify cron secret to prevent unauthorized calls
  const secret = req.headers.get('x-cron-secret') ?? req.nextUrl.searchParams.get('secret');
  const expectedSecret = process.env.CRON_SECRET || process.env.REVALIDATE_SECRET;
  if (expectedSecret && secret !== expectedSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1. Auto-purge old abandoned carts (>30 days) to prevent storage bloat
    let purgedCount = 0;
    try {
      const purgeRes = await purgeOldAbandonedCarts(30);
      purgedCount = purgeRes.count;
    } catch (purgeErr) {
      console.error('[abandoned-cart cron] Auto-purge failed:', purgeErr);
    }

    const settings = await getSettings();
    const siteUrl = await getSiteUrl(settings);

    // If abandoned cart emails are disabled in settings → skip email step
    if (settings.abandoned_cart_email_enabled === false) {
      return NextResponse.json({ skipped: true, reason: 'Abandoned cart emails disabled', purgedOldCarts: purgedCount });
    }

    const pendingCarts = await getPendingAbandonmentEmails();

    if (pendingCarts.length === 0) {
      return NextResponse.json({ processed: 0, purgedOldCarts: purgedCount });
    }

    let sent = 0;
    let failed = 0;

    for (const cart of pendingCarts) {
      if (!cart.customerEmail) continue;

      try {
        const checkoutUrl = cart.checkoutUrl || `${siteUrl}/cart?step=checkout`;

        // Send to customer using the new editable template system
        const result = await sendTemplatedEmail('abandoned_cart', cart.customerEmail, {
          customer_name: cart.customerName || 'Customer',
          checkout_url: checkoutUrl,
          order: {
            items: cart.items.map((i: any) => ({
              ...i,
              total: i.price * i.quantity
            }))
          },
          order_subtotal: `${settings.currency_symbol || 'Rs.'}${cart.subtotal.toLocaleString()}`,
          order_total: `${settings.currency_symbol || 'Rs.'}${cart.subtotal.toLocaleString()}`,
        });

        if (result.success) {
          await markAbandonmentEmailSent(cart.id);
          sent++;

          // Send admin alert using the admin editable template
          const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
          if (adminEmail && settings.abandoned_cart_admin_notify !== false) {
            await sendTemplatedEmail('admin_abandoned_cart', adminEmail, {
              customer_name: cart.customerName || 'Unknown',
              customer_email: cart.customerEmail,
              customer_phone: cart.customerPhone || '—',
              order_total: `${settings.currency_symbol || 'Rs.'}${cart.subtotal.toLocaleString()}`,
              last_activity: new Date(cart.lastActivity).toLocaleString()
            }).catch(e => console.error('[abandoned-cart cron] Admin notify failed:', e));
          }
        } else {
          console.error(`[abandoned-cart cron] Email failed for cart ${cart.id}:`, result.error);
          failed++;
        }
      } catch (err) {
        console.error(`[abandoned-cart cron] Error processing cart ${cart.id}:`, err);
        failed++;
      }
    }

    console.log(`[abandoned-cart cron] Processed ${pendingCarts.length} carts: ${sent} sent, ${failed} failed`);
    return NextResponse.json({ processed: pendingCarts.length, sent, failed });
  } catch (err: any) {
    console.error('[abandoned-cart cron] Fatal error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
