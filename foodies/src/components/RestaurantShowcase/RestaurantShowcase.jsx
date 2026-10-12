import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchRestaurants } from '../service/RestaurantService';
import { IconStar, IconTruck } from '../common/Icons';

const RestaurantShowcase = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCuisine, setFilterCuisine] = useState('ALL');

  useEffect(() => {
    const loadRestaurants = async () => {
      try {
        setLoading(true);
        const data = await fetchRestaurants();
        setRestaurants(data || []);
      } catch (err) {
        console.error('Failed to load restaurants:', err);
      } finally {
        setLoading(false);
      }
    };
    loadRestaurants();
  }, []);

  if (loading) {
    return (
      <div className="py-4 text-center">
        <div className="spinner-border text-dark spinner-border-sm" role="status"></div>
        <p className="mt-2 text-muted small">Loading restaurants...</p>
      </div>
    );
  }

  if (restaurants.length === 0) {
    return null;
  }

  const cuisines = ['ALL', ...new Set(restaurants.map(r => r.cuisine).filter(Boolean))];

  const filtered = filterCuisine === 'ALL'
    ? restaurants
    : restaurants.filter(r => r.cuisine === filterCuisine);

  return (
    <div className="restaurant-showcase my-5" id="restaurants">
      <div className="d-flex justify-content-between align-items-end mb-3">
        <div>
          <h3 className="fw-bold text-dark mb-1">Featured Restaurants</h3>
          <p className="text-muted small mb-0">Order directly from verified kitchens & restaurants</p>
        </div>
        <span className="badge badge-neutral text-dark px-3 py-1.5 rounded-pill fw-medium">
          {restaurants.length} Active
        </span>
      </div>

      {cuisines.length > 2 && (
        <div className="d-flex gap-2 overflow-auto pb-2 mb-3">
          {cuisines.map((c) => (
            <button
              key={c}
              className={`btn btn-sm rounded-pill px-3 ${filterCuisine === c ? 'btn-dark' : 'btn-outline-secondary'}`}
              onClick={() => setFilterCuisine(c)}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      <div className="row g-4">
        {filtered.map((restaurant) => (
          <div key={restaurant.id} className="col-12 col-sm-6 col-lg-4 col-xl-3">
            <Link
              to={`/restaurant/${restaurant.id}`}
              className="text-decoration-none text-dark h-100 d-block"
            >
              <div className="card h-100 border rounded-3 overflow-hidden hover-shadow">
                <div className="position-relative">
                  <img
                    src={restaurant.imageUrl || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80"}
                    alt={restaurant.name}
                    className="card-img-top object-fit-cover"
                    style={{ height: '160px' }}
                  />
                  <span
                    className={`position-absolute top-0 end-0 m-2 badge ${
                      restaurant.open ? 'badge-success-subtle' : 'badge-neutral'
                    }`}
                  >
                    {restaurant.open ? 'Open Now' : 'Closed'}
                  </span>
                  <div className="position-absolute bottom-0 start-0 m-2 badge bg-dark text-white d-flex align-items-center gap-1">
                    <IconStar size={11} className="text-warning" />
                    <span>{restaurant.rating || 4.2}</span>
                  </div>
                </div>

                <div className="card-body p-3 d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-1">
                    <h6 className="fw-bold text-dark text-truncate mb-0" style={{ maxWidth: '75%' }}>
                      {restaurant.name}
                    </h6>
                    <span className="small text-muted">
                      {restaurant.deliveryTimeMinutes || 30}m
                    </span>
                  </div>

                  <p className="small text-muted text-truncate mb-2">
                    {restaurant.cuisine || "Multi-Cuisine"} • {restaurant.city || "Bengaluru"}
                  </p>

                  <div className="d-flex justify-content-between align-items-center mt-auto pt-2 border-top text-secondary small">
                    <span className="d-flex align-items-center gap-1">
                      <IconTruck size={13} className="text-muted" />
                      ₹{restaurant.deliveryFee || 25}
                    </span>
                    <span className="btn btn-outline-dark btn-sm rounded-pill px-2.5 py-1 fw-medium" style={{ fontSize: '0.75rem' }}>View Restaurant →</span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
      <hr className="mt-5 border-subtle" />
    </div>
  );
};

export default RestaurantShowcase;
