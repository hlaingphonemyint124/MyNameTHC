// ─── useProducts: Supabase hook with optional real-time ──────────────────────
import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

export type Product = Database['public']['Tables']['products']['Row'];

interface UseProductsOptions {
  featured?: boolean;
  isNew?: boolean;
  category?: string;
  limit?: number;
  realtime?: boolean;
}

export const useProducts = (opts: UseProductsOptions = {}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setError(null);
      let query = supabase.from('products').select('*');

      if (opts.featured) query = query.eq('is_featured', true);
      if (opts.isNew)    query = query.eq('is_new', true);
      if (opts.category && opts.category !== 'All') {
        query = query.eq('category', opts.category);
      }
      query = query.order('created_at', { ascending: false });
      if (opts.limit) query = query.limit(opts.limit);

      const { data, error: err } = await query;
      if (err) throw err;
      setProducts(data ?? []);
    } catch (err: any) {
      setError(err.message ?? 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [opts.featured, opts.isNew, opts.category, opts.limit]);

  // Fetch on mount
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Real-time subscription — set up ONCE, .on() called BEFORE .subscribe()
  useEffect(() => {
    if (!opts.realtime) return;

    // Use a unique channel name per hook instance to avoid conflicts
    const channelName = `products-rt-${Math.random().toString(36).slice(2)}`;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'products' },
        (payload) => {
          setProducts(prev => [payload.new as Product, ...prev]);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'products' },
        (payload) => {
          setProducts(prev =>
            prev.map(p => p.id === (payload.new as Product).id ? payload.new as Product : p)
          );
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'products' },
        (payload) => {
          setProducts(prev => prev.filter(p => p.id !== (payload.old as Product).id));
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [opts.realtime]); // only run once

  return { products, loading, error, refetch: fetchProducts };
};

// ── Single product ────────────────────────────────────────────────────────────
export const useProduct = (id: string | undefined) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    const fetch = async () => {
      try {
        const { data, error: err } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();

        if (!cancelled) {
          if (err) throw err;
          setProduct(data);
        }
      } catch (err: any) {
        if (!cancelled) setError(err.message ?? 'Product not found');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetch();
    return () => { cancelled = true; };
  }, [id]);

  return { product, loading, error };
};
