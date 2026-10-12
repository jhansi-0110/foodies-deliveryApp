import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { createRestaurant, getMyRestaurant } from '../../../services/restaurantService';
import { IconStore, IconUpload } from '../../common/Icons';

const AddRestaurant = ({ user }) => {
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [existingStore, setExistingStore] = useState(null);
  const [checkingStore, setCheckingStore] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    cuisine: 'Biryani & North Indian',
    address: '',
    city: 'Hyderabad',
    postalCode: '500001',
    phone: '',
    email: '',
    deliveryTimeMinutes: 30,
    deliveryFee: 25.0,
    minimumOrder: 99.0,
    open: true
  });

  const isAdmin = user?.role === 'ROLE_ADMIN';

  useEffect(() => {
    const checkStore = async () => {
      if (!isAdmin) {
        try {
          const myRest = await getMyRestaurant();
          if (myRest?.id) {
            setExistingStore(myRest);
          }
        } catch (err) {
          console.error("Error checking existing store:", err);
        }
      }
      setCheckingStore(false);
    };
    checkStore();
  }, [isAdmin]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast.warning('Restaurant name is required');
      return;
    }

    setLoading(true);
    try {
      await createRestaurant(formData, image);
      if (isAdmin) {
        toast.success('Restaurant onboarded successfully');
        navigate('/restaurants');
      } else {
        toast.success('Restaurant application submitted');
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to onboard restaurant');
    } finally {
      setLoading(false);
    }
  };

  if (checkingStore) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border spinner-border-sm text-secondary" role="status"></div>
      </div>
    );
  }

  if (!isAdmin && existingStore) {
    return (
      <div className="container py-5 text-center">
        <div className="card border rounded-3 p-5 mx-auto" style={{ maxWidth: '480px' }}>
          <IconStore size={32} className="text-muted mx-auto mb-3" />
          <h4 className="fw-semibold text-dark">{existingStore.name}</h4>
          <span className={`badge mx-auto my-2 ${existingStore.approved ? 'badge-success-subtle' : 'badge-neutral'}`}>
            {existingStore.approved ? 'Store Approved' : 'Pending Verification'}
          </span>
          <p className="text-muted small mt-2">
            Your restaurant is registered. You can manage your dishes, track incoming orders, and view metrics directly from the partner console.
          </p>
          <div className="d-flex justify-content-center gap-2 mt-3">
            <Link to="/dashboard" className="btn btn-dark btn-sm px-4 py-2">
              Dashboard
            </Link>
            {existingStore.approved && (
              <Link to="/addfood" className="btn btn-outline-secondary btn-sm px-4 py-2">
                Add Menu Dish
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-3">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card border rounded-3 p-4">
            <h4 className="fw-bold mb-1 text-dark" style={{ letterSpacing: '-0.02em' }}>
              Onboard Restaurant
            </h4>
            <p className="text-muted small mb-4">Register store details for platform review and customer discovery</p>

            <form onSubmit={handleSubmit}>
              {/* Photo */}
              <div className="mb-4 text-center">
                <label htmlFor="restImage" style={{ cursor: 'pointer' }} className="d-block">
                  <div
                    className="border border-dashed rounded-3 p-3 mx-auto d-flex flex-column align-items-center justify-content-center bg-light"
                    style={{ width: '130px', height: '130px' }}
                  >
                    {image ? (
                      <img
                        src={URL.createObjectURL(image)}
                        alt="Preview"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        className="rounded-2"
                      />
                    ) : (
                      <>
                        <IconUpload size={24} className="text-muted mb-2" />
                        <span className="text-muted" style={{ fontSize: '0.75rem' }}>Storefront Logo</span>
                      </>
                    )}
                  </div>
                </label>
                <input
                  type="file"
                  id="restImage"
                  hidden
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files[0])}
                />
              </div>

              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-muted text-uppercase" style={{ fontSize: '0.7rem' }}>
                    Restaurant Name *
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    placeholder="e.g. Bawarchi Grand"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-muted text-uppercase" style={{ fontSize: '0.7rem' }}>
                    Cuisine *
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="cuisine"
                    placeholder="e.g. Hyderabadi Biryani, Mughlai"
                    value={formData.cuisine}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-12">
                  <label className="form-label small fw-semibold text-muted text-uppercase" style={{ fontSize: '0.7rem' }}>
                    Description
                  </label>
                  <textarea
                    className="form-control"
                    name="description"
                    rows="2"
                    placeholder="Brief description of specialties and kitchen heritage..."
                    value={formData.description}
                    onChange={handleChange}
                  ></textarea>
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-muted text-uppercase" style={{ fontSize: '0.7rem' }}>
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    className="form-control"
                    name="phone"
                    placeholder="9876543210"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-muted text-uppercase" style={{ fontSize: '0.7rem' }}>
                    Business Email
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    placeholder="store@bawarchi.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-8">
                  <label className="form-label small fw-semibold text-muted text-uppercase" style={{ fontSize: '0.7rem' }}>
                    Street Address *
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="address"
                    placeholder="Plot 45, Main Road, RTC X Roads"
                    value={formData.address}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label small fw-semibold text-muted text-uppercase" style={{ fontSize: '0.7rem' }}>
                    City *
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="city"
                    placeholder="Hyderabad"
                    value={formData.city}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label small fw-semibold text-muted text-uppercase" style={{ fontSize: '0.7rem' }}>
                    Delivery Time (min)
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    name="deliveryTimeMinutes"
                    value={formData.deliveryTimeMinutes}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label small fw-semibold text-muted text-uppercase" style={{ fontSize: '0.7rem' }}>
                    Delivery Fee (₹)
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    name="deliveryFee"
                    value={formData.deliveryFee}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label small fw-semibold text-muted text-uppercase" style={{ fontSize: '0.7rem' }}>
                    Minimum Order (₹)
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    name="minimumOrder"
                    value={formData.minimumOrder}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="mt-4 pt-2">
                <button
                  type="submit"
                  className="btn btn-dark w-100 py-2 fw-medium"
                  disabled={loading}
                >
                  {loading ? 'Submitting...' : 'Complete Onboarding'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddRestaurant;
