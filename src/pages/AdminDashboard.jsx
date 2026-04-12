import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, CheckCircle, XCircle, TrendingUp, ShieldCheck, 
  Settings, MessageSquare, AlertTriangle, UserPlus, FileText, Star, LogOut
} from 'lucide-react';
import { useAuth } from '../components/AuthContext';
import { authService } from '../lib/authService';
import { useNavigate } from 'react-router-dom';
import { professionals } from '../data/mockData';
import './Dashboard.css';

// Mock Data
const pendingProfessionals = [
  { id: 'PRO-109', name: 'Amit Desai', category: 'CA', experience: 5, city: 'Pune', date: 'Oct 18, 2026', status: 'Pending' },
  { id: 'PRO-110', name: 'Priya Sharma', category: 'CMA', experience: 8, city: 'Delhi', date: 'Oct 17, 2026', status: 'Pending' },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [queue, setQueue] = useState(pendingProfessionals);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async (e) => {
    e.preventDefault();
    await authService.signOut();
    navigate('/login');
  };

  const fullName = user?.user_metadata?.full_name || user?.user_metadata?.name || 'Admin Node';
  const email = user?.email || 'admin@proserve.in';
  const avatarUrl = user?.user_metadata?.avatar_url;
  const initials = fullName ? fullName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'A';

  const handleAction = (id, action) => {
    setQueue(queue.filter(p => p.id !== id));
    // In real app, trigger api and toast
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <>
            <div className="dashboard-stats">
              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'var(--color-primary-bg)', color: 'var(--color-primary)' }}>
                  <Users size={24} />
                </div>
                <div className="stat-info">
                  <h4>Total Users</h4>
                  <div className="stat-value">12.5k</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'var(--color-success-bg)', color: 'var(--color-success)' }}>
                  <ShieldCheck size={24} />
                </div>
                <div className="stat-info">
                  <h4>Verified Pros</h4>
                  <div className="stat-value">845</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'var(--color-warning-bg)', color: 'var(--color-warning)' }}>
                  <UserPlus size={24} />
                </div>
                <div className="stat-info">
                  <h4>Pending Approvals</h4>
                  <div className="stat-value">{queue.length}</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: '#f5f3ff', color: '#8b5cf6' }}>
                  <TrendingUp size={24} />
                </div>
                <div className="stat-info">
                  <h4>Revenue (Mtd)</h4>
                  <div className="stat-value">₹2.4M</div>
                </div>
              </div>
            </div>

            <div className="dashboard-section animate-fade-in">
              <div className="dashboard-section-header">
                <h3>Verification Queue</h3>
              </div>
              
              <div className="dashboard-table-wrapper">
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Pro ID</th>
                      <th>Name / Category</th>
                      <th>Experience</th>
                      <th>City</th>
                      <th>Date Applied</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {queue.length > 0 ? queue.map(pro => (
                      <tr key={pro.id}>
                        <td style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-500)' }}>{pro.id}</td>
                        <td style={{ fontWeight: 600 }}>
                          {pro.name} <br/>
                          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-500)', fontWeight: 400 }}>{pro.category}</span>
                        </td>
                        <td>{pro.experience} Yrs</td>
                        <td>{pro.city}</td>
                        <td style={{ color: 'var(--color-gray-500)' }}>{pro.date}</td>
                        <td>
                          <div className="table-actions">
                            <button className="btn btn-primary btn-sm" onClick={() => handleAction(pro.id, 'approve')}><CheckCircle size={16}/> Approve</button>
                            <button className="btn btn-ghost btn-sm" style={{ color: 'var(--color-danger)' }} onClick={() => handleAction(pro.id, 'reject')}><XCircle size={16}/> Reject</button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
                          <p style={{ color: 'var(--color-gray-500)' }}>No pending approvals.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        );

      case 'users':
      case 'analytics':
      case 'support':
      case 'featured':
      default:
        return (
          <div className="dashboard-section animate-fade-in">
            <div className="empty-state">
              <div className="empty-state-icon"><Settings size={28} /></div>
              <h3>Under Construction</h3>
              <p>The {activeTab} module will be available in Phase 3.</p>
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
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="sidebar-avatar" style={{ objectFit: 'cover' }} />
            ) : (
              <div className="sidebar-avatar" style={{ background: '#0f172a' }}>{initials}</div>
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
              <TrendingUp size={18} /> Overview
              {queue.length > 0 && <span className="sidebar-badge">{queue.length}</span>}
            </div>
            <div 
              className={`sidebar-nav-item ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              <Users size={18} /> Manage Users
            </div>
            <div 
              className={`sidebar-nav-item ${activeTab === 'professionals' ? 'active' : ''}`}
              onClick={() => setActiveTab('professionals')}
            >
              <ShieldCheck size={18} /> Professional Directory
            </div>
            <div 
              className={`sidebar-nav-item ${activeTab === 'featured' ? 'active' : ''}`}
              onClick={() => setActiveTab('featured')}
            >
              <Star size={18} /> Featured Listings
            </div>
            <div 
              className={`sidebar-nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              <FileText size={18} /> Platform Analytics
            </div>
            <div 
              className={`sidebar-nav-item ${activeTab === 'support' ? 'active' : ''}`}
              onClick={() => setActiveTab('support')}
            >
              <MessageSquare size={18} /> Support Tickets
            </div>

            <div style={{ margin: 'var(--space-4) 0', borderTop: '1px solid var(--color-gray-100)' }} />
            
            <a href="#" className="sidebar-nav-item" style={{ color: 'var(--color-danger)' }} onClick={handleLogout}>
              <LogOut size={18} /> Log Out
            </a>
          </nav>
        </aside>

        <section className="dashboard-content">
          <div className="dashboard-content-header">
            <h1>Admin Control Panel</h1>
            <p>Manage the ProServe network, users, and approvals</p>
          </div>

          {renderContent()}
        </section>
      </div>
    </main>
  );
}
