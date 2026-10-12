import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { fetchRestaurantDetails } from '../../components/service/RestaurantService';
import { StoreContext } from '../../context/StoreContext';
import {
  IconStar,
  IconClock,
  IconTruck,
  IconShoppingBag,
  IconVeg,
  IconNonVeg,
  IconPlus,
  IconMinus
} from '../../components/common/Icons';

const RestaurantDetails = () => {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [vegOnly, setVegOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  const { quantities, increaseQty, decreaseQty, cartRestaurant } = useContext(StoreContext);

  useEffect(() => {
    const loadRestaurant = async () => {
      setLoading(true);
      try {
        const data = await fetchRestaurantDetails(id);
        setRestaurant(data);
      } catch (err) {
        toast.error('Failed to load restaurant details');
      } finally {
        setLoading(false);
      }
    };
    loadRestaurant();
  }, [id]);

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-dark spinner-border-sm" role="status"></div>
        <p className="mt-2 text-muted small">Loading restaurant menu...</p>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="container py-5 text-center">
        <h5>Restaurant not found</h5>
        <Link to="/" className="btn btn-dark mt-3">Back to Restaurants</Link>
      </div>
    );
  }

  const menuItems = restaurant.menu || [];
  const categories = ['ALL', ...new Set(menuItems.map(item => item.category).filter(Boolean))];

  const filteredItems = menuItems.filter(item => {
    const matchesCat = selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchesVeg = !vegOnly || item.veg;
    return matchesCat && matchesVeg;
  });

  const cartItemCount = Object.values(quantities).reduce((acc, q) => acc + q, 0);

  return (
    <div className="container py-4">
      {/* Restaurant Header Banner */}
      <div className="card border rounded-3 overflow-hidden mb-4">
        <div className="row g-0 align-items-center">
          <div className="col-md-4">
            <img
              src={restaurant.imageUrl || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80"}
              alt={restaurant.name}
              className="img-fluid w-100 object-fit-cover"
              style={{ maxHeight: '220px' }}
            />
          </div>
          <div className="col-md-8 p-4">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <h3 className="fw-bold text-dark m-0">{restaurant.name}</h3>
                <p className="text-muted small mt-1 mb-2">
                  {restaurant.cuisine} • {restaurant.address}, {restaurant.city}
                </p>
              </div>
              <span className={`badge ${restaurant.open ? 'badge-success-subtle' : 'badge-neutral'}`}>
                {restaurant.open ? 'Open' : 'Closed'}
              </span>
            </div>

            <div className="d-flex flex-wrap gap-4 mt-3 pt-3 border-top text-secondary small">
              <div className="d-flex align-items-center gap-1">
                <IconStar size={13} className="text-warning" />
                <strong>{restaurant.rating || 4.5}</strong> (100+ ratings)
              </div>
              <div className="d-flex align-items-center gap-1">
                <IconClock size={13} className="text-muted" />
                <span>{restaurant.deliveryTimeMinutes || 30} mins</span>
              </div>
              <div className="d-flex align-items-center gap-1">
                <IconTruck size={13} className="text-muted" />
                <span>Delivery: <strong>₹{restaurant.deliveryFee || 25}</strong></span>
              </div>
              <div className="d-flex align-items-center gap-1">
                <IconShoppingBag size={13} className="text-muted" />
                <span>Min Order: <strong>₹{restaurant.minimumOrder || 99}</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Filters */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div className="d-flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`btn btn-sm rounded-pill px-3 ${selectedCategory === cat ? 'btn-dark' : 'btn-outline-secondary'}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="form-check form-switch m-0 d-flex align-items-center gap-2">
          <input
            className="form-check-input mt-0"
            type="checkbox"
            id="vegFilter"
            checked={vegOnly}
            onChange={(e) => setVegOnly(e.target.checked)}
          />
          <label className="form-check-label small fw-medium text-dark d-flex align-items-center gap-1" htmlFor="vegFilter">
            <IconVeg size={14} /> Veg Only
          </label>
        </div>
      </div>

      {/* Food Items Grid */}
      <div className="row g-4 mb-5">
        {filteredItems.length === 0 ? (
          <div className="col-12 text-center py-5">
            <p className="text-muted small">No dishes found in this category.</p>
          </div>
        ) : (
          filteredItems.map((food) => {
            const qty = quantities[food.id] || 0;
            return (
              <div key={food.id} className="col-md-6 col-lg-4">
                <div className="card h-100 border rounded-3 overflow-hidden d-flex flex-column hover-shadow">
                  <div className="position-relative">
                    <img
                      src={food.imageUrl || "https://cdn-icons-png.flaticon.com/512/1046/1046784.png"}
                      alt={food.name}
                      className="card-img-top object-fit-cover"
                      style={{ height: '170px' }}
                    />
                    <span className="position-absolute top-0 start-0 m-2">
                      {food.veg ? <IconVeg size={16} /> : <IconNonVeg size={16} />}
                    </span>
                  </div>

                  <div className="card-body p-3 d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-start mb-1">
                      <h6 className="fw-bold text-dark m-0">{food.name}</h6>
                      <span className="fw-bold text-dark fs-6">₹{food.price}</span>
                    </div>

                    <p className="text-muted small flex-grow-1 mt-1 mb-3" style={{ fontSize: '0.8rem', lineHeight: '1.4' }}>
                      {food.description}
                    </p>

                    <div className="d-flex justify-content-between align-items-center mt-auto pt-2 border-top">
                      <span className="badge badge-neutral">{food.category}</span>

                      {qty === 0 ? (
                        <button
                          className="btn btn-outline-secondary btn-sm rounded-pill px-3 fw-medium"
                          onClick={() => increaseQty(food.id, restaurant.id, restaurant.name)}
                          disabled={!restaurant.open}
                        >
                          {restaurant.open ? '+ Add' : 'Closed'}
                        </button>
                      ) : (
                        <div className="d-flex align-items-center border rounded-pill bg-light px-1">
                          <button
                            className="btn btn-sm btn-link text-dark p-1 text-decoration-none"
                            onClick={() => decreaseQty(food.id)}
                            title="Decrease"
                          >
                            <IconMinus size={12} />
                          </button>
                          <span className="fw-semibold px-2 small">{qty}</span>
                          <button
                            className="btn btn-sm btn-link text-dark p-1 text-decoration-none"
                            onClick={() => increaseQty(food.id, restaurant.id, restaurant.name)}
                            title="Increase"
                          >
                            <IconPlus size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Floating Cart Indicator */}
      {cartItemCount > 0 && (
        <div className="fixed-bottom container pb-3 d-flex justify-content-center">
          <div className="card border-0 bg-dark text-white rounded-pill px-4 py-2 col-md-6 col-lg-4 d-flex flex-row justify-content-between align-items-center shadow">
            <div>
              <span className="fw-semibold small">{cartItemCount} item{cartItemCount > 1 ? 's' : ''} added</span>
              <div className="small text-light opacity-75">{cartRestaurant?.name || restaurant.name}</div>
            </div>
            <Link to="/cart" className="btn btn-light btn-sm rounded-pill fw-semibold px-3 text-dark">
              View Cart →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantDetails;
