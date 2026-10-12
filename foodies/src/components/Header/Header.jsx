import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <div className="card border rounded-3 p-4 p-md-5 my-4 bg-white">
      <div className="py-2 py-md-4" style={{ maxWidth: '640px' }}>
        <span className="badge badge-neutral mb-3 px-3 py-1.5 rounded-pill fw-medium">
          Verified Restaurants & Fresh Delivery
        </span>
        <h1 className="display-6 fw-bold text-dark tracking-tight mb-3">
          Order meals from your favorite kitchens.
        </h1>
        <p className="text-muted mb-4 lead" style={{ fontSize: '1.05rem', lineHeight: '1.6' }}>
          Discover top rated dishes, authentic flavors, and real-time delivery tracking across town.
        </p>
        <div className="d-flex gap-2">
          <Link to="/explore" className="btn btn-dark px-4 py-2 fw-medium">
            Explore Dishes
          </Link>
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById('restaurants');
              if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
              } else {
                window.location.href = '/#restaurants';
              }
            }}
            className="btn btn-outline-secondary px-4 py-2 fw-medium"
          >
            View Restaurants
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;