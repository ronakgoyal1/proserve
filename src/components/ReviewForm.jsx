import { useState } from 'react';
import { Star, Loader2, CheckCircle2 } from 'lucide-react';
import './ReviewForm.css';

export default function ReviewForm({ onReviewSubmitted }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const [reviewerName, setReviewerName] = useState('');
  const [serviceUsed, setServiceUsed] = useState('');
  const [isVerified, setIsVerified] = useState(false); // Demo purposes
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      if (onReviewSubmitted) {
        onReviewSubmitted({
          rating,
          text: review,
          author_name: reviewerName || 'Anonymous User',
          service_used: serviceUsed,
          is_verified_client: isVerified
        });
      }
    }, 1500);
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
    <form className="review-form" onSubmit={handleSubmit}>
      <h4>Write a Review</h4>
      
      <div className="form-field">
        <label>Overall Rating</label>
        <div className="star-rating-selector" onMouseLeave={() => setHoverRating(0)}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className={(hoverRating || rating) >= star ? 'filled' : ''}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
            >
              <Star size={28} fill={(hoverRating || rating) >= star ? "currentColor" : "none"} />
            </button>
          ))}
        </div>
      </div>

      <div className="form-field">
        <label>Your Name (Optional)</label>
        <input 
          type="text" 
          className="review-input"
          placeholder="How should we display your name?"
          value={reviewerName}
          onChange={(e) => setReviewerName(e.target.value)}
          disabled={isSubmitting}
        />
      </div>

      <div className="form-field">
        <label>Service Used (Optional)</label>
        <input 
          type="text" 
          className="review-input"
          placeholder="e.g. GST Registration"
          value={serviceUsed}
          onChange={(e) => setServiceUsed(e.target.value)}
          disabled={isSubmitting}
        />
      </div>

      <div className="form-field" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-4)' }}>
        <input 
          type="checkbox" 
          id="verifiedClient"
          checked={isVerified}
          onChange={(e) => setIsVerified(e.target.checked)}
          disabled={isSubmitting}
          style={{ width: '16px', height: '16px' }}
        />
        <label htmlFor="verifiedClient" style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--color-gray-600)', cursor: 'pointer' }}>
          I am a verified client (Demo)
        </label>
      </div>

      <div className="form-field">
        <label>Your Review (Optional)</label>
        <textarea 
          className="review-textarea"
          placeholder="Share your experience working with this professional..."
          value={review}
          onChange={(e) => setReview(e.target.value)}
          disabled={isSubmitting}
        />
      </div>

      <button 
        type="submit" 
        className="btn btn-primary"
        disabled={rating === 0 || isSubmitting}
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
