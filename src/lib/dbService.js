import { supabase, hasSupabaseConfig } from './supabase';
import { professionals as mockProfessionals } from '../data/mockData';

/**
 * Database Service Wrapper
 * Replaces direct imports of mockData. Uses Supabase if configured, otherwise fetches local memory mock.
 */
class DbService {
  constructor() {
    this.localLeads = [];
    this.localBookings = [];
    try {
      const storedApps = localStorage.getItem('proserve_applications');
      this.localApplications = storedApps ? JSON.parse(storedApps) : [];
    } catch {
      this.localApplications = [];
    }
    try {
      const storedPros = localStorage.getItem('proserve_mock_professionals');
      this.localProfessionals = storedPros ? JSON.parse(storedPros) : [];
    } catch {
      this.localProfessionals = [];
    }
    try {
      const storedPorts = localStorage.getItem('proserve_portfolios');
      this.localPortfolios = storedPorts ? JSON.parse(storedPorts) : [];
    } catch {
      this.localPortfolios = [];
    }
  }

  isMockEnvironment(userId = null) {
    if (!hasSupabaseConfig) return true;
    try {
      if (localStorage.getItem('proserve_dev_mock_session')) return true;
      if (userId && String(userId).startsWith('00000000-0000-4000-8000-')) return true;
    } catch {}
    return false;
  }

  /**
   * Normalize a professional record from any source (Supabase snake_case, local camelCase)
   * into the exact shape the frontend components expect.
   */
  normalizeProfessional(row) {
    if (!row) return row;
    // Parse JSON strings back to objects if Supabase stored them as text
    const parseJsonField = (val, fallback) => {
      if (val === null || val === undefined) return fallback;
      if (typeof val === 'object') return val; // already parsed (jsonb column)
      try { return JSON.parse(val); } catch { return fallback; }
    };

    const name = row.name || 'Professional';
    const initials = row.initials || name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

    return {
      ...row,
      name,
      initials,
      category: row.category || 'CA',
      city: row.city || 'Digital',
      experience: Number(row.experience) || 0,

      featured: row.featured || false,
      availability: row.availability || 'Available Today',
      bio: row.bio || '',
      // Handle snake_case ↔ camelCase
      startingPrice: Number(row.startingPrice || row.starting_price) || 1500,
      hourlyRate: Number(row.hourlyRate || row.hourly_rate) || 1500,
      // Parse compound fields
      verification: parseJsonField(row.verification, { status: 'verified', date: new Date().toISOString(), checks: { identity: true, documents: true, credentials: true } }),
      services: parseJsonField(row.services, ['General Consultation']),
      certifications: parseJsonField(row.certifications, []),
      packages: parseJsonField(row.packages, [
        { name: 'Basic Consultation', price: 1500, description: 'Standard advice', features: ['1 Hour Call', 'Action Plan'] },
        { name: 'Deep Dive', price: 5000, description: 'Full execution', features: ['Dedicated Review', 'Strategic Execution'] }
      ]),
      languages: parseJsonField(row.languages, ['English']),
      image: row.image || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=256',
    };
  }

  // --- Professionals ---

  /**
   * Synthesize a display-ready professional record from an approved application row.
   * Used as a fallback when the professionals table is empty or inaccessible.
   */
  synthesizeFromApplication(app) {
    const name = app.name || 'Professional';
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    return this.normalizeProfessional({
      id: app.id,
      user_id: app.user_id || app.userId,
      name,
      initials,
      category: app.category || 'CA',
      city: app.city || 'Digital',
      experience: Number(app.experience) || 0,
      bio: app.bio || 'Verified Professional on Wisor.',
      languages: app.languages ? String(app.languages).split(',').map(s => s.trim()) : ['English'],
      startingPrice: 1500,
      hourlyRate: 1500,
      featured: false,
      availability: 'Available Today',
      verification: { status: 'verified', date: new Date().toISOString(), checks: { identity: true, documents: true, credentials: true } },
      image: null,
      services: app.specialties ? String(app.specialties).split(',').map(s => s.trim()) : ['General Consultation'],
      certifications: app.certificationId ? [app.certificationId] : [],
      packages: [
        { name: 'Basic Consultation', price: 1500, description: 'Standard advice', features: ['1 Hour Call', 'Action Plan'] },
        { name: 'Deep Dive', price: 5000, description: 'Full execution', features: ['Dedicated Review', 'Strategic Execution'] }
      ]
    });
  }

