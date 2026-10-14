import { useEffect, useState } from 'react';
import reviewService from '../../services/reviewService.js';

const AdminReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ rating: 5, comment: '' });

  const loadReviews = () => {
    setLoading(true);
    reviewService.getAll().then(setReviews).catch((err) => setError(err.message)).finally(() => setLoading(false));
  };

  useEffect(() => {
    const timeoutId = setTimeout(loadReviews, 0);
    return () => clearTimeout(timeoutId);
  }, []);

  const startEdit = (review) => {
    setEditingId(review._id);
    setEditForm({ rating: review.rating, comment: review.comment || '' });
  };

  const handleSave = async (id) => {
    try {
      await reviewService.update(id, { rating: Number(editForm.rating), comment: editForm.comment });
      setEditingId(null);
      loadReviews();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await reviewService.remove(id);
      loadReviews();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-zinc-900">Reviews</h1>
      {error && <p className="text-sm text-red-500">{error}</p>}

      {loading ? (
        <p className="text-sm text-zinc-600">Loading reviews…</p>
      ) : (
        <ul className="space-y-3">
          {reviews.map((review) => (
            <li key={review._id} className="rounded-2xl border-2 border-zinc-900 bg-white p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-zinc-900">
                  {review.product?.productName} — {review.user?.firstName} {review.user?.lastName}
                </p>
                <div className="flex gap-3 text-sm font-semibold">
                  <button onClick={() => startEdit(review)} className="text-blue-700 hover:underline">Edit</button>
                  <button onClick={() => handleDelete(review._id)} className="text-red-600 hover:underline">Delete</button>
                </div>
              </div>

              {editingId === review._id ? (
                <div className="mt-3 space-y-2">
                  <select
                    value={editForm.rating}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, rating: e.target.value }))}
                    className="rounded-lg border border-zinc-300 px-2 py-1 text-sm"
                  >
                    {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} stars</option>)}
                  </select>
                  <textarea
                    value={editForm.comment}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, comment: e.target.value }))}
                    rows={2}
                    className="w-full rounded-lg border border-zinc-300 px-2 py-1 text-sm"
                  />
                  <button onClick={() => handleSave(review._id)} className="rounded-full border-2 border-zinc-900 bg-zinc-900 px-4 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-50">
                    Save
                  </button>
                </div>
              ) : (
                <p className="mt-2 text-sm text-zinc-700">
                  {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)} {review.comment}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminReviewsPage;
