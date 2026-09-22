import { SocialProof } from '@/lib/types';
import { supabaseAdmin } from '@/lib/supabase/admin';

export interface DBSocialProof {
  id: string;
  image_url: string;
  caption?: string | null;
  source_type: string;
  active: boolean;
  sort_order: number;
  created_at: string;
  deleted_at?: string | null;
}

export const mapSocialProof = (row: DBSocialProof): SocialProof => ({
  id: row.id,
  imageUrl: row.image_url,
  caption: row.caption || undefined,
  sourceType: row.source_type as SocialProof['sourceType'],
  active: row.active,
  sortOrder: row.sort_order,
  createdAt: row.created_at,
  deletedAt: row.deleted_at || undefined,
  linkedProducts: [],
  productIds: []
});

export async function attachLinkedProducts(proofs: SocialProof[]): Promise<SocialProof[]> {
  if (proofs.length === 0) return proofs;
  try {
    const { data: junctionRows } = await supabaseAdmin
      .from('social_proof_products')
      .select('social_proof_id, product_id, products!left(id, name, slug)')
      .in('social_proof_id', proofs.map(p => p.id));

    if (!junctionRows) return proofs;

    const productsByProofId: Record<string, any[]> = {};
    const allProductIds = new Set<string>();
    for (const row of junctionRows as any[]) {
      if (!productsByProofId[row.social_proof_id]) productsByProofId[row.social_proof_id] = [];
      if (row.products) {
        const p = row.products;
        productsByProofId[row.social_proof_id].push({ id: p.id, name: p.name, slug: p.slug });
        allProductIds.add(p.id);
      }
    }

    const imageMap: Record<string, string | undefined> = {};
    if (allProductIds.size > 0) {
      const { data: images } = await supabaseAdmin
        .from('product_images')
        .select('product_id, url, is_primary')
        .in('product_id', [...allProductIds]);
      if (images) {
        for (const img of images) {
          if (!imageMap[img.product_id] || img.is_primary) {
            imageMap[img.product_id] = img.url;
          }
        }
      }
    }

    return proofs.map(proof => ({
      ...proof,
      linkedProducts: (productsByProofId[proof.id] || []).map((p: any) => ({
        ...p,
        image: imageMap[p.id]
      })),
      productIds: (productsByProofId[proof.id] || []).map((p: any) => p.id)
    }));
  } catch (err) {
    console.error('[socialProof] attachLinkedProducts failed:', err);
    return proofs;
  }
}
