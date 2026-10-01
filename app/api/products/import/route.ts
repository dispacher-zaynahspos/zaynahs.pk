import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { ExportBundle } from '@/lib/types';
import { importSingleProductCore } from './importCore';

export const maxDuration = 300; // Allow up to 5 minutes on Vercel Pro

export async function POST(request: NextRequest) {
  try {
    // Authenticate admin (session + admin-email allow-list — single source of truth)
    const denied = await requireAdmin(request);
    if (denied) return denied;

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const strategy = (formData.get('strategy') as 'skip' | 'overwrite' | 'rename') || 'skip';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const text = await file.text();
    const bundle = JSON.parse(text) as ExportBundle;

    if (!bundle || bundle.version !== '1.0' || !bundle.products || !Array.isArray(bundle.products)) {
      return NextResponse.json({ error: 'Invalid export file format' }, { status: 400 });
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        // Helper to send progress chunks
        const sendProgress = (result: any) => {
          controller.enqueue(encoder.encode(JSON.stringify(result) + '\n'));
        };

        // Notify client of start and total count
        sendProgress({ type: 'start', total: bundle.products.length });

        let categoryCache: Record<string, string> = {};

        for (const p of bundle.products) {
          const result = await importSingleProductCore(p, strategy, categoryCache);
          if (result.categoryCache) {
            categoryCache = result.categoryCache;
          }
          sendProgress(result);
        }

        // RULE C10: bulk import mutated products/categories across many rows —
        // invalidate all layers once at the end (tags + paths + full Cloudflare purge).
        try {
          const { revalidateTagSafe, revalidateHomepage } = await import('@/lib/revalidate');
          await revalidateTagSafe('products');
          await revalidateTagSafe('categories');
          await revalidateHomepage();
        } catch (revalErr) {
          console.warn('[Import API] Post-import cache revalidation failed:', revalErr);
        }

        controller.close();
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'application/x-ndjson',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });

  } catch (error: any) {
    console.error('[Import API] Import process crashed:', error);
    return NextResponse.json(
      { error: error.message || 'Import failed' },
      { status: 500 }
    );
  }
}
