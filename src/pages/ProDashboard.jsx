import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart3, UserCheck, User, Star, DollarSign, Search, Check, LogOut
} from 'lucide-react';
import { useAuth } from '../components/AuthContext';
import { authService } from '../lib/authService';
import { dbService } from '../lib/dbService';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';



export default function ProDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [proLeads, setProLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      if (!user) return;
      try {
        const leads = await dbService.getLeadsForProfessional(user.id);
        setProLeads(leads || []);
      } catch(e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [user]);

  const handleLogout = async (e) => {
    e.preventDefault();
    await authService.signOut();
    navigate('/login');
  };

  const fullName = user?.user_metadata?.full_name || user?.user_metadata?.name || 'Professional';
  const email = user?.email || 'pro@example.com';
  const avatarUrl = user?.user_metadata?.avatar_url;
  const initials = fullName ? fullName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'P';

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
                <button className="btn btn-primary btn-sm">Refresh</button>
              </div>
              
              {isLoading ? (
                <div className="empty-state">
                  <p>Loading your leads...</p>
                </div>
              ) : proLeads.length > 0 ? (
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
              ) : (
                <div className="empty-state">
                  <div className="empty-state-icon" style={{ background: '#f5f3ff', color: '#8b5cf6' }}><UserCheck size={28} /></div>
                  <h3 style={{ marginTop: 'var(--space-4)' }}>No new leads</h3>
                  <p>When clients request your services, their details will appear here.</p>
                </div>
              )}
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
                  <input type="text" defaultValue={fullName} />
                </div>
              </div>
              <div className="form-field">
                <label>Professional Category</label>
                <div className="form-input">
                  <select style={{ width: '100%', border: 'none', background: 'transparent' }} defaultValue="CA">
                    <option value="CA">Chartered Accountant (CA)</option>
                    <option value="CMA">Cost & Mgt Accountant (CMA)</option>
                  </select>
                </div>
              </div>
              <div className="form-field" style={{ gridColumn: '1 / -1' }}>
                <label>Short Bio</label>
                <div className="form-input" style={{ alignItems: 'flex-start' }}>
                  <textarea rows="3" style={{ width: '100%', border: 'none', background: 'transparent', resize: 'vertical' }} defaultValue="" placeholder="Tell clients about your expertise..." />
                </div>
              </div>
              <div className="form-field">
                <label>Experience (Years)</label>
                <div className="form-input">
                  <input type="number" defaultValue="0" />
                </div>
              </div>
              <div className="form-field">
                <label>City</label>
                <div className="form-input">
                  <input type="text" defaultValue="" placeholder="e.g. Mumbai" />
                </div>
              </div>
            </div>
            <div className="form-actions">
              <button className="btn btn-ghost">Cancel</button>
              <button className="btn btn-primary">Save Profile</button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <main className="dashboard-page">
      <div className="container dashboard-layout">
        <aside className="dashboard-sidebar">
          <div className="sidebar-user">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="sidebar-avatar" style={{ objectFit: 'cover' }} />
            ) : (
              <div className="sidebar-avatar">{initials}</div>
            )}
            <div className="sidebar-user-info">
              <h3>{fullName}</h3>
              <p>{email}</p>
            </div>
          </div>

          <nav className="sidebar-nav">
            <div 
              className={`sidebar-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <BarChart3 size={18} /> Overview
            </div>
            <div style={{ margin: 'var(--space-4) 0', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }} />
            
            <a href="#" className="sidebar-nav-item" style={{ color: 'var(--color-danger)' }} onClick={handleLogout}>
              <LogOut size={18} /> Log Out
            </a>
          </nav>
        </aside>

        <section className="dashboard-content">
          <div className="dashboard-content-header">
            <h1>Professional Dashboard</h1>
            <p>Welcome back, {fullName}. Here's what's happening today.</p>
          </div>

          {renderContent()}
        </section>
      </div>
    </main>
  );
}
