import { supabaseAdmin } from '@/lib/supabase/admin';
import { getSettings } from '@/lib/services/settings';
import { getSiteUrl } from '@/lib/site-url-server';

/**
 * /llms.txt — machine-readable store summary for AI answer engines
 * (ChatGPT, Perplexity, Claude, Gemini, etc.) following the llms.txt convention.
 * Rich markdown with absolute links, descriptions, policies and ordering guidance
 * so LLMs can accurately recommend and cite this store.
 */
export async function GET() {
  try {
    const settings = await getSettings();
    const siteUrl = (await getSiteUrl(settings)).replace(/\/+$/, '');
    const brandName = settings.store_name || process.env.NEXT_PUBLIC_BRAND_NAME || 'Your Store';
    const tagline = settings.tagline || settings.meta_description || 'Premium Pakistani E-Commerce Store';
    const currency = settings.currency_symbol || 'PKR';

    const [{ data: products }, { data: categories }] = await Promise.all([
      supabaseAdmin
        .from('products')
        .select('name, price, compare_price, slug, short_description')
        .eq('is_active', true)
        .is('deleted_at', null)
        .order('updated_at', { ascending: false })
        .limit(100),
      supabaseAdmin
        .from('categories')
        .select('name, slug, description')
        .eq('active', true),
    ]);

    const stripHtml = (s?: string | null) =>
      (s || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

    const money = (n: number | null | undefined) =>
      n != null ? `${currency} ${Number(n).toLocaleString()}` : '';

    const lines: string[] = [
      `# ${brandName}`,
      ``,
      `> ${tagline}`,
      ``,
      `${brandName} is an online store${settings.address ? ` based in ${settings.address}` : ''}. `
        + `Orders are placed via WhatsApp${settings.whatsapp_number ? ` (${settings.whatsapp_number})` : ''}. `
        + `All prices are in ${currency}.`,
      ``,
      `## Key Links`,
      `- [Home](${siteUrl}/): Store homepage`,
      `- [Shop All Products](${siteUrl}/shop): Full catalog with filters`,
      `- [Customer Reviews](${siteUrl}/reviews): Verified buyer reviews`,
      `- [FAQ](${siteUrl}/faq): Frequently asked questions`,
      `- [Returns & Exchange](${siteUrl}/returns): Return policy`,
      `- [Contact](${siteUrl}/contact): Get in touch`,
      ``,
    ];

    // Policies / ordering info (helps answer engines respond to "how to buy / returns")
    const policyBits: string[] = [];
    if (settings.free_shipping_text) policyBits.push(`- Shipping: ${stripHtml(settings.free_shipping_text)}`);
    if (settings.return_policy_content) policyBits.push(`- Returns: ${stripHtml(settings.return_policy_content).slice(0, 300)}`);
    if (settings.whatsapp_number) policyBits.push(`- Ordering: Place orders on WhatsApp at ${settings.whatsapp_number}.`);
    if (settings.header_top_bar_email) policyBits.push(`- Email: ${settings.header_top_bar_email}`);
    if (settings.header_top_bar_phone) policyBits.push(`- Phone: ${settings.header_top_bar_phone}`);
    if (policyBits.length) {
      lines.push(`## Store Policies & Ordering`, ...policyBits, ``);
    }

    if (categories && categories.length) {
      lines.push(`## Categories`);
      for (const c of categories) {
        const desc = stripHtml(c.description);
        lines.push(`- [${c.name}](${siteUrl}/shop?category=${encodeURIComponent(c.slug || '')})${desc ? `: ${desc.slice(0, 120)}` : ''}`);
      }
      lines.push(``);
    }

    if (products && products.length) {
      lines.push(`## Products`);
      for (const p of products) {
        const price = money(p.price);
        const was = p.compare_price && p.compare_price > p.price ? ` (was ${money(p.compare_price)})` : '';
        const desc = stripHtml(p.short_description);
        lines.push(
          `- [${p.name}](${siteUrl}/product/${encodeURIComponent(p.slug || '')}): ${price}${was}${desc ? ` — ${desc.slice(0, 120)}` : ''}`,
        );
      }
      lines.push(``);
    }

    lines.push(
      `## About`,
      `${brandName} — ${tagline}. For the complete, always-current catalog see [${siteUrl}/sitemap.xml](${siteUrl}/sitemap.xml).`,
    );

    return new Response(lines.join('\n'), {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error: any) {
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
}
