import React, { useState } from 'react';
import { Star, X } from 'lucide-react';
import { servicesApi } from '../../services/servicesApi.js';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType?: 'SERVICE' | 'EVENT' | 'FACILITY' | 'GENERAL' | 'HELPDESK';
  targetId?: string;
  targetTitle?: string;
  onSuccess?: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  targetType = 'GENERAL',
  targetId,
  targetTitle,
  onSuccess,
}) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError('Please provide feedback comments.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await servicesApi.submitFeedback({
        targetType,
        targetId,
        rating,
        comment,
      });
      setComment('');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-slate-100 mb-1">
          {targetTitle ? `Feedback: ${targetTitle}` : 'Campus Service Feedback'}
        </h3>
        <p className="text-xs text-slate-400 mb-5">
          Your feedback helps institutional administration improve campus facilities and services.
        </p>

        {error && (
          <div className="p-3 mb-4 text-xs text-red-400 bg-red-950/30 border border-red-500/20 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Overall Rating
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 text-slate-600 focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-7 h-7 ${
                      (hoverRating || rating) >= star
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-700'
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs font-bold text-slate-400 ml-2">
                {rating} / 5 Stars
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Comments & Suggestions
            </label>
            <textarea
              rows={4}
              required
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us what went well or what can be improved..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 placeholder-slate-600 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