  async getProfessionals(filters = {}) {
    if (hasSupabaseConfig && !this.isMockEnvironment()) {
      // --- Layer 1: Try the professionals table ---
      try {
        let query = supabase.from('professionals').select('*');
        if (filters.category) query = query.eq('category', filters.category);
        if (filters.city) query = query.ilike('city', `%${filters.city}%`);
        const { data, error } = await query;

        if (error) {
          console.warn('[Search] professionals table error:', error.message, '— falling back to approved applications');
        } else if (data && data.length > 0) {
          console.log(`[Search] Source: professionals table (${data.length} rows)`);
          return data.map(row => this.normalizeProfessional(row));
        } else {
          console.log('[Search] professionals table empty — falling back to approved applications');
        }
      } catch (e) {
        console.warn('[Search] professionals table threw:', e.message);
      }

      // --- Layer 2: Synthesize from approved applications ---
      try {
        const { data: approvedApps, error: appsErr } = await supabase
          .from('professional_applications')
          .select('*')
          .eq('status', 'Approved');

        if (appsErr) {
          console.error('[Search] approved applications query failed:', appsErr.message);
        } else if (approvedApps && approvedApps.length > 0) {
          let results = approvedApps.map(app => this.synthesizeFromApplication(app));
          if (filters.category) results = results.filter(p => p.category === filters.category);
          if (filters.city) results = results.filter(p => p.city.toLowerCase().includes(filters.city.toLowerCase()));
          console.log(`[Search] Source: approved applications fallback (${results.length} synthesized)`);
          return results;
        }
      } catch (e) {
        console.warn('[Search] approved applications fallback threw:', e.message);
      }

      console.log('[Search] No data from any Supabase source — returning empty');
      return [];
    } else {
      // --- Layer 3: Local/Mock ---
      let result = [...this.localProfessionals, ...mockProfessionals];
      if (filters.category) result = result.filter(p => p.category === filters.category);
      if (filters.city) result = result.filter(p => p.city.toLowerCase().includes(filters.city.toLowerCase()));
      console.log(`[Search] Source: local/mock (${result.length} records)`);
      return result.map(row => this.normalizeProfessional(row));
    }
  }

  async getProfessionalById(id) {
    if (hasSupabaseConfig && !this.isMockEnvironment()) {
      // Try professionals table first
      try {
        const { data, error } = await supabase.from('professionals').select('*').eq('id', id).single();
        if (!error && data) return this.normalizeProfessional(data);
      } catch (_) {}

      // Fallback: find in approved applications
      try {
        const { data: apps } = await supabase
          .from('professional_applications')
          .select('*')
          .eq('status', 'Approved');
        const match = (apps || []).find(a => String(a.id) === String(id));
        if (match) {
          console.log('[Profile] Source: approved application fallback for id', id);
          return this.synthesizeFromApplication(match);
        }
      } catch (_) {}

      // Last resort: return first approved professional
      console.warn('[Profile] Could not find professional id:', id);
      return null;
    } else {
      const allPros = [...this.localProfessionals, ...mockProfessionals];
      const found = allPros.find(p => String(p.id) === String(id)) || allPros[0];
      return this.normalizeProfessional(found);
    }
  }

  // --- Professional Applications (Onboarding) ---
  async submitProfessionalApplication(applicationData) {
    const userIdVal = applicationData.user_id || applicationData.userId;
    const payload = { ...applicationData, user_id: userIdVal, userId: userIdVal };

    if (hasSupabaseConfig && !this.isMockEnvironment(userIdVal)) {
      const { data, error } = await supabase.from('professional_applications').insert([{ ...payload, status: 'Pending' }]).select();
      if (error) {
        if (error.code === '42P01') throw new Error("Database Schema Error: Required table missing. Please execute supabase_setup.sql in your Supabase SQL Editor.");
        throw error;
      }
      return data[0];
    } else {
      const newApp = { id: `APP-${Date.now()}`, date: new Date().toLocaleDateString(), status: 'Pending', ...payload };
      this.localApplications.unshift(newApp);
      localStorage.setItem('proserve_applications', JSON.stringify(this.localApplications));
      return newApp;
    }
  }

