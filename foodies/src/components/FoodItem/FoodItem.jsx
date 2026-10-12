import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';
import { IconStore, IconStar, IconPlus, IconMinus } from '../common/Icons';

const FoodItem = ({ name, description, id, imageURL, price, restaurantId, restaurantName }) => {
  const { increaseQty, decreaseQty, quantities } = useContext(StoreContext);
  const qty = quantities[id] || 0;

  return (
    <div className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4 d-flex justify-content-center">
      <div className="card h-100 w-100 hover-shadow border rounded-3 overflow-hidden d-flex flex-column" style={{ maxWidth: '300px' }}>
        <Link to={`/food/${id}`} className="text-decoration-none">
          <img
            src={imageURL}
            className="card-img-top object-fit-cover"
            alt={name}
            style={{ height: '180px', width: '100%' }}
          />
        </Link>

        <div className="card-body p-3 d-flex flex-column">
          <div className="d-flex justify-content-between align-items-start mb-1">
            <h6 className="card-title fw-bold text-dark mb-0 text-truncate" title={name}>
              {name}
            </h6>
          </div>

          {restaurantName && (
            <div className="d-flex align-items-center text-muted small mb-2">
              <IconStore size={12} className="me-1 text-secondary" />
              <span className="text-truncate" style={{ maxWidth: '200px' }}>{restaurantName}</span>
            </div>
          )}

          <p className="card-text text-muted small flex-grow-1 mb-3" style={{ fontSize: '0.8rem', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {description}
          </p>

          <div className="d-flex justify-content-between align-items-center pt-2 border-top mt-auto">
            <span className="fw-bold text-dark fs-6">₹{price}</span>

            {qty > 0 ? (
              <div className="d-flex align-items-center border rounded-pill bg-light px-1">
                <button
                  className="btn btn-sm btn-link text-dark p-1 text-decoration-none"
                  onClick={() => decreaseQty(id)}
                  title="Decrease"
                >
                  <IconMinus size={12} />
                </button>
                <span className="fw-semibold px-2 small">{qty}</span>
                <button
                  className="btn btn-sm btn-link text-dark p-1 text-decoration-none"
                  onClick={() => increaseQty(id, restaurantId, restaurantName)}
                  title="Increase"
                >
                  <IconPlus size={12} />
                </button>
              </div>
            ) : (
              <button
                className="btn btn-outline-secondary btn-sm rounded-pill px-3 fw-medium"
                onClick={() => increaseQty(id, restaurantId, restaurantName)}
              >
                + Add
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodItem;