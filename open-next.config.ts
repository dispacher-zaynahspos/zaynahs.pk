import { defineCloudflareConfig } from '@opennextjs/cloudflare';
import r2IncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache';
import doQueue from '@opennextjs/cloudflare/overrides/queue/do-queue';
import doShardedTagCache from '@opennextjs/cloudflare/overrides/tag-cache/do-sharded-tag-cache';

/**
 * OpenNext Cloudflare configuration.
 *
 * - Incremental cache: R2 (per-brand bucket, binding NEXT_INC_CACHE_R2_BUCKET)
 * - Revalidation queue: Durable Object (NEXT_CACHE_DO_QUEUE)
 * - Tag cache: Durable Object shards (NEXT_TAG_CACHE_DO_QUEUE)
 *
 * No KV, no D1. Bucket/worker names live in the generated Wrangler config,
 * never here — this file is brand-neutral.
 */
export default defineCloudflareConfig({
  incrementalCache: r2IncrementalCache,
  queue: doQueue,
  tagCache: doShardedTagCache({ baseShardSize: 12 }),
});