  async getPendingApplications() {
    if (hasSupabaseConfig && !this.isMockEnvironment()) {
      const { data, error } = await supabase.from('professional_applications').select('*').eq('status', 'Pending');
      if (error) {
        if (error.code === '42P01') throw new Error("Database Schema Error: Required table missing. Please execute supabase_setup.sql in your Supabase SQL Editor.");
        throw error;
      }
      return data;
    } else {
      return this.localApplications.filter(app => app.status === 'Pending');
    }
  }

  async getMyApplicationStatus(userId) {
    if (hasSupabaseConfig && !this.isMockEnvironment(userId)) {
      // Fetch both user_id and userId dynamically in case legacy rows existed
      const { data, error } = await supabase
        .from('professional_applications')
        .select('status, created_at')
        .or(`user_id.eq.${userId},userId.eq.${userId}`)
        .order('created_at', { ascending: false });
        
      if (error) {
        if (error.code === '42P01') return null; // table doesn't exist
        throw error;
      }
      if (!data || data.length === 0) return null;
      
      const hasApproved = data.some(app => app.status === 'Approved');
      if (hasApproved) return 'Approved';
      const hasRejected = data.some(app => app.status === 'Rejected');
      if (hasRejected) return 'Rejected';
      
      return data[0].status;
    } else {
      const apps = this.localApplications.filter(a => a.userId === userId || a.user_id === userId);
      if (!apps || apps.length === 0) return null;
      const hasApproved = apps.some(app => app.status === 'Approved');
      if (hasApproved) return 'Approved';
      const hasRejected = apps.some(app => app.status === 'Rejected');
      if (hasRejected) return 'Rejected';
      return apps[0].status;
    }
  }

