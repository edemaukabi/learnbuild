'use client';

import { useEffect, useState, useCallback } from 'react';
import { Star } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { formatRating } from '@/lib/utils';

interface ReviewUser {
  firstName: string;
  lastName: string;
  avatar: string | null;
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: ReviewUser;
}

interface ReviewsMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          className="p-0.5 transition-transform hover:scale-110"
        >
          <Star
            size={22}
            className={(hover || value) >= n ? 'text-[var(--amber)] fill-[var(--amber)]' : 'text-[var(--fg-4)]'}
          />
        </button>
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="flex gap-4 py-4 border-b border-[var(--border)] last:border-0">
      {review.user.avatar ? (
        <Image
          src={review.user.avatar}
          alt={`${review.user.firstName} ${review.user.lastName}`}
          width={38}
          height={38}
          className="rounded-full object-cover shrink-0"
        />
      ) : (
        <div className="w-[38px] h-[38px] rounded-full bg-[var(--card-2)] flex items-center justify-center text-sm font-medium text-[var(--fg-2)] shrink-0">
          {review.user.firstName[0]}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <p className="text-sm font-medium text-[var(--fg)]">
            {review.user.firstName} {review.user.lastName}
          </p>
          <span className="text-xs text-[var(--fg-4)] shrink-0">
            {new Date(review.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        </div>
        <div className="flex gap-0.5 mb-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <Star
              key={n}
              size={12}
              className={review.rating >= n ? 'text-[var(--amber)] fill-[var(--amber)]' : 'text-[var(--fg-4)]'}
            />
          ))}
        </div>
        {review.comment && (
          <p className="text-sm text-[var(--fg-2)] leading-relaxed">{review.comment}</p>
        )}
      </div>
    </div>
  );
}

export default function ReviewSection({
  courseId,
  averageRating,
  totalReviews,
}: {
  courseId: string;
  averageRating: number;
  totalReviews: number;
}) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [meta, setMeta] = useState<ReviewsMeta | null>(null);
  const [page, setPage] = useState(1);
  const [loadingReviews, setLoadingReviews] = useState(true);

  // My review state
  const [myReview, setMyReview] = useState<{ id: string; rating: number; comment: string | null } | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchReviews = useCallback(async (p: number) => {
    setLoadingReviews(true);
    try {
      const res = await api.get<{ data: Review[]; meta: ReviewsMeta }>(`/reviews/${courseId}?page=${p}&limit=8`);
      setReviews(p === 1 ? res.data.data : (prev) => [...prev, ...res.data.data]);
      setMeta(res.data.meta);
    } catch {
      // silent
    } finally {
      setLoadingReviews(false);
    }
  }, [courseId]);

  useEffect(() => { fetchReviews(1); }, [fetchReviews]);

  useEffect(() => {
    if (!user) return;
    api.get<{ enrolled: boolean }>(`/enrollments/check/${courseId}`)
      .then((r) => setIsEnrolled(r.data.enrolled))
      .catch(() => {});
    api.get(`/reviews/${courseId}/mine`)
      .then((r) => {
        if (r.data) {
          setMyReview(r.data);
          setRating(r.data.rating);
          setComment(r.data.comment ?? '');
        }
      })
      .catch(() => {});
  }, [user, courseId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');
    try {
      const res = await api.post<Review & { user: ReviewUser }>(`/reviews/${courseId}`, { rating, comment: comment.trim() || undefined });
      setMyReview({ id: res.data.id, rating: res.data.rating, comment: res.data.comment });
      setShowForm(false);
      fetchReviews(1);
      setPage(1);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setFormError(typeof msg === 'string' ? msg : 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchReviews(next);
  };

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-[var(--fg)]">Student reviews</h2>
        {averageRating > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star
                  key={n}
                  size={14}
                  className={averageRating >= n ? 'text-[var(--amber)] fill-[var(--amber)]' : 'text-[var(--fg-4)]'}
                />
              ))}
            </div>
            <span className="text-sm font-semibold text-[var(--fg)]">{formatRating(averageRating)}</span>
            <span className="text-xs text-[var(--fg-4)]">({totalReviews})</span>
          </div>
        )}
      </div>

      {/* Write / edit review */}
      {user && isEnrolled && (
        <div className="mb-6">
          {myReview && !showForm ? (
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 flex items-start justify-between gap-4">
              <div>
                <div className="flex gap-0.5 mb-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star key={n} size={13} className={myReview.rating >= n ? 'text-[var(--amber)] fill-[var(--amber)]' : 'text-[var(--fg-4)]'} />
                  ))}
                </div>
                {myReview.comment && <p className="text-sm text-[var(--fg-2)]">{myReview.comment}</p>}
              </div>
              <button
                onClick={() => setShowForm(true)}
                className="text-xs text-[var(--sky)] hover:underline shrink-0"
              >
                Edit review
              </button>
            </div>
          ) : showForm || !myReview ? (
            <form onSubmit={handleSubmit} className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 space-y-3">
              <p className="text-sm font-medium text-[var(--fg)]">
                {myReview ? 'Update your review' : 'Leave a review'}
              </p>
              <StarPicker value={rating} onChange={setRating} />
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                placeholder="Share your experience (optional)…"
                className="w-full rounded-md border border-[var(--border-2)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--fg)] placeholder:text-[var(--fg-4)] focus:border-[var(--sky)] focus:outline-none resize-none transition-[border-color]"
              />
              {formError && <p className="text-xs text-[var(--rose)]">{formError}</p>}
              <div className="flex gap-2">
                <Button type="submit" disabled={submitting} className="text-sm">
                  {submitting ? 'Submitting…' : myReview ? 'Update' : 'Submit review'}
                </Button>
                {myReview && (
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="text-sm">
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          ) : null}
        </div>
      )}

      {/* Reviews list */}
      {loadingReviews && reviews.length === 0 ? (
        <p className="text-sm text-[var(--fg-4)]">Loading reviews…</p>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-[var(--fg-4)]">No reviews yet. Be the first!</p>
      ) : (
        <>
          <div className="divide-y divide-[var(--border)]">
            {reviews.map((r) => <ReviewCard key={r.id} review={r} />)}
          </div>
          {meta && page < meta.totalPages && (
            <button
              onClick={handleLoadMore}
              disabled={loadingReviews}
              className="mt-4 text-sm text-[var(--sky)] hover:underline disabled:opacity-50"
            >
              {loadingReviews ? 'Loading…' : 'Load more reviews'}
            </button>
          )}
        </>
      )}
    </section>
  );
}
