import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar, Clock, FileText, Heart, MessageSquare,
  CreditCard, LogOut, Search, ChevronRight, Check
} from 'lucide-react';
import { useAuth } from '../components/AuthContext';
import { authService } from '../lib/authService';
import { useNavigate } from 'react-router-dom';
import { professionals } from '../data/mockData';
import ProfessionalCard from '../components/ProfessionalCard';
import './Dashboard.css';

// Mock Data for User
const userBookings = [
  { id: 'BKG-101', professional: professionals[0], service: 'ITR Filing - Basic', date: 'Oct 15, 2026', time: '10:00 AM', status: 'Upcoming', amount: 1499 },
  { id: 'BKG-102', professional: professionals[1], service: 'GST Registration', date: 'Oct 12, 2026', time: '02:00 PM', status: 'Completed', amount: 3499 },
  { id: 'BKG-103', professional: professionals[3], service: 'Tax Planning', date: 'Oct 05, 2026', time: '11:00 AM', status: 'Completed', amount: 2999 },
];

const userRequests = [
  { id: 'REQ-01', title: 'Need Corporate Tax Audit', category: 'CA', budget: '₹10,000 - ₹25,000', responses: 3, status: 'Active', date: 'Oct 14, 2026' },
  { id: 'REQ-02', title: 'Monthly MIS setup for Manufacturing', category: 'CMA', budget: '₹5,000 / month', responses: 0, status: 'Pending', date: 'Oct 16, 2026' },
];

