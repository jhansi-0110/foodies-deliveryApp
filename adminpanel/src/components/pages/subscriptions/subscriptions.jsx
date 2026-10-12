import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getPlans, createSubscription, verifySubscription, getMySubscription, getAllSubscriptions } from '../../../services/subscriptionService';
import { getMyRestaurant } from '../../../services/restaurantService';
import { IconCheck, IconRefresh, IconAward } from '../../common/Icons';

const Subscriptions = ({ user }) => {
  const [plans, setPlans] = useState([]);
  const [mySubscription, setMySubscription] = useState(null);
  const [allSubscriptions, setAllSubscriptions] = useState([]);
  const [myRestaurant, setMyRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);

  const isAdmin = user?.role === 'ROLE_ADMIN';

  const loadData = async () => {
    setLoading(true);
    try {
      const planList = await getPlans();
      setPlans(planList);

      if (isAdmin) {
        const subs = await getAllSubscriptions();
        setAllSubscriptions(subs);
      } else {
        const rest = await getMyRestaurant();
        setMyRestaurant(rest);
        if (rest?.id) {
          const sub = await getMySubscription(rest.id);
          setMySubscription(sub);
        }
      }
    } catch (err) {
      toast.error('Failed to load subscription details');
    } finally {
      setLoading(false);
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
    if (!myRestaurant?.id) {
      toast.warning('Please onboard your restaurant first.');
      return;
    }

    setSubscribing(true);
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        toast.error('Razorpay SDK failed to load');
        setSubscribing(false);
        return;
      }

      const subRecord = await createSubscription(myRestaurant.id, plan.planId);

      const options = {
        key: "rzp_test_TmUGNjlxPYnWFP",
        amount: Math.round(plan.price * 100),
        currency: "INR",
        name: "Foodies Platform",
        description: `${plan.name} - ${plan.billingPeriodDays} Days`,
        order_id: subRecord.razorpayOrderId?.startsWith("order_") || subRecord.razorpayOrderId?.startsWith("sub_")
          ? subRecord.razorpayOrderId : undefined,
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
            await verifySubscription({
              orderId: subRecord.id,
              razorpayOrderId: response.razorpay_order_id || subRecord.razorpayOrderId,
              razorpayPaymentId: response.razorpay_payment_id || "pay_mock_" + Date.now(),
              razorpaySignature: response.razorpay_signature || "sig_mock"
            });
            toast.success(`Subscription activated: ${plan.name}`);
            loadData();
          } catch (verErr) {
            toast.error(verErr.message || 'Payment verification failed.');
          }
        },
        modal: {
          ondismiss: function () {
            toast.info('Checkout cancelled.');
          }
        }
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();

    } catch (err) {
      toast.error(err.message || 'Failed to initiate subscription');
    } finally {
      setSubscribing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isAdmin]);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border spinner-border-sm text-secondary" role="status"></div>
      </div>
    );
  }

  // 1. ADMIN OVERVIEW
  if (isAdmin) {
    return (
      <div className="container-fluid py-3 px-0">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h3 className="fw-bold m-0 text-dark" style={{ letterSpacing: '-0.02em' }}>Subscriptions</h3>
            <p className="text-muted small m-0 mt-1">Partner plan tiers and billing records</p>
          </div>
          <button className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1" onClick={loadData}>
            <IconRefresh size={14} /> Refresh
          </button>
        </div>

        <div className="card border rounded-3 overflow-hidden">
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead>
                <tr>
                  <th>Restaurant</th>
                  <th>Owner</th>
                  <th>Plan</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Validity</th>
                </tr>
              </thead>
              <tbody>
                {allSubscriptions.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted small">No subscriptions recorded.</td>
                  </tr>
                ) : (
                  allSubscriptions.map((sub) => (
                    <tr key={sub.id}>
                      <td className="fw-semibold text-dark" style={{ fontSize: '0.875rem' }}>{sub.restaurantName}</td>
                      <td className="small text-muted">{sub.ownerEmail}</td>
                      <td>
                        <span className="badge border fw-semibold px-2.5 py-1" style={{ backgroundColor: '#f8fafc', color: '#0f172a', borderColor: '#cbd5e1' }}>
                          {sub.planName || 'STANDARD'}
                        </span>
                      </td>
                      <td className="fw-semibold text-dark" style={{ fontSize: '0.875rem' }}>₹{sub.amount}</td>
                      <td>
                        <span className={`badge ${sub.status === 'ACTIVE' ? 'badge-success-subtle' : 'border'}`} style={sub.status !== 'ACTIVE' ? { backgroundColor: '#f8fafc', color: '#64748b', borderColor: '#e2e8f0' } : {}}>
                          {sub.status}
                        </span>
                      </td>
                      <td className="small text-muted">
                        {sub.startDate ? new Date(sub.startDate).toLocaleDateString() : ''} -{" "}
                        {sub.endDate ? new Date(sub.endDate).toLocaleDateString() : ''}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // 2. PARTNER PLANS
  return (
    <div className="container py-3">
      <div className="text-center mb-5">
        <h3 className="fw-bold text-dark" style={{ letterSpacing: '-0.02em' }}>Partner Plans</h3>
        <p className="text-muted small mt-1">Scale your kitchen with tier-based growth plans</p>
        
        {mySubscription && (
          <div className="d-inline-flex align-items-center gap-2 border px-3 py-1 rounded-2 bg-light mt-2 small">
            <span className="text-muted">Current Plan:</span>
            <strong className="text-dark">{mySubscription.planName}</strong>
            <span className="text-muted">• Valid until {mySubscription.endDate ? new Date(mySubscription.endDate).toLocaleDateString() : 'Active'}</span>
          </div>
        )}
      </div>

      <div className="row g-4 justify-content-center">
        {plans.map((plan) => {
          const isCurrentPlan = mySubscription?.planName === plan.planId && mySubscription?.status === 'ACTIVE';
          return (
            <div key={plan.planId} className="col-lg-4 col-md-6">
              <div className="card h-100 rounded-3 p-4 d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h5 className="fw-bold text-dark m-0">{plan.name}</h5>
                    {plan.planId === 'STANDARD' && (
                      <span className="badge bg-dark text-white fw-medium">Popular</span>
                    )}
                  </div>
                  <p className="text-muted small">{plan.description}</p>
                  
                  <div className="my-3">
                    <span className="fs-3 fw-bold text-dark">₹{plan.price}</span>
                    <span className="text-muted small"> / {plan.billingPeriodDays} days</span>
                  </div>

                  <hr style={{ borderColor: 'var(--border-subtle)' }} />

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
                    className={`btn w-100 py-2 ${
                      isCurrentPlan ? 'btn-outline-secondary disabled' : 'btn-dark'
                    }`}
                    onClick={() => handleSubscribe(plan)}
                    disabled={subscribing || isCurrentPlan}
                  >
                    {isCurrentPlan ? 'Current Plan' : `Subscribe to ${plan.planId}`}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Subscriptions;
