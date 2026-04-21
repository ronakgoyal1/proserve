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
    if (hasSupabaseConfig && !this.isMockEnvironment(applicationData?.user_id)) {
      const { data, error } = await supabase.from('professional_applications').insert([{ ...applicationData, status: 'Pending' }]).select();
      if (error) {
        if (error.code === '42P01') throw new Error("Database Schema Error: Required table missing. Please execute supabase_setup.sql in your Supabase SQL Editor.");
        throw error;
      }
      return data[0];
    } else {
      const newApp = { id: `APP-${Date.now()}`, date: new Date().toLocaleDateString(), status: 'Pending', ...applicationData };
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
      const { data, error } = await supabase
        .from('professional_applications')
        .select('status, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      if (!data || data.length === 0) return null;
      
      const hasApproved = data.some(app => app.status === 'Approved');
      if (hasApproved) return 'Approved';
      
      return data[0].status;
    } else {
      const apps = this.localApplications.filter(a => a.userId === userId);
      if (!apps || apps.length === 0) return null;
      const hasApproved = apps.some(app => app.status === 'Approved');
      if (hasApproved) return 'Approved';
      return apps[0].status;
    }
  }

  async approveApplication(appId) {
    if (hasSupabaseConfig && !this.isMockEnvironment()) {
      // In production, an Edge Function/Trigger would typically copy the verified application to the public `professionals` table.
      // We simulate approving the app status here.
      const { data, error } = await supabase.from('professional_applications').update({ status: 'Approved' }).eq('id', appId).select();
      if (error) {
        if (error.code === '42P01') throw new Error("Database Schema Error: Required table missing. Please execute supabase_setup.sql in your Supabase SQL Editor.");
        throw error;
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
}

export const dbService = new DbService();
