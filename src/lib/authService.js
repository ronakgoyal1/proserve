import { supabase, hasSupabaseConfig } from './supabase';

/**
 * Authentication Service Wrapper
 * Uses Supabase if configured, otherwise simulates authentication via local memory/promises.
 */
const devUuidMap = {
  user: '00000000-0000-4000-8000-000000000001',
  professional: '00000000-0000-4000-8000-000000000002',
  expert_new: '00000000-0000-4000-8000-000000000101',
  expert_pending: '00000000-0000-4000-8000-000000000102',
  expert_approved: '00000000-0000-4000-8000-000000000103',
  admin: '00000000-0000-4000-8000-000000000003'
};

class AuthService {
  constructor() {
    try {
      const stored = localStorage.getItem('proserve_mock_user');
      this.mockUser = stored ? JSON.parse(stored) : null;
      
      // Auto-migrate standard mock users if they carry an old DEV- or mock- ID
      if (this.mockUser && (this.mockUser.id.startsWith('DEV-') || this.mockUser.id.startsWith('mock-'))) {
         this.mockUser.id = devUuidMap[this.mockUser.user_metadata?.role || 'user'] || devUuidMap.user;
         localStorage.setItem('proserve_mock_user', JSON.stringify(this.mockUser));
      }
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
      this.mockUser = { id: devUuidMap.user, email, user_metadata: metadata };
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
      this.mockUser = { id: devUuidMap.user, email };
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
        // Stale checking: purge any legacy 'DEV-' styled sessions automatically
        if (parsed.user && parsed.user.id && (parsed.user.id.startsWith('DEV-') || parsed.user.id.startsWith('mock-'))) {
           localStorage.removeItem('proserve_dev_mock_session');
        } else {
           return { user: parsed.user };
        }
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
    const mockId = devUuidMap[role] || '00000000-0000-4000-8000-000000000000';
    const baseRole = role.startsWith('expert') ? 'professional' : role;
    const email = `test_${role}@proserve.local`;

    // Automatically seed/reset the target database state in localStorage
    if (role === 'expert_new') {
        const appsStr = localStorage.getItem('proserve_applications');
        let apps = appsStr ? JSON.parse(appsStr) : [];
        apps = apps.filter(a => a.userId !== mockId);
        localStorage.setItem('proserve_applications', JSON.stringify(apps));
    } else if (role === 'expert_pending' || role === 'expert_approved') {
        const appsStr = localStorage.getItem('proserve_applications');
        let apps = appsStr ? JSON.parse(appsStr) : [];
        apps = apps.filter(a => a.userId !== mockId); // remove stale if any
        
        apps.unshift({
           id: `APP-DEV-${Date.now()}`,
           userId: mockId,
           name: 'Dev Test Expert',
           email: email,
           category: 'CA',
           city: 'Mumbai',
           experience: 5,
           status: role === 'expert_approved' ? 'Approved' : 'Pending',
           date: new Date().toLocaleDateString()
        });
        localStorage.setItem('proserve_applications', JSON.stringify(apps));
    }

    const name = `Test ${baseRole.charAt(0).toUpperCase() + baseRole.slice(1)}`;
    const mockUser = {
      id: mockId,
      email: email,
      user_metadata: {
        role: baseRole,
        name: name,
        full_name: name,
        onboardingStatus: baseRole === 'professional' ? 'required' : 'complete'
      }
    };
    const sessionData = { user: mockUser };
    localStorage.setItem('proserve_dev_mock_session', JSON.stringify(sessionData));
    return sessionData;
  }
}

export const authService = new AuthService();
