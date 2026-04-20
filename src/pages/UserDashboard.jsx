import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, FileText, Check, LogOut
} from 'lucide-react';
import { useAuth } from '../components/AuthContext';
import { authService } from '../lib/authService';
import { dbService } from '../lib/dbService';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';



export default function UserDashboard() {
  const [activeTab, setActiveTab] = useState('bookings');
  const [userBookings, setUserBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      try {
        const bookings = await dbService.getBookingsForUser(user.id);
        setUserBookings(bookings || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [user]);

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

            {isLoading ? (
              <div className="empty-state">
                <p>Loading your bookings...</p>
              </div>
            ) : userBookings.length > 0 ? (
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
                            <div>
                              <div style={{ fontWeight: 600, color: 'var(--color-gray-900)' }}>{b.professionalName || 'Professional'}</div>
                              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-500)' }}>{b.service || 'Service'}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 500 }}>{b.date}</div>
                          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-500)' }}>{b.time}</div>
                        </td>
                        <td style={{ fontWeight: 600 }}>₹{b.amount}</td>
                        <td>
                          <span className={`table-status status-${(b.status || 'upcoming').toLowerCase()}`}>
                            {b.status}
                          </span>
                        </td>
                        <td>
                          <div className="table-actions">
                            <button className="btn btn-ghost btn-sm">View</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon" style={{ background: 'var(--color-primary-bg)', color: 'var(--color-primary)' }}><Calendar size={28} /></div>
                <h3 style={{ marginTop: 'var(--space-4)' }}>No active bookings</h3>
                <p>You haven't booked any consultations with our professionals yet. Start exploring!</p>
                <Link to="/search" className="btn btn-primary" style={{ marginTop: 'var(--space-4)' }}>Find an Expert</Link>
              </div>
            )}
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
              className={`sidebar-nav-item ${activeTab === 'bookings' ? 'active' : ''}`}
              onClick={() => setActiveTab('bookings')}
            >
              <Calendar size={18} /> My Bookings
            </div>

            <div style={{ margin: 'var(--space-4) 0', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }} />

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
                <h4>Bookings</h4>
                <div className="stat-value">{userBookings.length}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'var(--color-success-bg)', color: 'var(--color-success)' }}>
                <Check size={24} />
              </div>
              <div className="stat-info">
                <h4>Completed</h4>
                <div className="stat-value">{userBookings.filter(b => b.status === 'Completed').length}</div>
              </div>
            </div>
          </div>

          {renderContent()}
        </section>
      </div>
    </main>
  );
}
