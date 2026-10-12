import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { assets } from '../../../assets/assets';
import { toast } from 'react-toastify';
import { addFood } from '../../../services/foodService';
import { getAllRestaurants, getMyRestaurant } from '../../../services/restaurantService';
import { IconStore, IconUpload, IconVeg, IconNonVeg } from '../../common/Icons';

const AddFood = ({ user }) => {
  const [image, setImage] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [myRestaurant, setMyRestaurant] = useState(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    restaurantId: '',
    name: '',
    description: '',
    price: '',
    category: 'Biryani',
    veg: false,
    available: true
  });

  const isAdmin = user?.role === 'ROLE_ADMIN';

  useEffect(() => {
    const loadRestaurants = async () => {
      try {
        if (isAdmin) {
          const list = await getAllRestaurants();
          setRestaurants(list);
          if (list.length > 0) {
            setData(prev => ({ ...prev, restaurantId: list[0].id }));
          }
        } else {
          const myRest = await getMyRestaurant();
          setMyRestaurant(myRest);
          if (myRest?.id) {
            setRestaurants([myRest]);
            setData(prev => ({ ...prev, restaurantId: myRest.id }));
          }
        }
      } catch (err) {
        console.error("Failed to load restaurants list:", err);
      }
    };
    loadRestaurants();
  }, [isAdmin]);

  const onChangeHandler = (event) => {
    const { name, value, type, checked } = event.target;
    setData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    if (!image) {
      toast.warning("Please upload a food image.");
      return;
    }

    if (!data.restaurantId) {
      toast.warning("Please select a target restaurant.");
      return;
    }

    setLoading(true);
    const result = await addFood(data, image);

    if (result.success) {
      toast.success("Dish added successfully.");
      setData(prev => ({
        ...prev,
        name: "",
        description: "",
        price: "",
        category: "Biryani",
        veg: false
      }));
      setImage(null);
    } else {
      toast.error(result.message);
    }
    setLoading(false);
  };

  if (!isAdmin && !myRestaurant) {
    return (
      <div className="container py-5 text-center">
        <div className="card border rounded-3 p-5 mx-auto" style={{ maxWidth: '480px' }}>
          <IconStore size={32} className="text-muted mx-auto mb-3" />
          <h4 className="fw-semibold text-dark">No Restaurant Onboarded</h4>
          <p className="text-muted small mt-1">Please register your restaurant before adding dishes.</p>
          <Link to="/addrestaurant" className="btn btn-dark btn-sm fw-medium px-4 py-2 mt-3 mx-auto">
            Onboard Restaurant
          </Link>
        </div>
      </div>
    );
  }

  if (!isAdmin && myRestaurant && !myRestaurant.approved) {
    return (
      <div className="container py-5 text-center">
        <div className="card border rounded-3 p-5 mx-auto" style={{ maxWidth: '520px' }}>
          <span className="badge badge-neutral mx-auto mb-3">Pending Verification</span>
          <h4 className="fw-semibold text-dark">{myRestaurant.name}</h4>
          <p className="text-muted small mt-2">
            Your restaurant application is currently awaiting administrator verification.
            Once approved, this form will be unlocked so you can publish your dishes.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-3">
      <div className="row justify-content-center">
        <div className="col-lg-6 col-md-8">
          <div className="card border rounded-3 p-4">
            <h4 className="fw-bold mb-1 text-dark" style={{ letterSpacing: '-0.02em' }}>
              Add Menu Dish
            </h4>
            <p className="text-muted small mb-4">Add a new item with pricing and dietary details</p>

            <form onSubmit={onSubmitHandler}>
              {/* Image Upload Area */}
              <div className="mb-4 text-center">
                <label htmlFor="foodImage" style={{ cursor: 'pointer' }} className="d-block">
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
                        <span className="text-muted" style={{ fontSize: '0.75rem' }}>Upload Photo</span>
                      </>
                    )}
                  </div>
                </label>
                <input
                  type="file"
                  id="foodImage"
                  hidden
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files[0])}
                />
              </div>

              {/* Target Restaurant */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted text-uppercase" style={{ fontSize: '0.7rem' }}>
                  Target Store
                </label>
                {isAdmin ? (
                  <select
                    className="form-select"
                    id="restaurantId"
                    name="restaurantId"
                    value={data.restaurantId}
                    onChange={onChangeHandler}
                    required
                  >
                    {restaurants.length === 0 ? (
                      <option value="">No restaurants registered</option>
                    ) : (
                      restaurants.map(r => (
                        <option key={r.id} value={r.id}>
                          {r.name} ({r.city})
                        </option>
                      ))
                    )}
                  </select>
                ) : (
                  <div className="p-2 px-3 bg-light rounded-2 border d-flex justify-content-between align-items-center">
                    <span className="fw-semibold text-dark" style={{ fontSize: '0.85rem' }}>{myRestaurant?.name}</span>
                    <span className="badge badge-neutral">Your Store</span>
                  </div>
                )}
              </div>

              {/* Name */}
              <div className="mb-3">
                <label htmlFor="name" className="form-label small fw-semibold text-muted text-uppercase" style={{ fontSize: '0.7rem' }}>
                  Dish Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Special Chicken Dum Biryani"
                  className="form-control"
                  id="name"
                  required
                  name="name"
                  onChange={onChangeHandler}
                  value={data.name}
                />
              </div>

              {/* Description */}
              <div className="mb-3">
                <label htmlFor="description" className="form-label small fw-semibold text-muted text-uppercase" style={{ fontSize: '0.7rem' }}>
                  Description
                </label>
                <textarea
                  className="form-control"
                  placeholder="Aromatic basmati rice cooked with authentic spices..."
                  id="description"
                  rows="2"
                  required
                  name="description"
                  onChange={onChangeHandler}
                  value={data.description}
                ></textarea>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label htmlFor="category" className="form-label small fw-semibold text-muted text-uppercase" style={{ fontSize: '0.7rem' }}>
                    Category
                  </label>
                  <select
                    className="form-select"
                    id="category"
                    name="category"
                    required
                    onChange={onChangeHandler}
                    value={data.category}
                  >
                    <option value="Biryani">Biryani</option>
                    <option value="Pizza">Pizza</option>
                    <option value="Burger">Burger</option>
                    <option value="Rolls">Rolls</option>
                    <option value="Pasta">Pasta</option>
                    <option value="Salad">Salad</option>
                    <option value="Cake">Cake</option>
                    <option value="Ice Creames">Ice Creames</option>
                    <option value="Drinks">Drinks</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label htmlFor="price" className="form-label small fw-semibold text-muted text-uppercase" style={{ fontSize: '0.7rem' }}>
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    placeholder="299"
                    className="form-control"
                    id="price"
                    required
                    name="price"
                    onChange={onChangeHandler}
                    value={data.price}
                  />
                </div>
              </div>

              {/* Dietary Option */}
              <div className="mb-4 p-2 px-3 border rounded-2 d-flex align-items-center justify-content-between bg-light">
                <div className="d-flex align-items-center gap-2">
                  {data.veg ? <IconVeg size={16} /> : <IconNonVeg size={16} />}
                  <span className="small fw-semibold text-dark">
                    {data.veg ? 'Vegetarian' : 'Non-Vegetarian'}
                  </span>
                </div>
                <div className="form-check form-switch m-0">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="vegSwitch"
                    name="veg"
                    checked={data.veg}
                    onChange={onChangeHandler}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-dark w-100 py-2 fw-medium"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Dish'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddFood;