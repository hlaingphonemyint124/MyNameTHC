import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

export type Slideshow = Database['public']['Tables']['slideshows']['Row'];

export const useSlideshows = (realtime = false) => {
  const [slideshows, setSlideshows] = useState<Slideshow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const fetchSlideshows = async () => {
    try {
      const { data, error: err } = await supabase
        .from('slideshows')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      if (err) throw err;
      setSlideshows(data ?? []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSlideshows(); }, []);

  useEffect(() => {
    if (!realtime) return;

    const channelName = `slideshows-rt-${Math.random().toString(36).slice(2)}`;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'slideshows' },
        () => fetchSlideshows()
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [realtime]);

  return { slideshows, loading, error, refetch: fetchSlideshows };
};
