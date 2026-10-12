import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  IconDashboard,
  IconStore,
  IconUsers,
  IconOrders,
  IconMenu,
  IconPlus,
  IconAward,
  IconStar
} from '../common/Icons';

const Sidebar = ({ sidebarOpen, user }) => {
  const location = useLocation();
  const isAdmin = user?.role === 'ROLE_ADMIN';

  const isActive = (path) => (location.pathname === path ? 'active' : '');

  return (
    <div
      className={`bg-white ${sidebarOpen ? "" : "d-none"}`}
      id="sidebar-wrapper"
    >
      <div className="sidebar-heading d-flex align-items-center gap-2">
        <div
          className="rounded d-flex align-items-center justify-content-center bg-dark text-white fw-bold"
          style={{ width: 28, height: 28, fontSize: '0.85rem' }}
        >
          F
        </div>
        <div>
          <div className="fw-bold text-dark" style={{ fontSize: '0.95rem', letterSpacing: '-0.02em' }}>
            Foodies
          </div>
          <div className="text-muted" style={{ fontSize: '0.7rem', marginTop: -2 }}>
            {isAdmin ? 'Admin Console' : 'Partner Portal'}
          </div>
        </div>
      </div>

      <div className="list-group list-group-flush pt-3">
        <Link className={`list-group-item ${isActive('/dashboard')}`} to="/dashboard">
          <IconDashboard size={17} /> Dashboard
        </Link>

        {isAdmin && (
          <>
            <Link className={`list-group-item ${isActive('/restaurants')}`} to="/restaurants">
              <IconStore size={17} /> Restaurants
            </Link>
            <Link className={`list-group-item ${isActive('/users')}`} to="/users">
              <IconUsers size={17} /> Users
            </Link>
          </>
        )}

        <Link className={`list-group-item ${isActive('/orders')}`} to="/orders">
          <IconOrders size={17} /> Orders
        </Link>

        <Link className={`list-group-item ${isActive('/listfood')}`} to="/listfood">
          <IconMenu size={17} /> Menu Catalog
        </Link>

        <Link className={`list-group-item ${isActive('/addfood')}`} to="/addfood">
          <IconPlus size={17} /> Add Dish
        </Link>

        <Link className={`list-group-item ${isActive('/subscriptions')}`} to="/subscriptions">
          <IconAward size={17} /> Subscriptions
        </Link>

        <Link className={`list-group-item ${isActive('/reviews')}`} to="/reviews">
          <IconStar size={17} /> Reviews
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;