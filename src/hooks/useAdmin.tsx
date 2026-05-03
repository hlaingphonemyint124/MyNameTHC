import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useAdmin = () => {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const checkAdmin = async () => {
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .maybeSingle(); // maybeSingle() instead of single() — won't throw on 0 rows

        if (!cancelled) {
          if (error) {
            console.error('Admin check error:', error);
            setIsAdmin(false);
          } else {
            setIsAdmin(!!data);
          }
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Admin check error:', err);
          setIsAdmin(false);
          setLoading(false);
        }
      }
    };

    checkAdmin();
    return () => { cancelled = true; };
  }, [user, authLoading]);

  return { isAdmin, loading: loading || authLoading };
};
