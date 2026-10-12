import React, { useState, useEffect, useContext } from "react";
import { toast } from "react-toastify";
import { getUserOrdersApi } from "../../components/service/OrderService";
import { StoreContext } from "../../context/StoreContext";
import { assets } from "../../assets/assets";
import {
  IconStore,
  IconMapPin,
  IconRefresh,
  IconClock,
  IconCheck,
  IconCooking,
  IconTruck
} from "../../components/common/Icons";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useContext(StoreContext);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getUserOrdersApi();
      setOrders(data || []);
    } catch (err) {
      toast.error(err.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchOrders();
      const interval = setInterval(fetchOrders, 12000);
      return () => clearInterval(interval);
    }
  }, [token]);

  const getStepProgress = (status) => {
    const s = (status || '').toUpperCase();
    if (s === 'CANCELLED') return -1;
    if (s === 'DELIVERED') return 4;
    if (s === 'OUT_FOR_DELIVERY' || s === 'READY_FOR_PICKUP') return 3;
    if (s === 'PREPARING') return 2;
    return 1; // PENDING or CONFIRMED
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold m-0 text-dark" style={{ letterSpacing: '-0.02em' }}>My Orders</h3>
          <p className="text-muted small m-0 mt-1">Live status tracking from kitchen to doorstep</p>
        </div>
        <button className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1" onClick={fetchOrders}>
          <IconRefresh size={14} /> Refresh
        </button>
      </div>

      {loading && orders.length === 0 ? (
        <div className="text-center py-5">
          <div className="spinner-border spinner-border-sm text-secondary" role="status"></div>
          <p className="mt-2 text-muted small">Loading orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="card text-center p-5 border rounded-3 bg-white">
          <h5 className="text-dark fw-semibold">No orders placed yet</h5>
          <p className="text-muted small mb-0">Dishes you order will be tracked here in real-time.</p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {orders.map((order) => {
            const step = getStepProgress(order.status);
            const isCancelled = step === -1;

            return (
              <div key={order.id} className="card border rounded-3 p-4 bg-white shadow-none" style={{ borderColor: '#e2e8f0' }}>
                <div className="row align-items-center g-3">
                  
                  {/* Icon */}
                  <div className="col-auto">
                    <div
                      className="border rounded-2 p-2 bg-light d-flex align-items-center justify-content-center"
                      style={{ width: 44, height: 44 }}
                    >
                      <img
                        src={assets.parcel || "https://cdn-icons-png.flaticon.com/512/683/683033.png"}
                        alt="parcel"
                        width={28}
                        className="img-fluid"
                      />
                    </div>
                  </div>

                  {/* Items, Store & Address */}
                  <div className="col-md-5">
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <span className="badge bg-light text-dark border fw-medium d-inline-flex align-items-center gap-1" style={{ fontSize: '0.75rem' }}>
                        <IconStore size={13} /> {order.restaurantName || "Restaurant"}
                      </span>
                      {order.createdAt && (
                        <span className="text-muted small d-inline-flex align-items-center gap-1" style={{ fontSize: '0.75rem' }}>
                          <IconClock size={12} />
                          {new Date(order.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    <div className="fw-semibold text-dark mb-1" style={{ fontSize: '0.9rem' }}>
                      {order.items && order.items.map((item, idx) => (
                        <span key={idx}>
                          {item.name || item.foodName} × {item.quantity || item.qty}
                          {idx < order.items.length - 1 ? ", " : ""}
                        </span>
                      ))}
                    </div>
                    <div className="text-muted small d-flex align-items-center gap-1" style={{ fontSize: '0.775rem' }}>
                      <IconMapPin size={13} />
                      <span>{order.address?.address || ""}{order.address?.city ? `, ${order.address.city}` : ""}</span>
                    </div>
                  </div>

                  {/* Amount & Payment */}
                  <div className="col-md-3">
                    <div className="fw-bold text-dark fs-5">₹{(order.totalAmount || order.amount)?.toFixed(2)}</div>
                    <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
                      Payment:{" "}
                      <span className={`badge ${order.paymentStatus === 'PAID' ? 'bg-light text-dark border' : 'bg-light text-muted border'}`}>
                        {order.paymentStatus === 'PAID' ? 'Paid' : (order.paymentStatus || 'Pending')}
                      </span>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className="col-md-3 text-md-end">
                    <span className="badge bg-dark text-white px-3 py-2 fw-medium" style={{ fontSize: '0.8rem' }}>
                      {order.status}
                    </span>
                  </div>

                </div>

                {/* Sleek Minimal 4-Step Tracker */}
                {!isCancelled && (
                  <div className="mt-4 pt-3 border-top" style={{ borderColor: '#f1f5f9' }}>
                    <div className="row text-center g-2">
                      <div className="col-3">
                        <div
                          className={`p-2 rounded-2 small fw-medium d-flex align-items-center justify-content-center gap-1 ${
                            step >= 1 ? 'bg-dark text-white' : 'bg-light text-muted border'
                          }`}
                          style={{ fontSize: '0.75rem' }}
                        >
                          <IconCheck size={13} /> Confirmed
                        </div>
                      </div>
                      <div className="col-3">
                        <div
                          className={`p-2 rounded-2 small fw-medium d-flex align-items-center justify-content-center gap-1 ${
                            step >= 2 ? 'bg-dark text-white' : 'bg-light text-muted border'
                          }`}
                          style={{ fontSize: '0.75rem' }}
                        >
                          <IconCooking size={13} /> Kitchen
                        </div>
                      </div>
                      <div className="col-3">
                        <div
                          className={`p-2 rounded-2 small fw-medium d-flex align-items-center justify-content-center gap-1 ${
                            step >= 3 ? 'bg-dark text-white' : 'bg-light text-muted border'
                          }`}
                          style={{ fontSize: '0.75rem' }}
                        >
                          <IconTruck size={13} /> On the Way
                        </div>
                      </div>
                      <div className="col-3">
                        <div
                          className={`p-2 rounded-2 small fw-medium d-flex align-items-center justify-content-center gap-1 ${
                            step >= 4 ? 'bg-dark text-white' : 'bg-light text-muted border'
                          }`}
                          style={{ fontSize: '0.75rem' }}
                        >
                          <IconCheck size={13} /> Delivered
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {isCancelled && (
                  <div className="text-muted small mt-3 mb-0 py-2 text-center border rounded-2 bg-light">
                    Order cancelled.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