  async getAdminMetrics() {
    let pendingApprovals = 0;
    let verifiedPros = 0;
    let totalUsers = 0;
    let revenue = 0;

    if (hasSupabaseConfig && !this.isMockEnvironment()) {
      try {
        // Count pending applications
        const { count: pendingCount, error: pendErr } = await supabase
          .from('professional_applications')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'Pending');
        if (pendErr) console.error('[Metrics] Pending count error:', pendErr.message);
        pendingApprovals = pendingCount || 0;

        // Count verified pros: use approved applications as primary source
        // (professionals table insert may fail due to schema mismatch)
        const { count: approvedCount, error: appErr } = await supabase
          .from('professional_applications')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'Approved');
        if (appErr) console.error('[Metrics] Approved count error:', appErr.message);
        verifiedPros = approvedCount || 0;

        // Also try professionals table as secondary source — take whichever is higher
        try {
          const { count: proCount } = await supabase
            .from('professionals')
            .select('*', { count: 'exact', head: true });
          if (proCount && proCount > verifiedPros) {
            verifiedPros = proCount;
          }
        } catch (_) { /* professionals table may not exist */ }

        // Total users = all applicants + verified + baseline
        const { count: allAppsCount } = await supabase
          .from('professional_applications')
          .select('*', { count: 'exact', head: true });
        totalUsers = (allAppsCount || 0) + verifiedPros;

        // Revenue from bookings if table exists
        try {
          const { data: bookings } = await supabase.from('bookings').select('id');
          revenue = (bookings?.length || 0) * 1500;
        } catch (_) { revenue = 0; }
      } catch (e) {
        console.error('[Metrics] Fetch failure:', e);
      }
    } else {
      // Local/mock mode
      pendingApprovals = this.localApplications.filter(a => a.status === 'Pending').length;
      const approvedApps = this.localApplications.filter(a => a.status === 'Approved').length;
      verifiedPros = Math.max(this.localProfessionals.length, approvedApps);
      totalUsers = this.localApplications.length + verifiedPros;
      revenue = this.localBookings.length * 1500;
    }

    return { totalUsers, verifiedPros, pendingApprovals, revenue };
  }

  async approveApplication(appId) {
    if (hasSupabaseConfig && !this.isMockEnvironment()) {
      // 1. Fetch original application
      const { data: appData, error: fetchErr } = await supabase
        .from('professional_applications')
        .select('*')
        .eq('id', appId)
        .single();
      if (fetchErr) {
        console.error('[Approve] Failed to fetch application:', fetchErr);
        throw fetchErr;
      }

      // 2. Set Status Approved
      const { data, error } = await supabase
        .from('professional_applications')
        .update({ status: 'Approved' })
        .eq('id', appId)
        .select();
      if (error) {
        console.error('[Approve] Failed to update status:', error);
        throw error;
      }

      // 3. Build professional registry payload using FRONTEND-COMPATIBLE field names.
      //    Supabase will auto-create columns on first insert if table was created loosely.
      //    We use camelCase to match what ProfessionalCard/Profile/Search expect.
      const nameVal = appData.name || 'Professional';
      const regPayload = {
        user_id: appData.user_id || appData.userId,
        name: nameVal,
        initials: nameVal.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2),
        category: appData.category || 'CA',
        city: appData.city || 'Digital',
        experience: Number(appData.experience) || 0,
        bio: appData.bio || 'Verified Professional',
        languages: appData.languages ? String(appData.languages).split(',').map(s=>s.trim()) : ['English'],
        startingPrice: 1500,
        hourlyRate: 1500,
        featured: false,
        verification: { status: 'verified', date: new Date().toISOString(), checks: { identity: true, documents: true, credentials: true } },
        image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=256',
        availability: 'Available Today',
        services: appData.specialties ? appData.specialties.split(',').map(s=>s.trim()) : ['General Consultation'],
        certifications: appData.certificationId ? [appData.certificationId] : [],
        packages: [
          { name: 'Basic Consultation', price: 1500, description: 'Standard advice', features: ['1 Hour Call', 'Action Plan'] },
          { name: 'Deep Dive', price: 5000, description: 'Full execution', features: ['Dedicated Review', 'Strategic Execution'] }
        ]
      };

      const { data: insertedPro, error: insErr } = await supabase
        .from('professionals')
        .insert([regPayload])
        .select();

      if (insErr) {
        console.error('[Approve] ❌ Professional registry INSERT failed:', {
          code: insErr.code,
          message: insErr.message,
          details: insErr.details,
          hint: insErr.hint,
          payload: regPayload
        });
        // Don't throw — approval itself succeeded. The metric still counts via approved applications.
      } else {
        console.log('[Approve] ✅ Professional created in registry:', insertedPro?.[0]?.id);
        
        // Post-insert verification
        const { data: verifyRow } = await supabase
          .from('professionals')
          .select('id, name')
          .eq('user_id', regPayload.user_id)
          .single();
        if (verifyRow) {
          console.log('[Approve] ✅ Post-insert verified: Row exists with id', verifyRow.id);
        } else {
          console.warn('[Approve] ⚠️ Post-insert check: Row not found after insert (possible RLS issue)');
        }
      }

      return data[0];
    } else {
      // --- Local/Mock Mode ---
      const index = this.localApplications.findIndex(a => a.id === appId);
      if (index === -1) throw new Error("Application not found");
      this.localApplications[index].status = 'Approved';
      localStorage.setItem('proserve_applications', JSON.stringify(this.localApplications));
      
      // Inject professional into local search registry
      const appData = this.localApplications[index];
      const newPro = {
        id: Date.now(),
        name: appData.name,
        category: appData.category || 'CA',
        city: appData.city || 'Digital',
        experience: Number(appData.experience) || 0,
        bio: appData.bio || 'Verified Professional',
        languages: appData.languages ? String(appData.languages).split(',').map(s=>s.trim()) : ['English', 'Hindi'],
        startingPrice: 1500,
        hourlyRate: 1500,
        featured: false,
        verification: { status: 'verified', date: new Date().toLocaleDateString(), checks: { identity: true, documents: true, credentials: true } },
        image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=256',
        availability: 'Available Today',
        services: appData.specialties ? appData.specialties.split(',').map(s=>s.trim()) : ['General Consultation'],
        certifications: appData.certificationId ? [appData.certificationId] : [],
        packages: [
          { name: 'Basic Consultation', price: 1500, description: 'Standard advice', features: ['1 Hour Call', 'Action Plan'] },
          { name: 'Deep Dive', price: 5000, description: 'Full execution', features: ['Dedicated Review', 'Strategic Execution'] }
        ]
      };
      this.localProfessionals.unshift(newPro);
      localStorage.setItem('proserve_mock_professionals', JSON.stringify(this.localProfessionals));
      console.log('[Approve] Local professional registered. Total local pros:', this.localProfessionals.length);
      return appData;
    }
  }

  async rejectApplication(appId) {
    if (hasSupabaseConfig && !this.isMockEnvironment()) {
      const { data, error } = await supabase.from('professional_applications').update({ status: 'Rejected' }).eq('id', appId).select();
      if (error) {
        if (error.code === '42P01') throw new Error("Database Schema Error: Required table missing. Please execute supabase_setup.sql in your Supabase SQL Editor.");
        throw error;
      }
      return data[0];
    } else {
      const index = this.localApplications.findIndex(a => a.id === appId);
      if (index === -1) throw new Error("Application not found");
      this.localApplications[index].status = 'Rejected';
      localStorage.setItem('proserve_applications', JSON.stringify(this.localApplications));
      return this.localApplications[index];
    }
  }

  // --- Leads / Requests ---
  async createLead(leadData) {
    if (hasSupabaseConfig && !this.isMockEnvironment()) {
      const { data, error } = await supabase.from('leads').insert([leadData]).select();
      if (error) throw error;
      return data[0];
    } else {
      const newLead = { id: `LEAD-${Date.now()}`, date: new Date().toLocaleDateString(), status: 'New', ...leadData };
      this.localLeads.unshift(newLead);
      return newLead;
    }
  }

  async getLeadsForProfessional(professionalId) {
    if (hasSupabaseConfig && !this.isMockEnvironment(professionalId)) {
      const { data, error } = await supabase.from('leads').select('*').eq('professional_id', professionalId);
      if (error) throw error;
      return data;
    } else {
      return this.localLeads.filter(l => l.professionalId === professionalId);
    }
  }

  // --- Bookings ---
  async createBooking(bookingData) {
    if (hasSupabaseConfig && !this.isMockEnvironment(bookingData?.user_id)) {
      const { data, error } = await supabase.from('bookings').insert([bookingData]).select();
      if (error) throw error;
      return data[0];
    } else {
      const newBooking = { id: `BKG-${Date.now()}`, date: new Date().toLocaleDateString(), status: 'Upcoming', ...bookingData };
      this.localBookings.unshift(newBooking);
      return newBooking;
    }
  }

  async getBookingsForUser(userId) {
    if (hasSupabaseConfig && !this.isMockEnvironment(userId)) {
      const { data, error } = await supabase.from('bookings').select('*, professionals(*)').eq('user_id', userId);
      if (error) throw error;
      return data;
    } else {
      return this.localBookings.filter(b => b.userId === userId);
    }
  }

  // --- Reviews ---
  async createReview(reviewData) {
    if (hasSupabaseConfig && !this.isMockEnvironment()) {
      const { data, error } = await supabase.from('reviews').insert([reviewData]).select();
      if (error) throw error;
      return data;
    } else {
      // Fire and forget returning success
      return reviewData;
    }
  }

  // --- Reviews & Ratings (Phase 1 – localStorage) ---
  _loadReviews() {
    try {
      const stored = localStorage.getItem('wisor_reviews');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  _saveReviews(reviews) {
    localStorage.setItem('wisor_reviews', JSON.stringify(reviews));
  }

  getReviewsForProfessional(proId) {
    const all = this._loadReviews();
    return all
      .filter(r => String(r.professional_id) === String(proId))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  submitReview(reviewData) {
    const all = this._loadReviews();
    const newReview = {
      id: `REV-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      professional_id: reviewData.professional_id,
      text: reviewData.text || '',
      author_name: reviewData.author_name || 'Anonymous',
      service_used: reviewData.service_used || '',
      is_verified_client: reviewData.is_verified_client || false,
      created_at: new Date().toISOString(),
    };
    all.unshift(newReview);
    this._saveReviews(all);
    return newReview;
  }

  // Rating system removed — trust is now expressed through
  // verification badges and written testimonials.
  getTestimonialCount(proId) {
    return this.getReviewsForProfessional(proId).length;
  }

  // --- Portfolios (Phase 3) ---
  async savePortfolio(userId, slug, contentData) {
    let fallbackToLocal = false;

    if (hasSupabaseConfig && !this.isMockEnvironment(userId)) {
      const { data: existing, error: existError } = await supabase.from('portfolios').select('id').eq('user_id', userId).single();
      
      if (existError && (existError.code === 'PGRST205' || existError.message?.includes('schema cache') || existError.message?.includes('does not exist'))) {
         console.warn("Portfolios table not found in Supabase. Falling back to local mock storage.");
         fallbackToLocal = true;
      } else if (existError && existError.code !== 'PGRST116') {
         throw new Error("Database error: " + existError.message);
      } else {
          const payload = {
             user_id: userId,
             slug: slug,
             content: contentData,
             published: true,
             updated_at: new Date().toISOString()
          };

          if (existing) {
             const { data, error } = await supabase.from('portfolios').update(payload).eq('id', existing.id).select();
             if (error) throw new Error(error.message);
             return data[0];
          } else {
             const { data, error } = await supabase.from('portfolios').insert([payload]).select();
             if (error) throw new Error(error.message);
             return data[0];
          }
      }
    } else {
        fallbackToLocal = true;
    }

    if (fallbackToLocal) {
      let index = this.localPortfolios.findIndex(p => p.userId === userId);
      const payload = {
        id: index >= 0 ? this.localPortfolios[index].id : `PORT-${Date.now()}`,
        userId: userId,
        slug: slug,
        content: contentData,
        published: true,
        updated_at: new Date().toISOString()
      };
      
      if (index >= 0) {
        this.localPortfolios[index] = payload;
      } else {
        if (this.localPortfolios.some(p => p.slug === slug)) {
           throw new Error("Slug is already taken in the local mock environment.");
        }
        this.localPortfolios.unshift(payload);
      }
      localStorage.setItem('proserve_portfolios', JSON.stringify(this.localPortfolios));
      return payload;
    }
  }

  async getPortfolioBySlug(slug) {
    let fallbackToLocal = false;

    if (hasSupabaseConfig) {
      const localMatch = this.localPortfolios.find(p => p.slug === slug);
      if (localMatch) return localMatch;

      const { data, error } = await supabase.from('portfolios').select('*').eq('slug', slug).single();
      if (error) {
        if (error.code === 'PGRST116') return null;
        if (error.code === 'PGRST205' || error.message?.includes('schema cache')) {
            fallbackToLocal = true;
        } else {
            console.error("Supabase Error fetching portfolio:", error.message);
            throw new Error("Failed to load portfolio. " + error.message);
        }
      } else {
          return data;
      }
    } else {
        fallbackToLocal = true;
    }

    if (fallbackToLocal) {
      return this.localPortfolios.find(p => p.slug === slug) || null;
    }
  }

  async getMyPortfolio(userId) {
    let fallbackToLocal = false;

    if (hasSupabaseConfig && !this.isMockEnvironment(userId)) {
      const { data, error } = await supabase.from('portfolios').select('*').eq('user_id', userId).single();
      if (error) {
         if (error.code === 'PGRST116') return null;
         if (error.code === 'PGRST205' || error.message?.includes('schema cache')) {
            fallbackToLocal = true;
         } else {
            throw new Error("Failed to fetch your portfolio: " + error.message);
         }
      } else {
         return data || null;
      }
    } else {
      fallbackToLocal = true;
    }

    if (fallbackToLocal) {
        return this.localPortfolios.find(p => p.userId === userId) || null;
    }
  }
}

export const dbService = new DbService();
