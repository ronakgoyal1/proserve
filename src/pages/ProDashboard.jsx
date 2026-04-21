import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart3, UserCheck, User, Star, DollarSign, Search, Check, LogOut, ShieldCheck, UploadCloud, X, Loader2, LayoutTemplate
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

  const [verificationStatus, setVerificationStatus] = useState(user?.user_metadata?.verificationStatus || 'unverified');
  const [isVerifying, setIsVerifying] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    setIsVerifying(true);
    try {
      await authService.updateUserMetadata({ verificationStatus: 'pending' });
      setVerificationStatus('pending');
      setShowVerifyModal(false);
    } catch(err) {
      console.error(err);
    } finally {
      setIsVerifying(false);
    }
  };

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
            {verificationStatus === 'unverified' && (
              <div className="dashboard-section animate-fade-in" style={{ background: 'var(--color-primary-bg)', borderColor: 'var(--color-primary)', marginBottom: 'var(--space-6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
                <div>
                  <h3 style={{ color: 'var(--color-primary)' }}>Level up your profile</h3>
                  <p style={{ color: 'var(--color-primary-dark)', marginTop: 4 }}>Verified professionals get 3x more bookings. Upload your credentials to receive the verified badge.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowVerifyModal(true)}>Submit Documents</button>
              </div>
            )}
            
            {verificationStatus === 'pending' && (
              <div className="dashboard-section animate-fade-in" style={{ background: 'var(--color-warning-bg)', borderColor: 'var(--color-warning)', marginBottom: 'var(--space-6)', padding: 'var(--space-6)' }}>
                <h3 style={{ color: 'var(--color-warning)', display: 'flex', alignItems: 'center', gap: 8 }}><ShieldCheck size={20} /> Verification Under Review</h3>
                <p style={{ color: 'var(--color-gray-700)', marginTop: 4 }}>Our trust team is reviewing your documents. You'll be notified within 24-48 hours once completed.</p>
              </div>
            )}

            {verificationStatus === 'verified' && (
              <div className="dashboard-section animate-fade-in" style={{ background: 'var(--color-success-bg)', borderColor: 'var(--color-success)', marginBottom: 'var(--space-6)', padding: 'var(--space-6)' }}>
                <h3 style={{ color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: 8 }}><ShieldCheck size={20} /> Verified Professional</h3>
                <p style={{ color: 'var(--color-gray-700)', marginTop: 4 }}>Your account is verified. You now rank higher in search results and have the trust badge on your profile.</p>
              </div>
            )}

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
            <Link to="/ai-portfolio" className="sidebar-nav-item" style={{ color: 'var(--color-accent)' }}>
              <LayoutTemplate size={18} /> AI Portfolio
            </Link>
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

      {/* Verify Now Modal */}
      {showVerifyModal && (
        <div className="modal-overlay animate-fade-in" onClick={() => setShowVerifyModal(false)}>
          <div className="modal-content animate-slide-up" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3>Get Verified</h3>
              <button className="modal-close" onClick={() => setShowVerifyModal(false)}><X size={24} /></button>
            </div>
            <div className="modal-body" style={{ padding: 'var(--space-6)' }}>
              <p style={{ color: 'var(--color-gray-600)', marginBottom: 'var(--space-6)' }}>
                Submit your identity and professional credentials to receive the 'Verified' badge on ProServe. This builds fast trust with prospective clients.
              </p>
              <form onSubmit={handleVerifySubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  <label style={{ fontSize: '14px', fontWeight: 600 }}>Government ID (Aadhar/PAN)</label>
                  <label style={{ border: '2px dashed var(--color-gray-300)', padding: 'var(--space-6)', borderRadius: 'var(--radius-md)', textAlign: 'center', cursor: 'pointer', background: 'var(--color-gray-50)' }}>
                    <UploadCloud size={32} style={{ color: 'var(--color-gray-400)', margin: '0 auto var(--space-2)' }} />
                    <span style={{ fontSize: '13px', color: 'var(--color-primary)', fontWeight: 500 }}>Browse Files</span>
                    <input type="file" style={{ display: 'none' }} required />
                  </label>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  <label style={{ fontSize: '14px', fontWeight: 600 }}>Professional Certificate (ICAI/ICMAI)</label>
                  <label style={{ border: '2px dashed var(--color-gray-300)', padding: 'var(--space-6)', borderRadius: 'var(--radius-md)', textAlign: 'center', cursor: 'pointer', background: 'var(--color-gray-50)' }}>
                    <UploadCloud size={32} style={{ color: 'var(--color-gray-400)', margin: '0 auto var(--space-2)' }} />
                    <span style={{ fontSize: '13px', color: 'var(--color-primary)', fontWeight: 500 }}>Browse Files</span>
                    <input type="file" style={{ display: 'none' }} required />
                  </label>
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 'var(--space-4)', padding: 'var(--space-3)' }} disabled={isVerifying}>
                  {isVerifying ? <><Loader2 size={16} className="spin"/> Submitting...</> : 'Submit for Review'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
