import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getAllReviews, getRestaurantReviews } from '../../../services/reviewService';
import { getMyRestaurant } from '../../../services/restaurantService';
import { IconStar, IconRefresh, IconUser } from '../../common/Icons';

const Reviews = ({ user }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRating, setFilterRating] = useState('ALL');

  const isAdmin = user?.role === 'ROLE_ADMIN';

  const loadReviews = async () => {
    setLoading(true);
    try {
      if (isAdmin) {
        const list = await getAllReviews();
        setReviews(list || []);
      } else {
        const myRest = await getMyRestaurant();
        if (myRest?.id) {
          const list = await getRestaurantReviews(myRest.id);
          setReviews(list || []);
        }
      }
    } catch (err) {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [isAdmin]);

  const filtered = filterRating === 'ALL'
    ? reviews
    : reviews.filter(r => r.rating === Number(filterRating));

  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : '5.0';

  return (
    <div className="container-fluid py-3 px-0">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h3 className="fw-bold m-0 text-dark" style={{ letterSpacing: '-0.02em' }}>
            Customer Feedback
          </h3>
          <p className="text-muted small m-0 mt-1">Dish reviews and ratings from customer orders</p>
        </div>

        <div className="d-flex align-items-center gap-3">
          <div className="badge badge-neutral d-flex align-items-center gap-1 px-3 py-2">
            <IconStar size={14} className="text-dark" />
            <span className="fw-semibold text-dark">{averageRating} / 5</span>
            <span className="text-muted">({reviews.length} reviews)</span>
          </div>
          <button className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1" onClick={loadReviews}>
            <IconRefresh size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* Filter by star rating */}
      <div className="d-flex gap-2 mb-4 overflow-auto">
        {['ALL', '5', '4', '3', '2', '1'].map((st) => (
          <button
            key={st}
            className={`btn btn-sm ${filterRating === st ? 'btn-dark' : 'btn-outline-secondary'}`}
            onClick={() => setFilterRating(st)}
          >
            {st === 'ALL' ? 'All Reviews' : `${st} Stars`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border spinner-border-sm text-secondary" role="status"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card border rounded-3 p-5 text-center bg-white">
          <p className="text-muted small m-0">No reviews recorded in this view.</p>
        </div>
      ) : (
        <div className="row g-3">
          {filtered.map((rev) => (
            <div key={rev.id} className="col-md-6 col-lg-4">
              <div className="card rounded-3 p-4 h-100 d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <div className="fw-semibold text-dark" style={{ fontSize: '0.875rem' }}>{rev.foodName}</div>
                      <span className="text-muted" style={{ fontSize: '0.75rem' }}>{rev.restaurantName || 'Platform'}</span>
                    </div>
                    <div className="d-flex align-items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <IconStar
                          key={i}
                          size={13}
                          filled={i < rev.rating}
                          className={i < rev.rating ? "text-dark" : "text-muted"}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-secondary small mt-3 mb-0" style={{ lineHeight: 1.5 }}>
                    "{rev.comment}"
                  </p>
                </div>

                <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top text-muted" style={{ fontSize: '0.75rem' }}>
                  <span className="d-flex align-items-center gap-1">
                    <IconUser size={13} /> {rev.userName || 'Customer'}
                  </span>
                  <span>{rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : ''}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Reviews;
