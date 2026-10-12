import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getAllOrders, getRestaurantOrders, updateOrderStatus } from '../../../services/orderService';
import { getAllRestaurants, getMyRestaurant } from '../../../services/restaurantService';
import {
  IconClock,
  IconStore,
  IconPhone,
  IconMapPin,
  IconVeg,
  IconNonVeg,
  IconCooking,
  IconTruck,
  IconCheck,
  IconRefresh
} from '../../common/Icons';

const Orders = ({ user }) => {
  const [orders, setOrders] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState('ALL');
  const [activeTab, setActiveTab] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const isAdmin = user?.role === 'ROLE_ADMIN';

  const fetchOrders = async () => {
    setLoading(true);
    try {
      if (isAdmin) {
        const restList = await getAllRestaurants();
        setRestaurants(restList);
        const data = await getAllOrders();
        setOrders(data || []);
      } else {
        const myRest = await getMyRestaurant();
        if (myRest?.id) {
          setRestaurants([myRest]);
          setSelectedRestaurant(myRest.id);
          const data = await getRestaurantOrders(myRest.id);
          setOrders(data || []);
        } else {
          setRestaurants([]);
          setOrders([]);
        }
      }
    } catch (error) {
      toast.error("Failed to load restaurant orders.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
      toast.success(`Order status updated to: ${newStatus}`);
      setOrders(prev =>
        prev.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (error) {
      toast.error("Failed to update order status.");
    } finally {
      setUpdatingId(null);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, [isAdmin]);

  const filteredOrders = orders.filter(order => {
    const matchesRestaurant = selectedRestaurant === 'ALL' || order.restaurantId === selectedRestaurant;
    let matchesStatus = true;
    if (activeTab === 'NEW') {
      matchesStatus = ['PENDING', 'CONFIRMED'].includes(order.status);
    } else if (activeTab === 'PREPARING') {
      matchesStatus = order.status === 'PREPARING';
    } else if (activeTab === 'DELIVERING') {
      matchesStatus = ['READY_FOR_PICKUP', 'OUT_FOR_DELIVERY'].includes(order.status);
    } else if (activeTab === 'DELIVERED') {
      matchesStatus = order.status === 'DELIVERED';
    } else if (activeTab === 'CANCELLED') {
      matchesStatus = order.status === 'CANCELLED';
    }
    return matchesRestaurant && matchesStatus;
  });

  const countNew = orders.filter(o => ['PENDING', 'CONFIRMED'].includes(o.status)).length;
  const countPrep = orders.filter(o => o.status === 'PREPARING').length;
  const countDelivery = orders.filter(o => ['READY_FOR_PICKUP', 'OUT_FOR_DELIVERY'].includes(o.status)).length;
  const countDelivered = orders.filter(o => o.status === 'DELIVERED').length;

  if (!isAdmin && !loading && restaurants.length === 0) {
    return (
      <div className="container py-5 text-center">
        <div className="card border rounded-3 p-5 mx-auto" style={{ maxWidth: '480px' }}>
          <IconStore size={32} className="text-muted mx-auto mb-3" />
          <h4 className="fw-semibold text-dark">No Restaurant Onboarded</h4>
          <p className="text-muted small mt-1">Onboard your restaurant first to receive customer orders.</p>
          <Link to="/addrestaurant" className="btn btn-dark btn-sm fw-medium px-4 py-2 mt-3 mx-auto">
            Onboard Restaurant
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-3 px-0">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h3 className="fw-bold m-0 text-dark" style={{ letterSpacing: '-0.02em' }}>
            {isAdmin ? "Orders" : "Kitchen Orders"}
          </h3>
          <p className="text-muted small m-0 mt-1">
            {isAdmin
              ? "All fulfillment streams across stores"
              : "Manage live orders, preparation, and delivery handoff"}
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          {isAdmin && (
            <select
              className="form-select form-select-sm"
              value={selectedRestaurant}
              onChange={(e) => setSelectedRestaurant(e.target.value)}
              style={{ width: 'auto' }}
            >
              <option value="ALL">All Stores ({restaurants.length})</option>
              {restaurants.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          )}

          <button className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1" onClick={fetchOrders}>
            <IconRefresh size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* Minimal Segmented Stage Filter */}
      <div className="d-flex gap-2 border-bottom pb-3 mb-4 overflow-auto">
        <button
          className={`btn btn-sm ${activeTab === 'ALL' ? 'btn-dark' : 'btn-outline-secondary'}`}
          onClick={() => setActiveTab('ALL')}
        >
          All ({orders.length})
        </button>

        <button
          className={`btn btn-sm d-flex align-items-center gap-1 ${activeTab === 'NEW' ? 'btn-dark' : 'btn-outline-secondary'}`}
          onClick={() => setActiveTab('NEW')}
        >
          New {countNew > 0 && <span className="badge bg-secondary ms-1">{countNew}</span>}
        </button>

        <button
          className={`btn btn-sm d-flex align-items-center gap-1 ${activeTab === 'PREPARING' ? 'btn-dark' : 'btn-outline-secondary'}`}
          onClick={() => setActiveTab('PREPARING')}
        >
          Kitchen {countPrep > 0 && <span className="badge bg-secondary ms-1">{countPrep}</span>}
        </button>

        <button
          className={`btn btn-sm d-flex align-items-center gap-1 ${activeTab === 'DELIVERING' ? 'btn-dark' : 'btn-outline-secondary'}`}
          onClick={() => setActiveTab('DELIVERING')}
        >
          In Transit {countDelivery > 0 && <span className="badge bg-secondary ms-1">{countDelivery}</span>}
        </button>

        <button
          className={`btn btn-sm ${activeTab === 'DELIVERED' ? 'btn-dark' : 'btn-outline-secondary'}`}
          onClick={() => setActiveTab('DELIVERED')}
        >
          Delivered ({countDelivered})
        </button>
      </div>

      {loading && orders.length === 0 ? (
        <div className="text-center py-5">
          <div className="spinner-border spinner-border-sm text-secondary" role="status"></div>
          <p className="mt-2 text-muted small">Loading orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="card text-center p-5 rounded-3 bg-white">
          <p className="text-muted fw-medium m-0">No orders in this stage.</p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {filteredOrders.map((order) => {
            const isNew = ['PENDING', 'CONFIRMED'].includes(order.status);
            const isPreparing = order.status === 'PREPARING';
            const isDelivering = ['READY_FOR_PICKUP', 'OUT_FOR_DELIVERY'].includes(order.status);
            const isDelivered = order.status === 'DELIVERED';

            return (
              <div key={order.id} className="card rounded-3">
                {/* Header */}
                <div className="card-header py-3 px-4 d-flex flex-wrap justify-content-between align-items-center gap-2">
                  <div className="d-flex align-items-center gap-3">
                    <span className="fw-semibold text-dark" style={{ fontSize: '0.875rem' }}>
                      #{order.id?.substring(order.id.length - 6).toUpperCase()}
                    </span>
                    <span className="badge badge-neutral d-flex align-items-center gap-1">
                      <IconStore size={13} /> {order.restaurantName || "Store"}
                    </span>
                    <span className="text-muted d-flex align-items-center gap-1" style={{ fontSize: '0.75rem' }}>
                      <IconClock size={13} />
                      {order.createdAt ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>

                  <div className="d-flex align-items-center gap-2">
                    <span className={`badge ${order.paymentStatus === 'PAID' ? 'badge-success-subtle' : 'badge-neutral'}`}>
                      {order.paymentStatus === 'PAID' ? 'Paid' : 'Unpaid'}
                    </span>
                    <span className="badge badge-neutral">
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div className="card-body p-4">
                  <div className="row g-4">
                    {/* Items */}
                    <div className="col-lg-5">
                      <div className="text-muted small text-uppercase fw-semibold mb-2" style={{ fontSize: '0.7rem', letterSpacing: '0.05em' }}>
                        Items
                      </div>
                      <div className="border rounded-2 p-2 bg-light">
                        {order.items && order.items.map((item, idx) => (
                          <div key={idx} className="d-flex justify-content-between align-items-center py-2 px-2 border-bottom last-border-0">
                            <div className="d-flex align-items-center gap-2">
                              {item.veg !== undefined && (item.veg ? <IconVeg size={14} /> : <IconNonVeg size={14} />)}
                              <span className="text-dark fw-medium" style={{ fontSize: '0.85rem' }}>
                                {item.name || item.foodName}
                              </span>
                              <span className="text-muted small">x {item.quantity || item.qty}</span>
                            </div>
                            <span className="text-dark fw-semibold" style={{ fontSize: '0.85rem' }}>
                              ₹{item.total || (item.price * (item.quantity || 1))}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Delivery Destination */}
                    <div className="col-lg-4 border-start border-end px-lg-4">
                      <div className="text-muted small text-uppercase fw-semibold mb-2" style={{ fontSize: '0.7rem', letterSpacing: '0.05em' }}>
                        Customer
                      </div>
                      <div className="p-3 bg-light rounded-2">
                        <div className="fw-semibold text-dark" style={{ fontSize: '0.875rem' }}>
                          {order.customerName || order.address?.fullName || "Customer"}
                        </div>
                        <div className="mt-1">
                          <a
                            href={`tel:${order.customerPhone || order.address?.phone}`}
                            className="text-decoration-none text-muted small d-inline-flex align-items-center gap-1"
                          >
                            <IconPhone size={13} /> {order.customerPhone || order.address?.phone || "No phone"}
                          </a>
                        </div>
                        <div className="text-muted small mt-2 pt-2 border-top d-flex align-items-start gap-1">
                          <IconMapPin size={14} className="flex-shrink-0 mt-1" />
                          <span>
                            {order.address?.address || ""}, {order.address?.area || ""}{order.address?.city ? `, ${order.address.city}` : ""}
                            {order.address?.zip ? ` - ${order.address.zip}` : ""}
                          </span>
                        </div>
                        {order.address?.instructions && (
                          <div className="text-muted small mt-2 pt-1 fst-italic">
                            Note: "{order.address.instructions}"
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Stage Actions */}
                    <div className="col-lg-3 d-flex flex-column justify-content-between">
                      <div>
                        <div className="text-muted small text-uppercase fw-semibold mb-1" style={{ fontSize: '0.7rem', letterSpacing: '0.05em' }}>
                          Total Amount
                        </div>
                        <div className="fs-4 fw-bold text-dark">
                          ₹{(order.totalAmount || order.amount)?.toFixed(2)}
                        </div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                          {order.items ? order.items.length : 0} item(s) • Incl. tax
                        </div>
                      </div>

                      <div className="d-flex flex-column gap-2 mt-3">
                        {isNew && (
                          <button
                            className="btn btn-dark btn-sm py-2 d-flex align-items-center justify-content-center gap-2"
                            disabled={updatingId === order.id}
                            onClick={() => handleUpdateStatus(order.id, 'PREPARING')}
                          >
                            <IconCooking size={16} /> Start Preparing
                          </button>
                        )}

                        {isPreparing && (
                          <button
                            className="btn btn-dark btn-sm py-2 d-flex align-items-center justify-content-center gap-2"
                            disabled={updatingId === order.id}
                            onClick={() => handleUpdateStatus(order.id, 'OUT_FOR_DELIVERY')}
                          >
                            <IconTruck size={16} /> Dispatch Order
                          </button>
                        )}

                        {isDelivering && (
                          <button
                            className="btn btn-dark btn-sm py-2 d-flex align-items-center justify-content-center gap-2"
                            disabled={updatingId === order.id}
                            onClick={() => handleUpdateStatus(order.id, 'DELIVERED')}
                          >
                            <IconCheck size={16} /> Mark Delivered
                          </button>
                        )}

                        {isDelivered && (
                          <div className="text-muted small text-center py-1 fw-medium border rounded-2 bg-light">
                            Completed
                          </div>
                        )}

                        <div className="mt-2">
                          <select
                            className="form-select form-select-sm"
                            value={order.status}
                            disabled={updatingId === order.id}
                            onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                            style={{ fontSize: '0.75rem' }}
                          >
                            <option value="PENDING">PENDING</option>
                            <option value="CONFIRMED">CONFIRMED</option>
                            <option value="PREPARING">PREPARING</option>
                            <option value="READY_FOR_PICKUP">READY FOR PICKUP</option>
                            <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                            <option value="DELIVERED">DELIVERED</option>
                            <option value="CANCELLED">CANCELLED</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Orders;