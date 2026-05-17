import { Link } from 'react-router-dom';
import { Star, Check, MapPin, Briefcase } from 'lucide-react';
import { buildWhatsAppUrl, trackWhatsAppClick, isWhatsAppEnabled } from '../lib/whatsapp';
import './ProfessionalCard.css';

// Inline WhatsApp SVG (no extra dep)
const WaIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

export default function ProfessionalCard({ professional }) {
  const {
    id, name, category, initials, rating, reviews,
    experience, city, startingPrice, verification, featured,
    availability, services
  } = professional;

  const waEnabled = isWhatsAppEnabled(professional);
  const waUrl = waEnabled
    ? buildWhatsAppUrl(
        professional.contactPhone || professional.contact_phone ||
        professional.settings?.whatsappNumber || '',
        name,
        services
      )
    : null;

  const handleWaClick = (e) => {
    e.preventDefault();
    trackWhatsAppClick(id);
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={`pro-card ${featured ? 'pro-card-featured' : ''}`} id={`pro-card-${id}`}>
      <div className="pro-card-header">
        <div className="pro-card-avatar">{initials}</div>
        <div className="pro-card-info">
          <h3 className="pro-card-name">{name}</h3>

          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span className="badge badge-primary">{category}</span>
            {verification?.status === 'verified' && (
              <span className="badge badge-gold" title={`Identity & Credentials Verified since ${verification.date}`}>
                <Check size={12} strokeWidth={3} /> Wisor Verified
              </span>
            )}
            {verification?.status === 'pending' && (
              <span className="badge" style={{ background: 'var(--color-warning-bg)', color: 'var(--color-warning)' }}>
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
              <Star size={14} fill="currentColor" />
              {rating} <span className="pro-card-rating-count">• {reviews} reviews</span>
            </span>
            <span><Briefcase size={14} /> {experience} yrs</span>
            <span><MapPin size={14} /> {city}</span>
          </div>
        </div>
      </div>

      <div className="pro-card-services">
        {services.slice(0, 3).map((s) => (
          <span key={s} className="pro-card-service-tag">{s}</span>
        ))}
        {services.length > 3 && (
          <span className="pro-card-service-tag more">+{services.length - 3} more</span>
        )}
      </div>

      <div className="pro-card-footer" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="pro-card-price">
            From <strong>₹{startingPrice.toLocaleString()}</strong>
          </div>
          <div className="pro-card-availability">{availability}</div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {waEnabled && (
            <a
              href={waUrl}
              onClick={handleWaClick}
              className="btn btn-primary btn-card"
              style={{ flex: 1, background: '#25d366', borderColor: '#25d366', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              title={`WhatsApp ${name}`}
              aria-label={`Message ${name} on WhatsApp`}
            >
              <WaIcon /> Chat on WhatsApp
            </a>
          )}
          <Link to={`/professional/${id}`} className="btn btn-secondary btn-card" style={{ flex: 1, textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            View Profile
          </Link>
        </div>
      </div>
    </div>
  );
}
