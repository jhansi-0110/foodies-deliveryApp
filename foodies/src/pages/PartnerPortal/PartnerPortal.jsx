import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { StoreContext } from '../../context/StoreContext';
import {
  fetchMyRestaurant,
  createRestaurantApi,
  fetchSubscriptionPlans,
  createSubscriptionApi,
  verifySubscriptionApi
} from '../../components/service/RestaurantService';
import { IconStore, IconCheck, IconClock, IconUpload } from '../../components/common/Icons';

const PartnerPortal = () => {
  const { token, user } = useContext(StoreContext);
  const navigate = useNavigate();

  const [myRestaurant, setMyRestaurant] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [bannerFile, setBannerFile] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    cuisine: 'North Indian, Biryani',
    description: '',
    address: '',
    city: 'Hyderabad',
    postalCode: '500001',
    phone: user?.phone || '',
    email: user?.email || '',
    deliveryTimeMinutes: 30,
    deliveryFee: 25,
    minimumOrder: 99
  });

  const loadPortalData = async () => {
    setLoading(true);
    try {
      const planList = await fetchSubscriptionPlans();
      setPlans(planList || []);

      if (token) {
        const rest = await fetchMyRestaurant(token);
        setMyRestaurant(rest);
      }
    } catch (err) {
      console.error("Portal load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPortalData();
  }, [token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegisterRestaurant = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.warning("Please sign in or create an account first.");
      navigate("/login");
      return;
    }

    setSubmitting(true);
    try {
      const created = await createRestaurantApi(formData, bannerFile, token);
      toast.success("Restaurant registered. Submitted for administrator review.");
      setMyRestaurant(created);
    } catch (err) {
      toast.error(err.message || "Failed to register restaurant.");
    } finally {
      setSubmitting(false);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubscribe = async (plan) => {
    if (!token) {
      toast.warning("Please login first.");
      navigate("/login");
      return;
    }

    if (!myRestaurant?.id) {
      toast.warning("Please register your restaurant details before purchasing a plan.");
      return;
    }

    setSubscribing(true);
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        toast.error("Razorpay SDK failed to load.");
        setSubscribing(false);
        return;
      }

      const subRecord = await createSubscriptionApi(myRestaurant.id, plan.planId, token);

      const options = {
        key: "rzp_test_TmUGNjlxPYnWFP",
        amount: Math.round(plan.price * 100),
        currency: "INR",
        name: "Foodies Platform",
        description: `${plan.name} - ${plan.billingPeriodDays} Days`,
        order_id: subRecord.razorpayOrderId?.startsWith("order_") ? subRecord.razorpayOrderId : undefined,
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: user?.phone
        },
        theme: {
          color: "#0f172a"
        },
        handler: async function (response) {
          try {
            await verifySubscriptionApi({
              orderId: subRecord.id,
              razorpayOrderId: response.razorpay_order_id || subRecord.razorpayOrderId,
              razorpayPaymentId: response.razorpay_payment_id || "pay_mock_" + Date.now(),
              razorpaySignature: response.razorpay_signature || "sig_mock"
            }, token);
            toast.success(`Plan activated: ${plan.name}`);
            loadPortalData();
          } catch (verErr) {
            toast.error(verErr.message || "Payment verification failed.");
          }
        },
        modal: {
          ondismiss: function () {
            toast.info("Subscription checkout cancelled.");
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(err.message || "Failed to start subscription.");
    } finally {
      setSubscribing(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border spinner-border-sm text-secondary" role="status"></div>
        <p className="mt-2 text-muted small">Loading business portal...</p>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {/* Sleek Minimal Hero Header */}
      <div className="p-5 mb-5 bg-white border rounded-3 text-center" style={{ borderColor: '#e2e8f0' }}>
        <h2 className="fw-bold text-dark mb-2" style={{ letterSpacing: '-0.02em' }}>Partner with Foodies</h2>
        <p className="text-muted small mb-3" style={{ maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
          Reach hungry customers in your city, manage live kitchen orders, and grow your revenue effortlessly.
        </p>
        <div className="d-flex justify-content-center gap-2 flex-wrap">
          <span className="badge bg-light text-dark border">Fast Verification</span>
          <span className="badge bg-light text-dark border">Direct Order Stream</span>
          <span className="badge bg-light text-dark border">Automated Billing</span>
        </div>
      </div>

      {/* 4 Step Process Overview */}
      <div className="row g-3 mb-5 text-center">
        <div className="col-md-3">
          <div className="card h-100 border rounded-3 p-3 bg-white shadow-none" style={{ borderColor: '#e2e8f0' }}>
            <div className="fw-bold text-muted small mb-1">01</div>
            <div className="fw-semibold text-dark small">Register Store</div>
            <p className="text-muted small mt-1 mb-0" style={{ fontSize: '0.75rem' }}>Submit kitchen details online.</p>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card h-100 border rounded-3 p-3 bg-white shadow-none" style={{ borderColor: '#e2e8f0' }}>
            <div className="fw-bold text-muted small mb-1">02</div>
            <div className="fw-semibold text-dark small">Select Plan</div>
            <p className="text-muted small mt-1 mb-0" style={{ fontSize: '0.75rem' }}>Choose your kitchen capacity tier.</p>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card h-100 border rounded-3 p-3 bg-white shadow-none" style={{ borderColor: '#e2e8f0' }}>
            <div className="fw-bold text-muted small mb-1">03</div>
            <div className="fw-semibold text-dark small">Verification</div>
            <p className="text-muted small mt-1 mb-0" style={{ fontSize: '0.75rem' }}>Platform team reviews details.</p>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card h-100 border rounded-3 p-3 bg-white shadow-none" style={{ borderColor: '#e2e8f0' }}>
            <div className="fw-bold text-muted small mb-1">04</div>
            <div className="fw-semibold text-dark small">Live Kitchen</div>
            <p className="text-muted small mt-1 mb-0" style={{ fontSize: '0.75rem' }}>Receive orders in real-time.</p>
          </div>
        </div>
      </div>

      {/* Auth Gate if logged out */}
      {!token ? (
        <div className="card border rounded-3 p-5 text-center my-4 bg-light shadow-none" style={{ borderColor: '#e2e8f0' }}>
          <h5 className="fw-semibold text-dark mb-2">Ready to list your restaurant?</h5>
          <p className="text-muted small mb-4">Sign in or create a partner account to begin onboarding.</p>
          <div className="d-flex justify-content-center gap-2">
            <button className="btn btn-outline-secondary btn-sm px-4 py-2" onClick={() => navigate("/login")}>
              Sign In
            </button>
            <button className="btn btn-dark btn-sm px-4 py-2" onClick={() => navigate("/register")}>
              Register Partner
            </button>
          </div>
        </div>
      ) : myRestaurant ? (
        /* Status Card for Registered Store */
        <div className="card border rounded-3 p-4 mb-5 bg-white shadow-none" style={{ borderColor: '#e2e8f0' }}>
          <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
            <div>
              <h4 className="fw-bold text-dark m-0">{myRestaurant.name}</h4>
              <p className="text-muted small m-0 mt-1">{myRestaurant.cuisine} • {myRestaurant.city}</p>
            </div>
            <div>
              <span className={`badge ${myRestaurant.approved ? 'bg-light text-dark border' : 'bg-light text-muted border'}`}>
                {myRestaurant.approved ? 'Approved & Active' : 'Under Review'}
              </span>
            </div>
          </div>

          <div className="border rounded-2 p-3 bg-light">
            {myRestaurant.approved ? (
              <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
                <div>
                  <div className="fw-semibold text-dark small mb-1">Your store is verified and active.</div>
                  <p className="text-muted small m-0">
                    You can manage dishes, pricing, and live kitchen orders via the Partner Console.
                  </p>
                </div>
                <a
                  href="http://localhost:3000"
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-dark btn-sm px-3 py-2"
                >
                  Open Partner Console (Port 3000) →
                </a>
              </div>
            ) : (
              <div>
                <div className="fw-semibold text-dark small mb-1">
                  Verification in progress
                </div>
                <p className="text-muted small m-0">
                  Your restaurant registration has been submitted and is currently being verified by the Platform Administrator.
                  An official approval email will be sent to <strong>{myRestaurant.email || user.email}</strong> once verified.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Registration Form */
        <div className="card border rounded-3 p-4 p-md-5 mb-5 bg-white shadow-none" style={{ borderColor: '#e2e8f0' }}>
          <h4 className="fw-bold mb-1 text-dark" style={{ letterSpacing: '-0.02em' }}>Store Details</h4>
          <p className="text-muted small mb-4">Complete your kitchen profile for platform verification</p>

          <form onSubmit={handleRegisterRestaurant}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label small fw-semibold text-muted text-uppercase" style={{ fontSize: '0.7rem' }}>Store Name *</label>
                <input
                  type="text"
                  className="form-control"
                  name="name"
                  placeholder="e.g. Hyderabad Spice Kitchen"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-semibold text-muted text-uppercase" style={{ fontSize: '0.7rem' }}>Cuisine *</label>
                <input
                  type="text"
                  className="form-control"
                  name="cuisine"
                  placeholder="e.g. Biryani, North Indian"
                  value={formData.cuisine}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="col-12">
                <label className="form-label small fw-semibold text-muted text-uppercase" style={{ fontSize: '0.7rem' }}>Description</label>
                <textarea
                  className="form-control"
                  rows="2"
                  name="description"
                  placeholder="Signature dishes and specialties..."
                  value={formData.description}
                  onChange={handleInputChange}
                ></textarea>
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-semibold text-muted text-uppercase" style={{ fontSize: '0.7rem' }}>Street Address *</label>
                <input
                  type="text"
                  className="form-control"
                  name="address"
                  placeholder="Plot 42, Main Road"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="col-md-3">
                <label className="form-label small fw-semibold text-muted text-uppercase" style={{ fontSize: '0.7rem' }}>City *</label>
                <input
                  type="text"
                  className="form-control"
                  name="city"
                  placeholder="Hyderabad"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="col-md-3">
                <label className="form-label small fw-semibold text-muted text-uppercase" style={{ fontSize: '0.7rem' }}>PIN Code *</label>
                <input
                  type="text"
                  className="form-control"
                  name="postalCode"
                  placeholder="500081"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-semibold text-muted text-uppercase" style={{ fontSize: '0.7rem' }}>Phone *</label>
                <input
                  type="tel"
                  className="form-control"
                  name="phone"
                  placeholder="9876543210"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-semibold text-muted text-uppercase" style={{ fontSize: '0.7rem' }}>Email *</label>
                <input
                  type="email"
                  className="form-control"
                  name="email"
                  placeholder="kitchen@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="col-12">
                <label className="form-label small fw-semibold text-muted text-uppercase" style={{ fontSize: '0.7rem' }}>Storefront Photo</label>
                <input
                  type="file"
                  className="form-control"
                  accept="image/*"
                  onChange={(e) => setBannerFile(e.target.files[0])}
                />
              </div>

              <div className="col-12 mt-4">
                <button
                  type="submit"
                  className="btn btn-dark w-100 py-2 fw-medium"
                  disabled={submitting}
                >
                  {submitting ? "Submitting..." : "Submit Store for Review"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Subscription Plans */}
      <div className="my-5">
        <div className="text-center mb-4">
          <h3 className="fw-bold text-dark" style={{ letterSpacing: '-0.02em' }}>Partner Growth Plans</h3>
          <p className="text-muted small">Subscription tiers with automated Razorpay activation</p>
        </div>

        <div className="row g-4 justify-content-center">
          {plans.map((plan) => {
            const isCurrentPlan = myRestaurant?.subscriptionPlan === plan.planId && myRestaurant?.subscriptionStatus === 'ACTIVE';
            return (
              <div key={plan.planId} className="col-lg-4 col-md-6">
                <div className="card h-100 border rounded-3 p-4 bg-white shadow-none d-flex flex-column justify-content-between" style={{ borderColor: '#e2e8f0' }}>
                  <div>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h5 className="fw-bold text-dark m-0">{plan.name}</h5>
                      {plan.planId === 'STANDARD' && (
                        <span className="badge bg-light text-dark border">Popular</span>
                      )}
                    </div>
                    <p className="text-muted small">{plan.description}</p>

                    <div className="my-3">
                      <span className="fs-3 fw-bold text-dark">₹{plan.price}</span>
                      <span className="text-muted small"> / {plan.billingPeriodDays} days</span>
                    </div>

                    <hr style={{ borderColor: '#f1f5f9' }} />

                    <ul className="list-unstyled d-flex flex-column gap-2 mb-4">
                      {plan.features.map((feat, idx) => (
                        <li key={idx} className="small d-flex align-items-center gap-2 text-secondary">
                          <IconCheck size={14} className="text-dark flex-shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <button
                      className={`btn w-100 py-2 btn-sm ${
                        isCurrentPlan ? 'btn-outline-secondary disabled' : 'btn-dark'
                      }`}
                      onClick={() => handleSubscribe(plan)}
                      disabled={subscribing || isCurrentPlan}
                    >
                      {isCurrentPlan ? 'Current Plan' : `Subscribe (${plan.planId})`}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PartnerPortal;
