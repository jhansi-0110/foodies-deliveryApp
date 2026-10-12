import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { fetchFoodDetails } from '../../components/service/FoodService';
import { fetchFoodReviews, addReviewApi } from '../../components/service/ReviewService';
import { StoreContext } from '../../context/StoreContext';
import { IconStar, IconStore, IconVeg, IconNonVeg, IconShoppingBag } from '../../components/common/Icons';

const FoodDetails = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review Form State
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const { increaseQty, token } = useContext(StoreContext);

  const loadDetails = async () => {
    try {
      setLoading(true);
      const foodData = await fetchFoodDetails(id);
      setData(foodData);
      const reviewList = await fetchFoodReviews(id);
      setReviews(reviewList || []);
    } catch (error) {
      console.error('Error displaying details', error);
      toast.error('Failed to load dish details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetails();
  }, [id]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.warning('Please sign in to leave a review.');
      return;
    }
    if (!comment.trim()) {
      toast.warning('Please enter feedback.');
      return;
    }

    setSubmittingReview(true);
    try {
      await addReviewApi({
        foodId: id,
        rating: Number(rating),
        comment: comment.trim()
      }, token);

      toast.success('Review posted successfully');
      setComment('');
      setRating(5);
      loadDetails();
    } catch (err) {
      toast.error(err.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border spinner-border-sm text-secondary" role="status"></div>
        <p className="mt-2 text-muted small">Loading details...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container py-5 text-center">
        <h5 className="text-dark">Dish not found</h5>
        <Link to="/" className="btn btn-outline-secondary btn-sm mt-3">Back to Menu</Link>
      </div>
    );
  }

  return (
    <section className="py-4">
      <div className="container px-4 px-lg-5 my-3">
        {/* Main Product Showcase */}
        <div className="row gx-4 gx-lg-5 align-items-center mb-5">
          <div className="col-md-6 text-center">
            <img
              className="card-img-top mb-4 mb-md-0 rounded-3 border object-fit-cover"
              src={data.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80"}
              alt={data.name}
              style={{ maxHeight: '380px', width: '100%' }}
            />
          </div>

          <div className="col-md-6">
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="badge bg-light text-dark border">
                {data.category}
              </span>
              <span className="badge bg-light text-dark border d-inline-flex align-items-center gap-1">
                {data.veg ? <IconVeg size={14} /> : <IconNonVeg size={14} />}
                <span>{data.veg ? 'Vegetarian' : 'Non-Vegetarian'}</span>
              </span>
            </div>

            <h2 className="fw-bold text-dark mt-2 mb-1" style={{ letterSpacing: '-0.02em' }}>
              {data.name}
            </h2>

            {data.restaurantId ? (
              <div className="mb-2 d-flex align-items-center gap-2">
                <span className="text-muted small">Prepared by:</span>
                <Link to={`/restaurant/${data.restaurantId}`} className="btn btn-outline-dark btn-sm rounded-pill py-0.5 px-2.5 small fw-medium" style={{ fontSize: '0.8rem' }}>
                  <IconStore size={12} className="me-1" />
                  {data.restaurantName || "View Restaurant"} →
                </Link>
              </div>
            ) : (
              <div className="mb-2">
                <Link to="/#restaurants" className="btn btn-outline-secondary btn-sm rounded-pill py-0.5 px-2.5 small fw-medium" style={{ fontSize: '0.8rem' }}>
                  <IconStore size={12} className="me-1" />
                  Browse Restaurants →
                </Link>
              </div>
            )}

            <div className="d-flex align-items-center gap-3 my-3">
              <div className="fs-3 fw-bold text-dark">
                ₹{data.price}.00
              </div>
              <div className="badge bg-light text-dark border d-inline-flex align-items-center gap-1 px-3 py-2">
                <IconStar size={13} className="text-dark" />
                <span className="fw-semibold">{data.rating || 4.5}</span>
                <span className="text-muted">({reviews.length} reviews)</span>
              </div>
            </div>

            <p className="text-muted small mb-4" style={{ lineHeight: 1.6 }}>
              {data.description}
            </p>

            <button
              className="btn btn-dark px-4 py-2 d-inline-flex align-items-center gap-2"
              type="button"
              onClick={() => increaseQty(data.id, data.restaurantId, data.restaurantName)}
              disabled={!data.available}
            >
              <IconShoppingBag size={16} />
              <span>{data.available ? "Add to Cart" : "Out of Stock"}</span>
            </button>
          </div>
        </div>

        <hr style={{ borderColor: '#e2e8f0' }} className="my-5" />

        {/* Customer Reviews Section */}
        <div className="row g-4">
          {/* Review Form */}
          <div className="col-lg-5">
            <div className="card border rounded-3 p-4 bg-light shadow-none">
              <h5 className="fw-semibold text-dark mb-1">Dish Feedback</h5>
              <p className="text-muted small mb-3">
                Rate quality and taste for the kitchen team.
              </p>

              {token ? (
                <form onSubmit={handleSubmitReview}>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-muted text-uppercase" style={{ fontSize: '0.7rem' }}>
                      Rating
                    </label>
                    <div className="d-flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className={`btn btn-sm d-flex align-items-center gap-1 ${rating >= star ? 'btn-dark' : 'btn-outline-secondary'}`}
                          onClick={() => setRating(star)}
                        >
                          <IconStar size={12} filled={rating >= star} />
                          <span>{star}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-muted text-uppercase" style={{ fontSize: '0.7rem' }}>
                      Comment
                    </label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Share your taste experience..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      required
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-dark w-100 py-2 btn-sm fw-medium"
                    disabled={submittingReview}
                  >
                    {submittingReview ? "Submitting..." : "Submit Review"}
                  </button>
                </form>
              ) : (
                <div className="border rounded-2 p-3 bg-white text-center">
                  <p className="small text-muted mb-2">Sign in to leave feedback for this dish.</p>
                  <Link to="/login" className="btn btn-sm btn-outline-secondary">Sign In</Link>
                </div>
              )}
            </div>
          </div>

          {/* Existing Reviews List */}
          <div className="col-lg-7">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-semibold text-dark m-0">Reviews ({reviews.length})</h5>
              <span className="small text-muted">Average: {data.rating || 4.5} / 5</span>
            </div>

            {reviews.length === 0 ? (
              <div className="text-center py-5 border rounded-3 bg-white">
                <p className="text-muted small m-0">No reviews recorded yet.</p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {reviews.map((rev) => (
                  <div key={rev.id} className="card border rounded-3 p-3 bg-white shadow-none">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <div className="fw-medium text-dark small">{rev.userName || "Customer"}</div>
                        <div className="d-flex align-items-center gap-1 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <IconStar
                              key={i}
                              size={12}
                              filled={i < rev.rating}
                              className={i < rev.rating ? "text-dark" : "text-muted"}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                        {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : ""}
                      </span>
                    </div>
                    <p className="text-secondary small mb-0">
                      "{rev.comment}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FoodDetails;