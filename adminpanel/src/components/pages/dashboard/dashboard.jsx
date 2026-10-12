import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getStats } from '../../../services/adminService';
import { getMyRestaurant } from '../../../services/restaurantService';
import { getRestaurantOrders } from '../../../services/orderService';
import { getFoodListByRestaurant } from '../../../services/foodService';
import { IconStore, IconOrders, IconAward, IconUsers, IconPlus } from '../../common/Icons';

const Dashboard = ({ user }) => {
  const [stats, setStats] = useState(null);
  const [myRestaurant, setMyRestaurant] = useState(null);
  const [restaurantOrders, setRestaurantOrders] = useState([]);
  const [foodCount, setFoodCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === 'ROLE_ADMIN';

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        if (isAdmin) {
          const data = await getStats();
          setStats(data);
        } else {
          const rest = await getMyRestaurant();
          setMyRestaurant(rest);
          if (rest?.id) {
            const orders = await getRestaurantOrders(rest.id);
            setRestaurantOrders(orders);
            const foods = await getFoodListByRestaurant(rest.id);
            setFoodCount(foods.length);
          }
        }
      } catch (err) {
        toast.error("Failed to load dashboard metrics");
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [isAdmin]);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border spinner-border-sm text-secondary" role="status"></div>
        <p className="mt-2 text-muted small">Loading metrics...</p>
      </div>
    );
  }

  if (!isAdmin && !myRestaurant) {
    return (
      <div className="container py-5 text-center">
        <div className="card border rounded-3 p-5 mx-auto" style={{ maxWidth: '480px' }}>
          <IconStore size={32} className="text-muted mx-auto mb-3" />
          <h4 className="fw-semibold text-dark">Partner Onboarding</h4>
          <p className="text-muted small mt-1">
            Register your restaurant to begin managing menus and receiving customer orders.
          </p>
          <Link to="/addrestaurant" className="btn btn-dark btn-sm fw-medium px-4 py-2 mt-3 mx-auto">
            Register Restaurant
          </Link>
        </div>
      </div>
    );
  }

  // 1. ADMIN DASHBOARD
  if (isAdmin) {
    return (
      <div className="container-fluid py-3 px-0">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h3 className="fw-bold m-0 text-dark" style={{ letterSpacing: '-0.02em' }}>Dashboard</h3>
            <p className="text-muted small m-0 mt-1">Platform overview and activity summary</p>
          </div>
          <span className="badge badge-neutral">Platform Administrator</span>
        </div>

        {/* Minimal Metrics Grid */}
        <div className="row g-3 mb-4">
          <div className="col-md-3">
            <div className="card p-3 rounded-3">
              <div className="text-muted small text-uppercase fw-semibold" style={{ fontSize: '0.7rem' }}>
                Platform Revenue
              </div>
              <div className="fs-3 fw-bold text-dark mt-1">
                ₹{stats?.totalRevenue?.toLocaleString() || 0}
              </div>
              <div className="text-muted small mt-1">Paid orders volume</div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card p-3 rounded-3">
              <div className="text-muted small text-uppercase fw-semibold" style={{ fontSize: '0.7rem' }}>
                Total Orders
              </div>
              <div className="fs-3 fw-bold text-dark mt-1">{stats?.totalOrders || 0}</div>
              <div className="text-muted small mt-1">
                {stats?.pendingOrders || 0} active • {stats?.completedOrders || 0} completed
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card p-3 rounded-3">
              <div className="text-muted small text-uppercase fw-semibold" style={{ fontSize: '0.7rem' }}>
                Active Stores
              </div>
              <div className="fs-3 fw-bold text-dark mt-1">{stats?.activeRestaurants || 0}</div>
              <div className="text-muted small mt-1">
                {stats?.totalRestaurants || 0} registered total
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card p-3 rounded-3">
              <div className="text-muted small text-uppercase fw-semibold" style={{ fontSize: '0.7rem' }}>
                Users
              </div>
              <div className="fs-3 fw-bold text-dark mt-1">{stats?.totalCustomers || 0}</div>
              <div className="text-muted small mt-1">Customers & partners</div>
            </div>
          </div>
        </div>

        {/* Minimal Breakdown Cards */}
        <div className="row g-3">
          <div className="col-md-6">
            <div className="card p-4 rounded-3 h-100">
              <h6 className="fw-semibold text-dark mb-3">Payment Summary</h6>
              <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
                <span className="text-muted small">Successful Transactions</span>
                <span className="fw-semibold text-dark">{stats?.successfulPayments || 0}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
                <span className="text-muted small">Failed / Cancelled</span>
                <span className="fw-semibold text-dark">{stats?.failedPayments || 0}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center py-2">
                <span className="text-muted small">Total Volume</span>
                <span className="fw-semibold text-dark">₹{stats?.totalRevenue?.toLocaleString() || 0}</span>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card p-4 rounded-3 h-100">
              <h6 className="fw-semibold text-dark mb-3">Subscriptions</h6>
              <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
                <span className="text-muted small">Active Subscriptions</span>
                <span className="fw-semibold text-dark">{stats?.activeSubscriptions || 0}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
                <span className="text-muted small">Expired / Inactive</span>
                <span className="fw-semibold text-dark">{stats?.expiredSubscriptions || 0}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center py-2">
                <span className="text-muted small">Available Tiers</span>
                <span className="text-muted small">BASIC • STANDARD • PREMIUM</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. PARTNER DASHBOARD
  const restaurantRevenue = restaurantOrders
    .filter(o => o.paymentStatus === 'PAID')
    .reduce((acc, o) => acc + (o.totalAmount || o.amount || 0), 0);

  const pendingOrdersCount = restaurantOrders.filter(o => ['PENDING', 'CONFIRMED', 'PREPARING'].includes(o.status)).length;
  const completedOrdersCount = restaurantOrders.filter(o => o.status === 'DELIVERED').length;

  return (
    <div className="container-fluid py-3 px-0">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold m-0 text-dark" style={{ letterSpacing: '-0.02em' }}>
            {myRestaurant?.name || 'Store Dashboard'}
          </h3>
          <p className="text-muted small m-0 mt-1">Live store overview & operations</p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <span className={`badge ${myRestaurant?.open ? 'badge-success-subtle' : 'badge-neutral'}`}>
            {myRestaurant?.open ? 'Store Open' : 'Store Closed'}
          </span>
          <span className="badge badge-neutral">
            Plan: {myRestaurant?.subscriptionPlan || 'STANDARD'}
          </span>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card p-3 rounded-3">
            <div className="text-muted small text-uppercase fw-semibold" style={{ fontSize: '0.7rem' }}>
              Store Revenue
            </div>
            <div className="fs-3 fw-bold text-dark mt-1">₹{restaurantRevenue.toFixed(2)}</div>
            <div className="text-muted small mt-1">From eligible paid orders</div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card p-3 rounded-3">
            <div className="text-muted small text-uppercase fw-semibold" style={{ fontSize: '0.7rem' }}>
              Live Orders
            </div>
            <div className="fs-3 fw-bold text-dark mt-1">{restaurantOrders.length}</div>
            <div className="text-muted small mt-1">
              {pendingOrdersCount} active • {completedOrdersCount} delivered
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card p-3 rounded-3">
            <div className="text-muted small text-uppercase fw-semibold" style={{ fontSize: '0.7rem' }}>
              Menu Dishes
            </div>
            <div className="fs-3 fw-bold text-dark mt-1">{foodCount}</div>
            <div className="text-muted small mt-1">Items currently on menu</div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card p-3 rounded-3">
            <div className="text-muted small text-uppercase fw-semibold" style={{ fontSize: '0.7rem' }}>
              Subscription
            </div>
            <div className="fs-3 fw-bold text-dark mt-1">{myRestaurant?.subscriptionStatus || 'ACTIVE'}</div>
            <div className="text-muted small mt-1">{myRestaurant?.subscriptionPlan || 'STANDARD'} Tier</div>
          </div>
        </div>
      </div>

      <div className="d-flex gap-2">
        <Link to="/orders" className="btn btn-dark btn-sm">
          View Live Orders
        </Link>
        <Link to="/addfood" className="btn btn-outline-secondary btn-sm">
          Add Food Item
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
