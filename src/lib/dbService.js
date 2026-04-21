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

  // --- Professionals ---
  async getProfessionals(filters = {}) {
    if (hasSupabaseConfig && !this.isMockEnvironment()) {
      let query = supabase.from('professionals').select('*');
      if (filters.category) query = query.eq('category', filters.category);
      if (filters.city) query = query.ilike('city', `%${filters.city}%`);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    } else {
      let result = [...this.localProfessionals, ...mockProfessionals];
      if (filters.category) result = result.filter(p => p.category === filters.category);
      if (filters.city) result = result.filter(p => p.city.toLowerCase().includes(filters.city.toLowerCase()));
      return result;
    }
  }

  async getProfessionalById(id) {
    if (hasSupabaseConfig && !this.isMockEnvironment()) {
      const { data, error } = await supabase.from('professionals').select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    } else {
      const allPros = [...this.localProfessionals, ...mockProfessionals];
      return allPros.find(p => String(p.id) === String(id)) || allPros[0];
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
        const { count: pendingCount } = await supabase.from('professional_applications').select('*', { count: 'exact', head: true }).eq('status', 'Pending');
        pendingApprovals = pendingCount || 0;
        
        const { count: proCount } = await supabase.from('professionals').select('*', { count: 'exact', head: true });
        verifiedPros = proCount || 0;
        
        // Sum revenue from leads/bookings where applicable - Mock sum for safety
        const { data: bookings } = await supabase.from('bookings').select('id');
        const { data: apps } = await supabase.from('professional_applications').select('user_id');
        totalUsers = (bookings?.length || 0) + (apps?.length || 0) + verifiedPros * 4; // Mock logic bounded
        
        revenue = (bookings?.length || 0) * 1500;
      } catch (e) {
        console.error("Metric fetch partial failure", e);
      }
    } else {
      pendingApprovals = this.localApplications.filter(a => a.status === 'Pending').length;
      verifiedPros = this.localProfessionals.length + mockProfessionals.length;
      totalUsers = pendingApprovals + verifiedPros + 25; // mock constant baseline
      revenue = this.localBookings.length * 1500 + 45000;
    }

    return { totalUsers, verifiedPros, pendingApprovals, revenue };
  }

  async approveApplication(appId) {
    if (hasSupabaseConfig && !this.isMockEnvironment()) {
      // 1. Fetch original application
      const { data: appData, error: fetchErr } = await supabase.from('professional_applications').select('*').eq('id', appId).single();
      if (fetchErr) throw fetchErr;

      // 2. Set Status Approved
      const { data, error } = await supabase.from('professional_applications').update({ status: 'Approved' }).eq('id', appId).select();
      if (error) throw error;

      // 3. Format payload and physically inject to universal 'professionals' registry
      const regPayload = {
        user_id: appData.user_id,
        name: appData.name,
        category: appData.category || 'CA',
        city: appData.city || 'Digital',
        experience: Number(appData.experience) || 0,
        bio: appData.bio || 'Verified Professional',
        languages: appData.languages ? String(appData.languages).split(',').map(s=>s.trim()) : ['English'],
        rating: 5.0,
        reviews: 0,
        starting_price: 1500,
        hourly_rate: 1500,
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

      const { error: insErr } = await supabase.from('professionals').insert([regPayload]);
      if (insErr && insErr.code !== '23505') { // Ignore unique constraint violation if accidentally duped
          console.error("Failed to migrate into professional registry:", insErr);
      }

      return data[0];
    } else {
      const index = this.localApplications.findIndex(a => a.id === appId);
      if (index === -1) throw new Error("Application not found");
      this.localApplications[index].status = 'Approved';
      localStorage.setItem('proserve_applications', JSON.stringify(this.localApplications));
      
      // Inject to local storage so search works predictably!
      const appData = this.localApplications[index];
      const newPro = {
        id: Date.now(),
        name: appData.name,
        category: appData.category,
        city: appData.city,
        experience: Number(appData.experience) || 0,
        bio: appData.bio,
        languages: appData.languages ? String(appData.languages).split(',').map(s=>s.trim()) : ['English', 'Hindi'],
        rating: 5.0,
        reviews: 0,
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
