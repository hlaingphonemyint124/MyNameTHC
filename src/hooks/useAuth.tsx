import { useEffect, useState, useCallback } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: AuthError | null;
}

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    // Safety timeout — if Supabase doesn't respond in 3s, stop loading
    const timeout = setTimeout(() => {
      setState(prev => prev.loading ? { ...prev, loading: false } : prev);
    }, 3000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        clearTimeout(timeout);
        setState({ session, user: session?.user ?? null, loading: false, error: null });
      }
    );

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      clearTimeout(timeout);
      setState({ session, user: session?.user ?? null, loading: false, error: error as AuthError | null });
    }).catch(() => {
      clearTimeout(timeout);
      setState(prev => ({ ...prev, loading: false }));
    });

    return () => { clearTimeout(timeout); subscription.unsubscribe(); };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({ email, password });
  }, []);

  const signUpWithEmail = useCallback(async (email: string, password: string) => {
    return await supabase.auth.signUp({ email, password });
  }, []);

  return { user: state.user, session: state.session, loading: state.loading, error: state.error, signOut, signInWithEmail, signUpWithEmail };
};
