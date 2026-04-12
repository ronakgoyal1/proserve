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
