import { useState } from 'react';
import { Star, Loader2, CheckCircle2 } from 'lucide-react';
import { dbService } from '../lib/dbService';
import './ReviewForm.css';

export default function ReviewForm({ professionalId, onReviewSubmitted }) {
  const [name, setName] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const [serviceUsed, setServiceUsed] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = 'Name is required';
    if (rating === 0) errs.rating = 'Please select a rating';
    if (!review.trim()) errs.review = 'Review text is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    // Small delay for UX
    setTimeout(() => {
      const newReview = dbService.submitReview({
        professional_id: professionalId,
        rating,
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
        <h4 style={{ marginBottom: 'var(--space-2)' }}>Review Submitted</h4>
        <p style={{ color: 'var(--color-gray-500)', fontSize: 'var(--text-sm)' }}>
          Thank you for sharing your experience!
        </p>
      </div>
    );
  }

  return (
    <form className="review-form" onSubmit={handleSubmit} noValidate>
      <h4>Write a Review</h4>
      
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

      {/* Rating */}
      <div className="form-field">
        <label>Overall Rating <span style={{ color: 'var(--color-danger)' }}>*</span></label>
        <div className="star-rating-selector" onMouseLeave={() => setHoverRating(0)}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className={(hoverRating || rating) >= star ? 'filled' : ''}
              onClick={() => { setRating(star); setErrors(p => ({ ...p, rating: null })); }}
              onMouseEnter={() => setHoverRating(star)}
            >
              <Star size={28} fill={(hoverRating || rating) >= star ? "currentColor" : "none"} />
            </button>
          ))}
        </div>
        {errors.rating && <span className="review-error">{errors.rating}</span>}
      </div>

      {/* Review Text */}
      <div className="form-field">
        <label>Your Review <span style={{ color: 'var(--color-danger)' }}>*</span></label>
        <textarea 
          className="review-textarea"
          placeholder="Share your experience working with this professional..."
          value={review}
          onChange={(e) => { setReview(e.target.value); setErrors(p => ({ ...p, review: null })); }}
          disabled={isSubmitting}
        />
        {errors.review && <span className="review-error">{errors.review}</span>}
      </div>

      {/* Service Used (Optional) */}
      <div className="form-field">
        <label>Service Used <span style={{ color: 'var(--color-gray-400)', fontWeight: 400 }}>(optional)</span></label>
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
          'Submit Review'
        )}
      </button>
    </form>
  );
}
