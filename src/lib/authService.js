import { supabase, hasSupabaseConfig } from './supabase';

/**
 * Authentication Service Wrapper
 * Uses Supabase if configured, otherwise simulates authentication via local memory/promises.
 */
class AuthService {
  constructor() {
    try {
      const stored = localStorage.getItem('proserve_mock_user');
      this.mockUser = stored ? JSON.parse(stored) : null;
    } catch {
      this.mockUser = null;
    }
  }

  async signUp(email, password, metadata = {}) {
    if (hasSupabaseConfig) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: metadata }
      });
      if (error) throw error;
      return data;
    } else {
      // Mock flow
      this.mockUser = { id: 'mock-123', email, user_metadata: metadata };
      localStorage.setItem('proserve_mock_user', JSON.stringify(this.mockUser));
      return { user: this.mockUser };
    }
  }

  async signIn(email, password) {
    if (hasSupabaseConfig) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data;
    } else {
      // Mock flow
      this.mockUser = { id: 'mock-123', email };
      localStorage.setItem('proserve_mock_user', JSON.stringify(this.mockUser));
      return { user: this.mockUser };
    }
  }

  async signOut() {
    localStorage.removeItem('proserve_dev_mock_session');
    if (hasSupabaseConfig) {
      // Just catch error so local logout still persists if Supabase fails
      const { error } = await supabase.auth.signOut().catch(()=>({}));
    } else {
      this.mockUser = null;
      localStorage.removeItem('proserve_mock_user');
    }
  }

  async updateUserMetadata(metadata) {
    try {
      const devMock = localStorage.getItem('proserve_dev_mock_session');
      if (devMock) {
        const parsed = JSON.parse(devMock);
        parsed.user.user_metadata = { ...parsed.user.user_metadata, ...metadata };
        localStorage.setItem('proserve_dev_mock_session', JSON.stringify(parsed));
        return { user: parsed.user };
      }
    } catch {}

    if (hasSupabaseConfig) {
      const { data, error } = await supabase.auth.updateUser({ data: metadata });
      if (error) throw error;
      return data;
    } else {
      if (this.mockUser) {
        this.mockUser.user_metadata = { ...this.mockUser.user_metadata, ...metadata };
        localStorage.setItem('proserve_mock_user', JSON.stringify(this.mockUser));
      }
      return { user: this.mockUser };
    }
  }

  async signInWithOAuth(provider) {
    if (hasSupabaseConfig) {
      console.log(`[AuthService] Initiating ${provider} OAuth...`);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          queryParams: {
            prompt: 'select_account' // Forces the Google account chooser
          }
        }
      });
      if (error) {
        console.error('[AuthService] OAuth error:', error);
        throw error;
      }
      return data;
    } else {
      console.error("[AuthService] Supabase not configured. Cannot perform real OAuth flow.");
      throw new Error("Supabase is not configured. Google Sign-In requires active Supabase URL and Anon Key in .env.local");
    }
  }

  async getCurrentSession() {
    try {
      const devMock = localStorage.getItem('proserve_dev_mock_session');
      if (devMock) {
        const parsed = JSON.parse(devMock);
        // Normalize mock session format
        return { user: parsed.user };
      }
    } catch {}

    if (hasSupabaseConfig) {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return data.session;
    } else {
      return this.mockUser ? { user: this.mockUser } : null;
    }
  }

  async devSignIn(role) {
    const mockId = `DEV-${Date.now()}`;
    const email = `test_${role}@proserve.local`;
    const name = `Test ${role.charAt(0).toUpperCase() + role.slice(1)}`;
    const mockUser = {
      id: mockId,
      email: email,
      user_metadata: {
        role: role,
        name: name,
        full_name: name,
        onboardingStatus: role === 'professional' ? 'required' : 'complete'
      }
    };
    const sessionData = { user: mockUser };
    localStorage.setItem('proserve_dev_mock_session', JSON.stringify(sessionData));
    return sessionData;
  }
}

export const authService = new AuthService();
