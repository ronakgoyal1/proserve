import { Link } from 'react-router-dom';
import { Star, Check, MapPin, Briefcase } from 'lucide-react';
import './ProfessionalCard.css';

export default function ProfessionalCard({ professional }) {
  const {
    id, name, category, initials, rating, reviews,
    experience, city, startingPrice, verification, featured,
    availability, services
  } = professional;

  return (
    <div className={`pro-card ${featured ? 'pro-card-featured' : ''}`} id={`pro-card-${id}`}>
      <div className="pro-card-header">
        <div className="pro-card-avatar">{initials}</div>
        <div className="pro-card-info">
          <h3 className="pro-card-name">
            {name}
          </h3>
          
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span className="badge badge-primary">{category}</span>
            {verification?.status === 'verified' && (
              <span className="badge badge-gold" title={`Identity & Credentials Verified since ${verification.date}`}>
                <Check size={12} strokeWidth={3} /> Verified Expert
              </span>
            )}
            {verification?.status === 'pending' && (
              <span className="badge" style={{ background: 'var(--color-warning-bg)', color: 'var(--color-warning)' }} title="Verification in progress">
                Verification Pending
              </span>
            )}
            {verification?.status === 'unverified' && (
              <span className="badge" style={{ background: 'var(--color-gray-100)', color: 'var(--color-gray-500)' }}>
                Unverified
              </span>
            )}
          </div>
          <div className="pro-card-meta">
            <span className="pro-card-rating">
              <Star size={13} fill="currentColor" />
              {rating} <span style={{ color: 'var(--color-gray-400)', fontWeight: 400 }}>({reviews})</span>
            </span>
            <span><Briefcase size={12} /> {experience} yrs</span>
            <span><MapPin size={12} /> {city}</span>
          </div>
        </div>
      </div>

      <div className="pro-card-services">
        {services.slice(0, 3).map((s) => (
          <span key={s} className="pro-card-service-tag">{s}</span>
        ))}
        {services.length > 3 && (
          <span className="pro-card-service-tag">+{services.length - 3} more</span>
        )}
      </div>

      <div className="pro-card-footer">
        <div>
          <div className="pro-card-price">
            Starting at <strong>₹{startingPrice.toLocaleString()}</strong>
          </div>
          <div className="pro-card-availability">{availability}</div>
        </div>
        <Link to={`/professional/${id}`} className="btn btn-primary btn-sm">
          Book Now
        </Link>
      </div>
    </div>
  );
}
