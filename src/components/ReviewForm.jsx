import { useState } from 'react';
import { Loader2, CheckCircle2, MessageSquare } from 'lucide-react';
import { dbService } from '../lib/dbService';
import './ReviewForm.css';

export default function ReviewForm({ professionalId, onReviewSubmitted }) {
  const [name, setName] = useState('');
  const [review, setReview] = useState('');
  const [serviceUsed, setServiceUsed] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = 'Name is required';
    if (!review.trim()) errs.review = 'Please share your experience';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const newReview = dbService.submitReview({
        professional_id: professionalId,
        text: review.trim(),
        author_name: name.trim(),
        service_used: serviceUsed.trim(),
        is_verified_client: false,
      });

      setIsSubmitting(false);
      setIsSuccess(true);

      if (onReviewSubmitted) {
        onReviewSubmitted(newReview);
      }
    }, 800);
  };

  if (isSuccess) {
    return (
      <div className="review-form" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
        <CheckCircle2 size={48} color="var(--color-success)" style={{ margin: '0 auto var(--space-4)' }} />
        <h4 style={{ marginBottom: 'var(--space-2)' }}>Testimonial Submitted</h4>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
          Thank you for sharing your experience!
        </p>
      </div>
    );
  }

  return (
    <form className="review-form" onSubmit={handleSubmit} noValidate>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'var(--space-4)' }}>
        <MessageSquare size={18} style={{ color: 'var(--accent-primary)' }} />
        <h4 style={{ margin: 0 }}>Share Your Experience</h4>
      </div>

      {/* Name */}
      <div className="form-field">
        <label>Your Name <span style={{ color: 'var(--color-danger)' }}>*</span></label>
        <input
          type="text"
          className="review-input"
          placeholder="Enter your full name"
          value={name}
          onChange={(e) => { setName(e.target.value); setErrors(p => ({ ...p, name: null })); }}
          disabled={isSubmitting}
        />
        {errors.name && <span className="review-error">{errors.name}</span>}
      </div>

      {/* Experience Text */}
      <div className="form-field">
        <label>Your Experience <span style={{ color: 'var(--color-danger)' }}>*</span></label>
        <textarea
          className="review-textarea"
          placeholder="Share your experience working with this professional — what was the outcome, what did you value most?"
          value={review}
          onChange={(e) => { setReview(e.target.value); setErrors(p => ({ ...p, review: null })); }}
          disabled={isSubmitting}
          rows={4}
        />
        {errors.review && <span className="review-error">{errors.review}</span>}
      </div>

      {/* Service Used (Optional) */}
      <div className="form-field">
        <label>Service Used <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
        <input
          type="text"
          className="review-input"
          placeholder="e.g., ITR Filing, GST Registration"
          value={serviceUsed}
          onChange={(e) => setServiceUsed(e.target.value)}
          disabled={isSubmitting}
        />
      </div>

      <button
        type="submit"
        className="btn btn-primary"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <><Loader2 size={18} className="spin" /> Submitting...</>
        ) : (
          'Submit Testimonial'
        )}
      </button>
    </form>
  );
}
