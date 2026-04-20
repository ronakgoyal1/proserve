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
  }

  // --- Professionals ---
  async getProfessionals(filters = {}) {
    if (hasSupabaseConfig) {
      let query = supabase.from('professionals').select('*');
      if (filters.category) query = query.eq('category', filters.category);
      if (filters.city) query = query.ilike('city', `%${filters.city}%`);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    } else {
      let result = [...mockProfessionals];
      if (filters.category) result = result.filter(p => p.category === filters.category);
      if (filters.city) result = result.filter(p => p.city.toLowerCase().includes(filters.city.toLowerCase()));
      return result;
    }
  }

  async getProfessionalById(id) {
    if (hasSupabaseConfig) {
      const { data, error } = await supabase.from('professionals').select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    } else {
      return mockProfessionals.find(p => p.id === parseInt(id)) || mockProfessionals[0];
    }
  }

  // --- Professional Applications (Onboarding) ---
  async submitProfessionalApplication(applicationData) {
    if (hasSupabaseConfig) {
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
    if (hasSupabaseConfig) {
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
    if (hasSupabaseConfig) {
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
    if (hasSupabaseConfig) {
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
      
      // Inject to fake global directory so search works identically!
      const appData = this.localApplications[index];
      const newPro = {
        id: Date.now(),
        name: appData.name,
        category: appData.category,
        city: appData.city,
        experience: appData.experience,
        bio: appData.bio,
        languages: ['English', 'Hindi'],
        rating: 0,
        reviews: 0,
        hourlyRate: 1500,
        featured: false,
        image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=256'
      };
      mockProfessionals.unshift(newPro);
      return appData;
    }
  }

  async rejectApplication(appId) {
    if (hasSupabaseConfig) {
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
    if (hasSupabaseConfig) {
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
    if (hasSupabaseConfig) {
      const { data, error } = await supabase.from('leads').select('*').eq('professional_id', professionalId);
      if (error) throw error;
      return data;
    } else {
      return this.localLeads.filter(l => l.professionalId === professionalId);
    }
  }

  // --- Bookings ---
  async createBooking(bookingData) {
    if (hasSupabaseConfig) {
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
    if (hasSupabaseConfig) {
      const { data, error } = await supabase.from('bookings').select('*, professionals(*)').eq('user_id', userId);
      if (error) throw error;
      return data;
    } else {
      return this.localBookings.filter(b => b.userId === userId);
    }
  }

  // --- Reviews ---
  async createReview(reviewData) {
    if (hasSupabaseConfig) {
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
