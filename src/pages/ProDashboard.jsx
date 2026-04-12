import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart3, UserCheck, User, Briefcase, Calendar as CalendarIcon, 
  Star, DollarSign, Crown, Search, Check, FileText, ChevronDown, CheckCircle2
} from 'lucide-react';
import { professionals } from '../data/mockData';
import './Dashboard.css';

// Mock Data for Professional
const proBookings = [
  { id: 'BKG-201', client: 'Samantha Roy', service: 'ITR Filing - Basic', date: 'Oct 15, 2026', time: '10:00 AM', status: 'Upcoming', amount: 1499 },
  { id: 'BKG-202', client: 'TechFlow Private Limited', service: 'GST Registration', date: 'Oct 12, 2026', time: '02:00 PM', status: 'Completed', amount: 3499 },
];

const proLeads = [
  { id: 'LEAD-01', client: 'Rahul Mehta', service: 'Consultation', budget: 'Standard', status: 'New', date: 'Oct 18, 2026' },
  { id: 'LEAD-02', client: 'Creative Labs', service: 'Corporate Tax Audit', budget: 'Premium', status: 'Responded', date: 'Oct 17, 2026' },
];

export default function ProDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const pro = professionals[0];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <>
            <div className="dashboard-stats">
              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'var(--color-primary-bg)', color: 'var(--color-primary)' }}>
                  <UserCheck size={24} />
                </div>
                <div className="stat-info">
                  <h4>Total Leads</h4>
                  <div className="stat-value">24</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'var(--color-success-bg)', color: 'var(--color-success)' }}>
                  <DollarSign size={24} />
                </div>
                <div className="stat-info">
                  <h4>Earnings</h4>
                  <div className="stat-value">₹45k</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'var(--color-warning-bg)', color: 'var(--color-warning)' }}>
                  <Star size={24} />
                </div>
                <div className="stat-info">
                  <h4>Rating</h4>
                  <div className="stat-value">4.9</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: '#f5f3ff', color: '#8b5cf6' }}>
                  <BarChart3 size={24} />
                </div>
                <div className="stat-info">
                  <h4>Profile Views</h4>
                  <div className="stat-value">1.2k</div>
                </div>
              </div>
            </div>

            <div className="dashboard-section animate-fade-in">
              <div className="dashboard-section-header">
                <h3>Recent Leads</h3>
                <button className="btn btn-primary btn-sm">View All</button>
              </div>
              
              <div className="dashboard-table-wrapper">
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Client</th>
                      <th>Service Needed</th>
                      <th>Budget</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {proLeads.map(lead => (
                      <tr key={lead.id}>
                        <td style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-500)' }}>{lead.id}</td>
                        <td style={{ fontWeight: 600 }}>{lead.client}</td>
                        <td>{lead.service}</td>
                        <td>{lead.budget}</td>
                        <td>
                          <span className={`table-status status-${lead.status === 'New' ? 'upcoming' : 'completed'}`}>
                            {lead.status}
                          </span>
                        </td>
                        <td>
                          <button className="btn btn-primary btn-sm">Respond</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        );
      
      case 'profile':
        return (
          <div className="dashboard-section animate-fade-in">
            <div className="dashboard-section-header">
              <h3>Edit Profile</h3>
              <button className="btn btn-primary btn-sm">Save Changes</button>
            </div>
            <div className="form-grid">
              <div className="form-field">
                <label>Full Name</label>
                <div className="form-input">
                  <input type="text" defaultValue={pro.name} />
                </div>
              </div>
              <div className="form-field">
                <label>Professional Category</label>
                <div className="form-input">
                  <select style={{ width: '100%', border: 'none', background: 'transparent' }} defaultValue={pro.category}>
                    <option value="CA">Chartered Accountant (CA)</option>
                    <option value="CMA">Cost & Mgt Accountant (CMA)</option>
                  </select>
                </div>
              </div>
              <div className="form-field" style={{ gridColumn: '1 / -1' }}>
                <label>Short Bio</label>
                <div className="form-input" style={{ alignItems: 'flex-start' }}>
                  <textarea rows="3" style={{ width: '100%', border: 'none', background: 'transparent', resize: 'vertical' }} defaultValue={pro.bio} />
                </div>
              </div>
              <div className="form-field">
                <label>Experience (Years)</label>
                <div className="form-input">
                  <input type="number" defaultValue={pro.experience} />
                </div>
              </div>
              <div className="form-field">
                <label>City</label>
                <div className="form-input">
                  <input type="text" defaultValue={pro.city} />
                </div>
              </div>
            </div>
            <div className="form-actions">
              <button className="btn btn-ghost">Cancel</button>
              <button className="btn btn-primary">Save Profile</button>
            </div>
          </div>
        );

      case 'services':
      case 'calendar':
      case 'reviews':
      case 'subscription':
      default:
        return (
          <div className="dashboard-section animate-fade-in">
            <div className="empty-state">
              <div className="empty-state-icon"><Crown size={28} /></div>
              <h3>Feature in Development</h3>
              <p>This module {activeTab} is currently being built in Phase 2.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <main className="dashboard-page">
      <div className="container dashboard-layout">
        <aside className="dashboard-sidebar">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{pro.initials}</div>
            <div className="sidebar-user-info">
              <h3>{pro.name}</h3>
              <p>{pro.category} • {pro.city}</p>
            </div>
          </div>

          <nav className="sidebar-nav">
            <div 
              className={`sidebar-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <BarChart3 size={18} /> Overview
            </div>
            <div 
              className={`sidebar-nav-item ${activeTab === 'leads' ? 'active' : ''}`}
              onClick={() => setActiveTab('leads')}
            >
              <UserCheck size={18} /> Lead Inbox
              <span className="sidebar-badge">2</span>
            </div>
            <div 
              className={`sidebar-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <User size={18} /> Profile Edit
            </div>
            <div 
              className={`sidebar-nav-item ${activeTab === 'services' ? 'active' : ''}`}
              onClick={() => setActiveTab('services')}
            >
              <Briefcase size={18} /> Services & Pricing
            </div>
            <div 
              className={`sidebar-nav-item ${activeTab === 'calendar' ? 'active' : ''}`}
              onClick={() => setActiveTab('calendar')}
            >
              <CalendarIcon size={18} /> Calendar & Slots
            </div>
            <div 
              className={`sidebar-nav-item ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              <Star size={18} /> Client Reviews
            </div>
            <div 
              className={`sidebar-nav-item ${activeTab === 'subscription' ? 'active' : ''}`}
              onClick={() => setActiveTab('subscription')}
            >
              <Crown size={18} /> Pro Plan
            </div>
          </nav>
        </aside>

        <section className="dashboard-content">
          <div className="dashboard-content-header">
            <h1>Professional Dashboard</h1>
            <p>Welcome back, {pro.name}. Here's what's happening today.</p>
          </div>

          {renderContent()}
        </section>
      </div>
    </main>
  );
}
