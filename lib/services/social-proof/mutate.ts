'use server';

import { SocialProof } from '@/lib/types';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { revalidateStorefrontEdge } from '@/lib/revalidate';
import { DBSocialProof, mapSocialProof, attachLinkedProducts } from './types';

export const submitSocialProof = async (proof: {
  imageUrl: string;
  caption?: string;
  sourceType: 'whatsapp' | 'instagram' | 'facebook' | 'manual';
  productIds?: string[];
}): Promise<SocialProof> => {
  try {
    const { data, error } = await supabaseAdmin
      .from('social_proof')
      .insert({
        image_url: proof.imageUrl,
        caption: proof.caption || null,
        source_type: proof.sourceType,
        active: true,
        sort_order: 0
      })
      .select('*')
      .single();

    if (error) throw error;

    if (proof.productIds && proof.productIds.length > 0) {
      const junctionRows = proof.productIds.map(productId => ({
        social_proof_id: data.id,
        product_id: productId
      }));
      const { error: junctionError } = await supabaseAdmin
        .from('social_proof_products')
        .insert(junctionRows);
      if (junctionError) {
        // RULE D15 (atomic write): the parent row was created but the product links
        // failed — roll back the parent so we never leave an orphan social_proof.
        await supabaseAdmin.from('social_proof').delete().eq('id', data.id);
        throw junctionError;
      }
    }

    await revalidateStorefrontEdge('social_proof');

    const [fullProof] = await attachLinkedProducts([mapSocialProof(data as DBSocialProof)]);
    return fullProof;
  } catch (error) {
    console.error('[socialProof] submitSocialProof failed:', error);
    throw error;
  }
};

export const updateSocialProof = async (id: string, updates: {
  imageUrl?: string;
  caption?: string;
  sourceType?: 'whatsapp' | 'instagram' | 'facebook' | 'manual';
  productIds?: string[];
}): Promise<SocialProof> => {
  try {
    const updateData: Record<string, any> = {};
    if (updates.imageUrl !== undefined) updateData.image_url = updates.imageUrl;
    if (updates.caption !== undefined) updateData.caption = updates.caption;
    if (updates.sourceType !== undefined) updateData.source_type = updates.sourceType;

    if (Object.keys(updateData).length > 0) {
      const { error } = await supabaseAdmin
        .from('social_proof')
        .update(updateData)
        .eq('id', id);
      if (error) throw error;
    }

    if (updates.productIds !== undefined) {
      // RULE D15 (atomic write): snapshot existing links BEFORE delete so a failed
      // re-insert can be rolled back — never lose the product links half-way.
      const { data: prevLinks } = await supabaseAdmin
        .from('social_proof_products')
        .select('social_proof_id, product_id')
        .eq('social_proof_id', id);

      const { error: delError } = await supabaseAdmin
        .from('social_proof_products')
        .delete()
        .eq('social_proof_id', id);
      if (delError) throw delError;

      if (updates.productIds.length > 0) {
        const junctionRows = updates.productIds.map(productId => ({
          social_proof_id: id,
          product_id: productId
        }));
        const { error: insError } = await supabaseAdmin
          .from('social_proof_products')
          .insert(junctionRows);
        if (insError) {
          // Restore the previous links so nothing is lost on partial failure.
          if (prevLinks && prevLinks.length > 0) {
            await supabaseAdmin.from('social_proof_products').insert(prevLinks);
          }
          throw insError;
        }
      }
    }

    await revalidateStorefrontEdge('social_proof');

    const { data: refreshed } = await supabaseAdmin
      .from('social_proof')
      .select('*')
      .eq('id', id)
      .single();
    const [fullProof] = await attachLinkedProducts([mapSocialProof(refreshed)]);
    return fullProof;
  } catch (error) {
    console.error('[socialProof] updateSocialProof failed:', error);
    throw error;
  }
};

export const deleteSocialProof = async (id: string): Promise<void> => {
  try {
    const { error } = await supabaseAdmin
      .from('social_proof')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
    await revalidateStorefrontEdge('social_proof');
  } catch (error) {
    console.error('[socialProof] deleteSocialProof failed:', error);
    throw error;
  }
};

export const restoreSocialProof = async (id: string): Promise<void> => {
  try {
    const { error } = await supabaseAdmin
      .from('social_proof')
      .update({ deleted_at: null })
      .eq('id', id);
    if (error) throw error;
    await revalidateStorefrontEdge('social_proof');
  } catch (error) {
    console.error('[socialProof] restoreSocialProof failed:', error);
    throw error;
  }
};

export const hardDeleteSocialProof = async (id: string): Promise<void> => {
  try {
    const { error } = await supabaseAdmin
      .from('social_proof')
      .delete()
      .eq('id', id);
    if (error) throw error;
    await revalidateStorefrontEdge('social_proof');
  } catch (error) {
    console.error('[socialProof] hardDeleteSocialProof failed:', error);
    throw error;
  }
};
