import { useState } from 'react';
import { X, Check, Calendar, Loader2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { dbService } from '../lib/dbService';
import { sendEmailNotification } from '../lib/emailService';
import './Modal.css';

export default function BookingModal({ isOpen, onClose, professional }) {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState('2');
  const [selectedTime, setSelectedTime] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const dates = [
    { date: '1', day: 'Mon', month: 'Nov' },
    { date: '2', day: 'Tue', month: 'Nov' },
    { date: '3', day: 'Wed', month: 'Nov' },
    { date: '4', day: 'Thu', month: 'Nov' },
    { date: '5', day: 'Fri', month: 'Nov' },
  ];

  const timeSlots = ['10:00 AM', '11:30 AM', '01:00 PM', '02:30 PM', '04:00 PM', '05:30 PM'];

  const handleBooking = async () => {
    if (!session) {
      // Must be logged in to book
      navigate('/login');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const selectedServiceObj = professional?.services?.find(s => s.name === selectedService) || { name: 'Basic Consultation', stringPrice: `₹${professional?.startingPrice}` };
      
      const bookingData = {
        user_id: session.user.id,
        professional_id: professional.id,
        service: selectedServiceObj.name,
        date: `2026-11-${selectedDate.padStart(2, '0')}`,
        time: selectedTime,
        status: 'Upcoming'
      };

      await dbService.createBooking(bookingData);
      
      // Fire mock email async without blocking
      sendEmailNotification(
        session.user.email,
        session.user.user_metadata?.name || 'User',
        'Booking Confirmation - ProServe',
        `Your consultation with ${professional.name} on Nov ${selectedDate} at ${selectedTime} for ${selectedServiceObj.name} is confirmed.`
      ).catch(e => console.warn('Mock email skipped:', e));

      setStep(3); // success state
    } catch (err) {
      console.error('Booking failed:', err);
      setError('An error occurred while booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedServiceObj = professional?.services?.find(s => s.name === selectedService) || { name: 'Basic Consultation', stringPrice: `₹${professional?.startingPrice}` };

  return (
    <div className="modal-overlay animate-fade-in" onClick={step === 3 ? () => {} : onClose}>
      <div className="modal-content animate-slide-up" onClick={e => e.stopPropagation()}>
        
        {step !== 3 && (
          <div className="modal-header">
            <h3>Book Consultation</h3>
            <button className="modal-close" onClick={onClose}><X size={24} /></button>
          </div>
        )}

        <div className="modal-body">
          {step === 1 && (
            <>
              <div className="booking-step">
                <h4>1. Select Service</h4>
                <div className="service-options">
                  {(professional?.services || []).map((s, idx) => (
                    <div 
                      key={idx}
                      className={`service-option ${selectedService === s.name ? 'active' : ''}`}
                      onClick={() => setSelectedService(s.name)}
                    >
                      <span className="service-option-name">{s.name}</span>
                      <span className="service-option-price">{s.stringPrice}</span>
                    </div>
                  ))}
                  {/* Default fallback if array is empty */}
                  {!professional?.services?.length && (
                    <div 
                      className={`service-option ${selectedService === 'Consultation' ? 'active' : ''}`}
                      onClick={() => setSelectedService('Consultation')}
                    >
                      <span className="service-option-name">Standard Consultation</span>
                      <span className="service-option-price">₹{professional?.startingPrice}</span>
                    </div>
                  )}
                </div>
              </div>

              <button 
                className="btn btn-primary" 
                style={{ width: '100%' }}
                disabled={!selectedService}
                onClick={() => setStep(2)}
              >
                Continue to Schedule
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="booking-step">
                <h4>2. Select Date & Time</h4>
                <div className="date-selector">
                  {dates.map((d, i) => (
                    <div 
                      key={i} 
                      className={`date-card ${selectedDate === d.date ? 'active' : ''}`}
                      onClick={() => setSelectedDate(d.date)}
                    >
                      <div className="date-month">{d.month}</div>
                      <div className="date-day">{d.date}</div>
                      <div className="date-weekday">{d.day}</div>
                    </div>
                  ))}
                </div>

                <div className="time-slots">
                  {timeSlots.map((time, i) => (
                    <div 
                      key={i}
                      className={`time-slot ${selectedTime === time ? 'active' : ''} ${i === 2 || i === 4 ? 'disabled' : ''}`}
                      onClick={() => { if(i !== 2 && i !== 4) setSelectedTime(time) }}
                    >
                      {time}
                    </div>
                  ))}
                </div>
                {error && <div style={{ color: 'var(--color-error)', marginTop: '1rem', fontSize: '14px' }}>{error}</div>}
                
                {professional?.verification?.status !== 'verified' && (
                  <div style={{ marginTop: 'var(--space-4)', padding: 'var(--space-3)', background: 'var(--color-warning-bg)', border: '1px solid var(--color-warning)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-warning)', marginBottom: 4, fontWeight: 600 }}>
                      <AlertCircle size={16} /> Verification Pending
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--color-gray-700)', margin: 0, lineHeight: 1.4 }}>
                      This professional has not completed our strict verification process yet. 
                      Proceed with caution as ProServe cannot guarantee their credentials at this time.
                    </p>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn btn-secondary" onClick={() => setStep(1)}>Back</button>
                <button 
                  className="btn btn-primary" 
                  style={{ flex: 1 }}
                  disabled={!selectedDate || !selectedTime || isSubmitting}
                  onClick={handleBooking}
                >
                  {isSubmitting ? (
                    <><Loader2 size={18} className="spin" /> Processing...</>
                  ) : (
                    `Confirm Booking for ${selectedServiceObj.stringPrice}`
                  )}
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <div className="booking-success animate-scale-in">
              <div className="success-icon">
                <Check size={48} />
              </div>
              <h3>Booking Confirmed!</h3>
              <p>Your consultation with {professional.name} is scheduled.</p>
              
              <div className="booking-summary">
                <div className="summary-row">
                  <span>Service</span>
                  <span>{selectedServiceObj.name}</span>
                </div>
                <div className="summary-row">
                  <span>Date & Time</span>
                  <span>{dates.find(d => d.date === selectedDate)?.month} {selectedDate}, 2026 at {selectedTime}</span>
                </div>
                <div className="summary-row total">
                  <span>Amount Paid</span>
                  <span>{selectedServiceObj.stringPrice}</span>
                </div>
              </div>

              <button 
                className="btn btn-primary" 
                style={{ width: '100%' }}
                onClick={() => {
                  onClose();
                  navigate('/dashboard');
                }}
              >
                Go to My Bookings
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
