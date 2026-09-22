'use server';

import { SocialProof } from '@/lib/types';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { mapSocialProof, attachLinkedProducts } from './types';

const fetchTopSocialProofs = async (limit: number = 2): Promise<SocialProof[]> => {
  try {
    const { data, error } = await supabaseAdmin
      .from('social_proof')
      .select('*')
      .eq('active', true)
      .is('deleted_at', null)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    const proofs = (data ?? []).map(mapSocialProof);
    return attachLinkedProducts(proofs);
  } catch (error) {
    console.error('[socialProof] fetchTopSocialProofs failed:', error);
    return [];
  }
};

export const getTopSocialProofs = async (limit: number = 2): Promise<SocialProof[]> => {
  if (typeof window !== 'undefined') {
    return fetchTopSocialProofs(limit);
  }
  try {
    const { unstable_cache } = await import('next/cache');
    const cachedFn = unstable_cache(
      (lim: number) => fetchTopSocialProofs(lim),
      ['top-social-proofs-list'],
      { revalidate: 86400, tags: ['social_proof'] }
    );
    return cachedFn(limit);
  } catch {
    return fetchTopSocialProofs(limit);
  }
};

const fetchActiveSocialProofCount = async (): Promise<number> => {
  try {
    const { count } = await supabaseAdmin
      .from('social_proof')
      .select('id', { count: 'exact', head: true })
      .eq('active', true)
      .is('deleted_at', null);
    return count ?? 0;
  } catch (error) {
    console.error('[socialProof] fetchActiveSocialProofCount failed:', error);
    return 0;
  }
};

export const getActiveSocialProofCount = async (): Promise<number> => {
  if (typeof window !== 'undefined') {
    return fetchActiveSocialProofCount();
  }
  try {
    const { unstable_cache } = await import('next/cache');
    const cachedFn = unstable_cache(
      fetchActiveSocialProofCount,
      ['active-social-proof-count'],
      { revalidate: 300, tags: ['social_proof'] }
    );
    return cachedFn();
  } catch {
    return fetchActiveSocialProofCount();
  }
};

const fetchSocialProofCountForProduct = async (productId: string): Promise<number> => {
  try {
    const { count } = await supabaseAdmin
      .from('social_proof_products')
      .select('product_id', { count: 'exact', head: true })
      .eq('product_id', productId);
    return count ?? 0;
  } catch (error) {
    console.error('[socialProof] fetchSocialProofCountForProduct failed:', error);
    return 0;
  }
};

export const getSocialProofCountForProduct = async (productId: string): Promise<number> => {
  if (typeof window !== 'undefined') {
    return fetchSocialProofCountForProduct(productId);
  }
  try {
    const { unstable_cache } = await import('next/cache');
    const cachedFn = unstable_cache(
      () => fetchSocialProofCountForProduct(productId),
      [`social-proof-count-${productId}`],
      { revalidate: 300, tags: ['social_proof'] }
    );
    return cachedFn();
  } catch {
    return fetchSocialProofCountForProduct(productId);
  }
};

export const getSocialProofs = async (): Promise<SocialProof[]> => {
  try {
    const { data, error } = await supabaseAdmin
      .from('social_proof')
      .select('*')
      .eq('active', true)
      .is('deleted_at', null)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) throw error;
    const proofs = (data ?? []).map(mapSocialProof);
    return attachLinkedProducts(proofs);
  } catch (error) {
    console.error('[socialProof] getSocialProofs failed:', error);
    return [];
  }
};

export const getAllSocialProofs = async (): Promise<SocialProof[]> => {
  try {
    const { data, error } = await supabaseAdmin
      .from('social_proof')
      .select('*')
      .is('deleted_at', null)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    const proofs = (data ?? []).map(mapSocialProof);
    return attachLinkedProducts(proofs);
  } catch (error) {
    console.error('[socialProof] getAllSocialProofs failed:', error);
    throw error;
  }
};

export const getDeletedSocialProofs = async (): Promise<SocialProof[]> => {
  try {
    const { data, error } = await supabaseAdmin
      .from('social_proof')
      .select('*')
      .not('deleted_at', 'is', null)
      .order('deleted_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapSocialProof);
  } catch (error) {
    console.error('[socialProof] getDeletedSocialProofs failed:', error);
    throw error;
  }
};
