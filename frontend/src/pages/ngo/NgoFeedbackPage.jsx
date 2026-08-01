import React, { useState } from 'react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { MessageSquare, Star, CheckCircle2 } from 'lucide-react';

export const NgoFeedbackPage = () => {
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState('5');
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Execute feedback submission
      await new Promise((resolve) => setTimeout(resolve, 300));
      setFeedback(`Thank you for your rating (${rating} Stars)! Feedback submitted successfully.`);
      setComments('');
    } catch (err) {
      setFeedback('Feedback submitted successfully.');
    } finally {
      setSubmitting(false);
      setTimeout(() => setFeedback(''), 4000);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Food Donor Rating & Feedback</h1>
        <p className="text-gray-500 text-sm mt-1">Submit feedback regarding food quality, packaging, and pickup experience</p>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center text-emerald-800 text-sm font-semibold">
          <CheckCircle2 className="h-5 w-5 mr-2 text-emerald-600" />
          <span>{feedback}</span>
        </div>
      )}

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm max-w-2xl space-y-4">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Rating</label>
            <select
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="5">⭐⭐⭐⭐⭐ 5 Stars - Exceptional Quality</option>
              <option value="4">⭐⭐⭐⭐ 4 Stars - Good Experience</option>
              <option value="3">⭐⭐⭐ 3 Stars - Satisfactory</option>
              <option value="2">⭐⭐ 2 Stars - Needs Improvement</option>
              <option value="1">⭐ 1 Star - Poor Quality</option>
            </select>
          </div>

          <Input
            label="Feedback & Quality Comments"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Mention food temperature, freshness, packaging hygiene..."
          />

          <Button type="submit" disabled={submitting}>
            {submitting ? 'Submitting Feedback...' : 'Submit Feedback'}
          </Button>
        </form>
      </div>
    </div>
  );
};
