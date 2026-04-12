import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, hasSupabaseConfig } from '../lib/supabase';
import { authService } from '../lib/authService';

const AuthContext = createContext({
  user: null,
  session: null,
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function getInitialSession() {
      try {
        const currentSession = await authService.getCurrentSession();
        if (mounted) {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
        }
      } catch (error) {
        console.error('Error fetching auth session:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    getInitialSession();

    let authListener = null;

    if (hasSupabaseConfig) {
      // Listen for auth state changes (handles the OAuth redirect callback automatically)
      const { data } = supabase.auth.onAuthStateChange((event, newSession) => {
        if (mounted) {
          setSession(newSession);
          setUser(newSession?.user ?? null);
        }
        
        if (event === 'SIGNED_IN') {
          console.log('User signed in successfully.');
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out.');
        }
      });
      authListener = data.subscription;
    }

    return () => {
      mounted = false;
      if (authListener) authListener.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
