import React, { useContext } from 'react';
import './Cart.css';
import { StoreContext } from '../../context/StoreContext';
import { Link, useNavigate } from 'react-router-dom';
import { IconTrash, IconShoppingBag } from '../../components/common/Icons';

const Cart = () => {
  const navigate = useNavigate();
  const { foodList, increaseQty, decreaseQty, quantities, removeFromCart, cartRestaurant } = useContext(StoreContext);

  const cartItems = foodList.filter(food => quantities[food.id] > 0);

  const subtotal = cartItems.reduce((acc, food) => acc + food.price * quantities[food.id], 0);
  const shipping = subtotal === 0 ? 0.0 : 10;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">Shopping Bag</h3>
          {cartRestaurant && (
            <p className="text-muted small mb-0">Ordering from: <strong>{cartRestaurant.name}</strong></p>
          )}
        </div>
        <span className="badge badge-neutral px-3 py-1.5 rounded-pill">
          {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
        </span>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          {cartItems.length === 0 ? (
            <div className="card border rounded-3 p-5 text-center">
              <div className="text-muted mb-3">
                <IconShoppingBag size={36} className="text-secondary" />
              </div>
              <h5 className="fw-semibold text-dark">Your bag is empty</h5>
              <p className="text-muted small mb-4">Explore our restaurants and add delicious dishes to your order.</p>
              <div>
                <Link to="/" className="btn btn-dark px-4">
                  Browse Restaurants
                </Link>
              </div>
            </div>
          ) : (
            <div className="card border rounded-3 overflow-hidden mb-4">
              <div className="card-body p-0">
                {cartItems.map((food, idx) => (
                  <div
                    key={food.id}
                    className={`d-flex align-items-center p-3 gap-3 ${idx !== 0 ? 'border-top' : ''}`}
                  >
                    <img
                      src={food.imageUrl || "https://cdn-icons-png.flaticon.com/512/1046/1046784.png"}
                      alt={food.name}
                      className="rounded-2 object-fit-cover flex-shrink-0"
                      width={70}
                      height={70}
                    />

                    <div className="flex-grow-1 min-w-0">
                      <h6 className="fw-bold text-dark mb-1 text-truncate">{food.name}</h6>
                      <span className="badge badge-neutral small">{food.category}</span>
                    </div>

                    <div className="d-flex align-items-center border rounded-pill bg-light px-1 flex-shrink-0">
                      <button
                        className="btn btn-sm btn-link text-dark p-1 text-decoration-none"
                        onClick={() => decreaseQty(food.id)}
                      >
                        -
                      </button>
                      <span className="fw-semibold px-2 small">{quantities[food.id]}</span>
                      <button
                        className="btn btn-sm btn-link text-dark p-1 text-decoration-none"
                        onClick={() => increaseQty(food.id)}
                      >
                        +
                      </button>
                    </div>

                    <div className="text-end flex-shrink-0" style={{ width: '80px' }}>
                      <span className="fw-bold text-dark d-block">
                        ₹{(food.price * quantities[food.id]).toFixed(2)}
                      </span>
                    </div>

                    <button
                      className="btn btn-sm btn-link text-muted p-1 flex-shrink-0"
                      onClick={() => removeFromCart(food.id)}
                      title="Remove item"
                    >
                      <IconTrash size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {cartItems.length > 0 && (
            <div className="text-start mb-4">
              <Link to="/" className="btn btn-outline-secondary btn-sm">
                ← Continue Shopping
              </Link>
            </div>
          )}
        </div>

        <div className="col-lg-4">
          <div className="card border rounded-3">
            <div className="card-body p-4">
              <h5 className="fw-bold text-dark mb-3">Order Summary</h5>

              <div className="d-flex justify-content-between mb-2 small text-muted">
                <span>Subtotal</span>
                <span className="text-dark fw-medium">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2 small text-muted">
                <span>Delivery Fee</span>
                <span className="text-dark fw-medium">₹{shipping.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-3 small text-muted">
                <span>GST (10%)</span>
                <span className="text-dark fw-medium">₹{tax.toFixed(2)}</span>
              </div>

              <div className="d-flex justify-content-between pt-3 border-top mb-4">
                <span className="fw-bold text-dark">Total</span>
                <span className="fw-bold text-dark fs-5">₹{total.toFixed(2)}</span>
              </div>

              <button
                className="btn btn-dark w-100 py-2.5 fw-semibold"
                disabled={cartItems.length === 0}
                onClick={() => navigate("/order")}
              >
                Proceed to Checkout →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;