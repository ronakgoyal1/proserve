import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, CheckCircle, XCircle, TrendingUp, ShieldCheck, 
  UserPlus, LogOut
} from 'lucide-react';
import { useAuth } from '../components/AuthContext';
import { authService } from '../lib/authService';
import { dbService } from '../lib/dbService';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [queue, setQueue] = useState([]);
  const [metrics, setMetrics] = useState({ totalUsers: 0, verifiedPros: 0, pendingApprovals: 0, revenue: 0 });
  const [loadingQueue, setLoadingQueue] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadQueue() {
      try {
        const [apps, m] = await Promise.all([
           dbService.getPendingApplications(),
           dbService.getAdminMetrics()
        ]);
        setQueue(apps);
        setMetrics(m);
      } catch (e) {
        console.error("Failed to load queue", e);
      } finally {
        setLoadingQueue(false);
      }
    }
    loadQueue();
  }, []);

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await authService.signOut();
      navigate('/login');
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const fullName = user?.user_metadata?.full_name || user?.user_metadata?.name || 'Admin Node';
  const email = user?.email || 'admin@proserve.in';
  const avatarUrl = user?.user_metadata?.avatar_url;
  const initials = fullName ? fullName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'A';

  const handleAction = async (id, action) => {
    try {
      if (action === 'approve') {
        await dbService.approveApplication(id);
        setMetrics(prev => ({ ...prev, verifiedPros: prev.verifiedPros + 1, pendingApprovals: Math.max(0, prev.pendingApprovals - 1) }));
      } else {
        await dbService.rejectApplication(id);
        setMetrics(prev => ({ ...prev, pendingApprovals: Math.max(0, prev.pendingApprovals - 1) }));
      }
      setQueue(queue.filter(p => p.id !== id));
    } catch (e) {
      console.error("Action failed", e);
    }
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
                  <div className="stat-value">{metrics.totalUsers || 0}</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'var(--color-success-bg)', color: 'var(--color-success)' }}>
                  <ShieldCheck size={24} />
                </div>
                <div className="stat-info">
                  <h4>Verified Pros</h4>
                  <div className="stat-value">{metrics.verifiedPros || 0}</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'var(--color-warning-bg)', color: 'var(--color-warning)' }}>
                  <UserPlus size={24} />
                </div>
                <div className="stat-info">
                  <h4>Pending Approvals</h4>
                  <div className="stat-value">{metrics.pendingApprovals || 0}</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: '#f5f3ff', color: '#8b5cf6' }}>
                  <TrendingUp size={24} />
                </div>
                <div className="stat-info">
                  <h4>Revenue (Mtd)</h4>
                  <div className="stat-value">₹{metrics.revenue?.toLocaleString() || 0}</div>
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
                          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-500)', fontWeight: 400 }}>{pro.category} - {pro.specialties || 'General'}</span>
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
                        <td colSpan="6" style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
                          <div className="empty-state-icon" style={{ background: '#f5f3ff', color: '#8b5cf6', margin: '0 auto var(--space-4)' }}><ShieldCheck size={28} /></div>
                          <h3>{loadingQueue ? 'Loading Queue...' : 'Queue Empty'}</h3>
                          <p style={{ color: 'var(--color-gray-500)', maxWidth: '300px', margin: '0 auto' }}>{loadingQueue ? 'Fetching pending profiles.' : 'All professional profiles have been reviewed.'}</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
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
