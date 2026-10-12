import React, { useContext, useState } from 'react';
import { assets } from '../../assets/assets';
import { Link, useNavigate } from "react-router-dom";
import { StoreContext } from '../../context/StoreContext';

const MenuBar = () => {
  const [active, setActive] = useState("home");
  const { quantities, token, user, logout } = useContext(StoreContext);
  const navigate = useNavigate();
  const uniqueItemsInCart = Object.values(quantities).filter(qty => qty > 0).length;

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom py-2" style={{ borderColor: '#e2e8f0' }}>
      <div className="container">
        <Link to="/" className="d-flex align-items-center gap-2 text-decoration-none me-4">
          <img src={assets.logo} alt="Foodies Logo" height={40} className="rounded" />
        </Link>

        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 gap-1">
            <li className="nav-item">
              <Link className={active === 'home' ? "nav-link fw-semibold text-dark active" : "nav-link text-secondary"} to="/" onClick={() => setActive('home')}>
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link className={active === 'explore' ? "nav-link fw-semibold text-dark active" : "nav-link text-secondary"} to="/explore" onClick={() => setActive('explore')}>
                Explore
              </Link>
            </li>
            <li className="nav-item">
              <Link className={active === 'contact-us' ? "nav-link fw-semibold text-dark active" : "nav-link text-secondary"} to="/contact" onClick={() => setActive('contact-us')}>
                Contact
              </Link>
            </li>
            <li className="nav-item">
              <Link className={active === 'partner' ? "nav-link fw-semibold text-dark active" : "nav-link text-secondary"} to="/partner" onClick={() => setActive('partner')}>
                For Restaurants
              </Link>
            </li>
            {token && (
              <li className="nav-item">
                <Link className={active === 'my-orders' ? "nav-link fw-semibold text-dark active" : "nav-link text-secondary"} to="/myorders" onClick={() => setActive('my-orders')}>
                  My Orders
                </Link>
              </li>
            )}
          </ul>

          <div className="d-flex align-items-center gap-3">
            <Link to={`/cart`} className="text-decoration-none">
              <div className="position-relative p-1">
                <img src={assets.cart} alt="Cart" height={28} className='position-relative'/>
                {uniqueItemsInCart > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-dark" style={{ fontSize: '0.65rem' }}>
                    {uniqueItemsInCart}
                  </span>
                )}
              </div>
            </Link>

            {token ? (
              <div className="d-flex align-items-center gap-2 border-start ps-3" style={{ borderColor: '#e2e8f0' }}>
                <span className="text-dark small fw-medium">{user?.name || "User"}</span>
                <button type="button" className="btn btn-outline-secondary btn-sm" onClick={logout} style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>
                  Logout
                </button>
              </div>
            ) : (
              <div className="d-flex align-items-center gap-2">
                <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => navigate('/login')}>
                  Sign In
                </button>
                <button type="button" className="btn btn-dark btn-sm" onClick={() => navigate('/register')}>
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default MenuBar;