import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../../components/Button.jsx';
import productService from '../../services/productService.js';
import cartService from '../../services/cartService.js';
import reviewService from '../../services/reviewService.js';
import { useAuth } from '../../context/authContext';

const resolveImageSrc = (image) => (image?.startsWith('http') ? image : `/img/${image}`);

function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cartMessage, setCartMessage] = useState('');
  const [imgError, setImgError] = useState(false);

  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewError, setReviewError] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError('');
    productService
      .getById(id)
      .then(setProduct)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const loadReviews = () => {
    setReviewsLoading(true);
    reviewService
      .getByProduct(id)
      .then(setReviews)
      .catch(() => {})
      .finally(() => setReviewsLoading(false));
  };

  useEffect(() => {
    loadReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/auth/signin', { state: { from: `/products/${id}` } });
      return;
    }
    try {
      await cartService.addItem({
        productId: product._id,
        quantity: 1,
        price: product.price,
      });
      setCartMessage('Added to cart.');
    } catch (err) {
      setCartMessage(err.message);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError('');
    if (!user) {
      navigate('/auth/signin', { state: { from: `/products/${id}` } });
      return;
    }
    setSubmittingReview(true);
    try {
      await reviewService.create({
        product: id,
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment,
      });
      setReviewForm({ rating: 5, comment: '' });
      loadReviews();
    } catch (err) {
      setReviewError(err.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="flex w-full flex-col gap-6">
        <section className="border-y-2 border-zinc-900 bg-zinc-50 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <p className="text-sm text-zinc-600">Loading product…</p>
        </section>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex w-full flex-col gap-6">
        <section className="border-y-2 border-zinc-900 bg-zinc-50 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h1 className="text-3xl font-bold text-zinc-900">Product not found</h1>
            {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
            <Button to="/products" className="mt-6">Back to Products</Button>
          </div>
        </section>
      </div>
    );
  }

  const hasImage = product.images?.[0] && !imgError;

  return (
    <div className="flex w-full flex-col gap-6">

      <section className="border-y-2 border-zinc-900 bg-blue-900 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="max-w-3xl">
          <div className="mb-4">
            <Button to="/products">Back to Products</Button>
          </div>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-yellow-500">
            {product.category?.categoryName}
          </p>
          <h1 className="text-3xl font-bold leading-tight text-zinc-50 sm:text-4xl">
            {product.productName}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-zinc-50">
            <span className="font-bold text-yellow-500">₱{product.price}</span>
            <span>{product.status === 'available' ? `${product.quantity} in stock` : product.status}</span>
          </div>
        </div>
      </section>

      <section className="border-y-2 border-zinc-900 bg-blue-900 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 flex aspect-4/3 items-center justify-center overflow-hidden rounded-[1.25rem] border-2 border-zinc-900 bg-yellow-500">
            {hasImage ? (
              <img
                src={resolveImageSrc(product.images[0])}
                alt={product.productName}
                className="w-full h-full object-contain rounded-[1.25rem]"
                onError={() => setImgError(true)}
              />
            ) : (
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-900">
                No Image Available
              </p>
            )}
          </div>

          <div className="prose prose-sm max-w-none space-y-4 text-yellow-500">
            <p className="text-base leading-7 text-yellow-500 whitespace-pre-wrap">
              {product.description}
            </p>
          </div>

          {cartMessage && <p className="mt-4 text-sm text-yellow-300">{cartMessage}</p>}

          <div className="mt-8 border-t-2 border-zinc-900 pt-6">
            <Button variant="primary" className="mr-3" onClick={handleAddToCart}>Add to Cart</Button>
            <Button to="/products">Back to Products</Button>
          </div>
        </div>
      </section>

      <section className="border-y-2 border-zinc-900 bg-zinc-100 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-semibold text-zinc-900">Reviews</h2>

          {reviewsLoading && <p className="mt-4 text-sm text-zinc-600">Loading reviews…</p>}
          {!reviewsLoading && reviews.length === 0 && (
            <p className="mt-4 text-sm text-zinc-600">No reviews yet — be the first to leave one.</p>
          )}
          {!reviewsLoading && reviews.length > 0 && (
            <ul className="mt-4 space-y-4">
              {reviews.map((review) => (
                <li key={review._id} className="rounded-2xl border-2 border-zinc-900 bg-zinc-50 p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-zinc-900">
                      {review.user?.firstName} {review.user?.lastName}
                    </p>
                    <span className="text-sm font-bold text-yellow-600">
                      {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                    </span>
                  </div>
                  {review.comment && <p className="mt-2 text-sm text-zinc-700">{review.comment}</p>}
                </li>
              ))}
            </ul>
          )}

          <form onSubmit={handleReviewSubmit} className="mt-8 rounded-2xl border-2 border-zinc-900 bg-zinc-50 p-4">
            <h3 className="font-semibold text-zinc-900">Leave a review</h3>
            {reviewError && <p className="mt-2 text-sm text-red-500">{reviewError}</p>}
            <div className="mt-3">
              <label htmlFor="review-rating" className="text-sm font-medium text-zinc-900">Rating</label>
              <select
                id="review-rating"
                value={reviewForm.rating}
                onChange={(e) => setReviewForm((prev) => ({ ...prev, rating: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-900"
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>{n} star{n > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>
            <div className="mt-3">
              <label htmlFor="review-comment" className="text-sm font-medium text-zinc-900">Comment</label>
              <textarea
                id="review-comment"
                value={reviewForm.comment}
                onChange={(e) => setReviewForm((prev) => ({ ...prev, comment: e.target.value }))}
                rows={3}
                className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-900"
                placeholder="What did you think?"
              />
            </div>
            <Button type="submit" variant="primary" className="mt-4" disabled={submittingReview}>
              {submittingReview ? 'Submitting…' : user ? 'Submit Review' : 'Log in to Review'}
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}

export default ProductPage;