export default function UserDashboard() {
  const [activeTab, setActiveTab] = useState('bookings');
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async (e) => {
    e.preventDefault();
    await authService.signOut();
    navigate('/login');
  };

  const fullName = user?.user_metadata?.full_name || user?.user_metadata?.name || 'User Account';
  const email = user?.email || 'user@example.com';
  const avatarUrl = user?.user_metadata?.avatar_url;
  const initials = fullName ? fullName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'U';

  const renderContent = () => {
    switch (activeTab) {
      case 'bookings':
        return (
          <div className="dashboard-section animate-fade-in">
            <div className="dashboard-section-header">
              <h3>My Bookings</h3>
              <button className="btn btn-primary btn-sm">Book New</button>
            </div>

            {userBookings.length > 0 ? (
              <div className="dashboard-table-wrapper">
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Professional / Service</th>
                      <th>Date & Time</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userBookings.map(b => (
                      <tr key={b.id}>
                        <td style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-500)' }}>{b.id}</td>
                        <td>
                          <div className="table-main-col">
                            <div className="review-avatar" style={{ width: 32, height: 32, fontSize: 12 }}>
                              {b.professional.initials}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: 'var(--color-gray-900)' }}>{b.professional.name}</div>
                              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-500)' }}>{b.service}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 500 }}>{b.date}</div>
                          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-500)' }}>{b.time}</div>
                        </td>
                        <td style={{ fontWeight: 600 }}>₹{b.amount}</td>
                        <td>
                          <span className={`table-status status-${b.status.toLowerCase()}`}>
                            {b.status}
                          </span>
                        </td>
                        <td>
                          <div className="table-actions">
                            <button className="btn btn-ghost btn-sm">View</button>
                            {b.status === 'Upcoming' && <button className="btn btn-secondary btn-sm">Reschedule</button>}
                            {b.status === 'Completed' && <button className="btn btn-primary btn-sm">Review</button>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon"><Calendar size={28} /></div>
                <h3>No bookings yet</h3>
                <p>You haven't booked any consultations with our professionals.</p>
                <Link to="/search" className="btn btn-primary">Find an Expert</Link>
              </div>
            )}
          </div>
        );
      case 'requests':
        return (
          <div className="dashboard-section animate-fade-in">
            <div className="dashboard-section-header">
              <h3>My Custom Requests</h3>
              <button className="btn btn-primary btn-sm">Post Requirement</button>
            </div>

            <div className="dashboard-table-wrapper">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Budget</th>
                    <th>Responses</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {userRequests.map(req => (
                    <tr key={req.id}>
                      <td style={{ fontWeight: 500, color: 'var(--color-gray-900)' }}>{req.title}</td>
                      <td><span className="badge badge-primary">{req.category}</span></td>
                      <td>{req.budget}</td>
                      <td>
                        <span style={{ fontWeight: 600, color: req.responses > 0 ? 'var(--color-primary)' : 'var(--color-gray-500)' }}>
                          {req.responses} Experts
                        </span>
                      </td>
                      <td>
                        <span className={`table-status status-${req.status === 'Active' ? 'completed' : 'pending'}`}>
                          {req.status}
                        </span>
                      </td>
                      <td style={{ color: 'var(--color-gray-500)' }}>{req.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'saved':
        return (
          <div className="dashboard-section animate-fade-in" style={{ background: 'transparent', border: 'none' }}>
            <div className="dashboard-section-header" style={{ background: 'var(--color-white)', borderRadius: 'var(--radius-xl)', marginBottom: 'var(--space-6)', border: '1px solid var(--color-gray-200)' }}>
              <h3>Saved Professionals</h3>
              <span className="results-count">2 Saved</span>
            </div>

            <div className="pros-grid">
              <ProfessionalCard professional={professionals[0]} />
              <ProfessionalCard professional={professionals[1]} />
            </div>
          </div>
        );
      case 'messages':
      case 'payments':
      default:
        return (
          <div className="dashboard-section animate-fade-in">
            <div className="empty-state">
              <div className="empty-state-icon"><Clock size={28} /></div>
              <h3>Coming Soon</h3>
              <p>This feature is currently under development.</p>
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
              <div className="sidebar-avatar">{initials}</div>
            )}
            <div className="sidebar-user-info">
              <h3>{fullName}</h3>
              <p>{email}</p>
            </div>
          </div>

          <nav className="sidebar-nav">
            <div
              className={`sidebar-nav-item ${activeTab === 'bookings' ? 'active' : ''}`}
              onClick={() => setActiveTab('bookings')}
            >
              <Calendar size={18} /> My Bookings
              <span className="sidebar-badge">1</span>
            </div>
            <div
              className={`sidebar-nav-item ${activeTab === 'requests' ? 'active' : ''}`}
              onClick={() => setActiveTab('requests')}
            >
              <FileText size={18} /> Custom Requests
            </div>
            <div
              className={`sidebar-nav-item ${activeTab === 'saved' ? 'active' : ''}`}
              onClick={() => setActiveTab('saved')}
            >
              <Heart size={18} /> Saved Experts
            </div>
            <div
              className={`sidebar-nav-item ${activeTab === 'messages' ? 'active' : ''}`}
              onClick={() => setActiveTab('messages')}
            >
              <MessageSquare size={18} /> Messages
            </div>
            <div
              className={`sidebar-nav-item ${activeTab === 'payments' ? 'active' : ''}`}
              onClick={() => setActiveTab('payments')}
            >
              <CreditCard size={18} /> Payment History
            </div>

            <div style={{ margin: 'var(--space-4) 0', borderTop: '1px solid var(--color-gray-100)' }} />

            <a href="#" className="sidebar-nav-item" style={{ color: 'var(--color-danger)' }} onClick={handleLogout}>
              <LogOut size={18} /> Log Out
            </a>
          </nav>
        </aside>

        <section className="dashboard-content">
          <div className="dashboard-content-header">
            <h1>User Dashboard</h1>
            <p>Manage your consultations, requests, and account</p>
          </div>

          <div className="dashboard-stats">
            <div className="stat-card">
              <div className="stat-icon"><Calendar size={24} /></div>
              <div className="stat-info">
                <h4>Upcoming</h4>
                <div className="stat-value">1</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'var(--color-success-bg)', color: 'var(--color-success)' }}>
                <Check size={24} />
              </div>
              <div className="stat-info">
                <h4>Completed</h4>
                <div className="stat-value">2</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'var(--color-warning-bg)', color: 'var(--color-warning)' }}>
                <FileText size={24} />
              </div>
              <div className="stat-info">
                <h4>Requests</h4>
                <div className="stat-value">2</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#fce7f3', color: '#db2777' }}>
                <Heart size={24} />
              </div>
              <div className="stat-info">
                <h4>Saved</h4>
                <div className="stat-value">2</div>
              </div>
            </div>
          </div>

          {renderContent()}
        </section>
      </div>
    </main>
  );
}
