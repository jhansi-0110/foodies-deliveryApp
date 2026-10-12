import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getFoodList, getFoodListByRestaurant, deleteFood, toggleFoodAvailability } from '../../../services/foodService';
import { getAllRestaurants, getMyRestaurant } from '../../../services/restaurantService';
import { IconVeg, IconNonVeg, IconTrash, IconStore, IconPlus } from '../../common/Icons';

const ListFood = ({ user }) => {
  const [list, setList] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === 'ROLE_ADMIN';

  const fetchRestaurantsAndFoods = async () => {
    setLoading(true);
    try {
      if (isAdmin) {
        const restList = await getAllRestaurants();
        setRestaurants(restList);
        const data = await getFoodList();
        setList(data);
      } else {
        const myRest = await getMyRestaurant();
        if (myRest?.id) {
          setRestaurants([myRest]);
          setSelectedRestaurant(myRest.id);
          const data = await getFoodListByRestaurant(myRest.id);
          setList(data);
        }
      }
    } catch (error) {
      toast.error("Error fetching food catalog data.");
    } finally {
      setLoading(false);
    }
  };

  const handleRestaurantFilter = async (restId) => {
    setSelectedRestaurant(restId);
    setLoading(true);
    try {
      if (restId === 'ALL') {
        const data = await getFoodList();
        setList(data);
      } else {
        const data = await getFoodListByRestaurant(restId);
        setList(data);
      }
    } catch (err) {
      toast.error("Failed to filter foods");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async (item) => {
    try {
      const newStatus = !item.available;
      await toggleFoodAvailability(item.id, newStatus);
      toast.success(`Marked as ${newStatus ? 'available' : 'unavailable'}`);
      setList(prev => prev.map(f => f.id === item.id ? { ...f, available: newStatus } : f));
    } catch (err) {
      toast.error("Failed to update availability");
    }
  };

  const removeFood = async (id) => {
    if (!window.confirm("Remove this dish from menu?")) return;
    try {
      const deleted = await deleteFood(id);
      if (deleted) {
        toast.success("Dish removed successfully.");
        setList(prev => prev.filter(f => f.id !== id));
      }
    } catch (error) {
      toast.error("Error removing dish.");
    }
  };

  useEffect(() => {
    fetchRestaurantsAndFoods();
  }, [isAdmin]);

  return (
    <div className="container-fluid py-3 px-0">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h3 className="fw-bold m-0 text-dark" style={{ letterSpacing: '-0.02em' }}>
            Menu Catalog
          </h3>
          <p className="text-muted small m-0 mt-1">Dishes, pricing, and stock availability</p>
        </div>

        <div className="d-flex align-items-center gap-2">
          {isAdmin && (
            <select
              className="form-select form-select-sm"
              value={selectedRestaurant}
              onChange={(e) => handleRestaurantFilter(e.target.value)}
              style={{ width: 'auto' }}
            >
              <option value="ALL">All Stores ({restaurants.length})</option>
              {restaurants.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          )}

          <Link to="/addfood" className="btn btn-dark btn-sm d-flex align-items-center gap-1">
            <IconPlus size={14} /> Add Dish
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border spinner-border-sm text-secondary" role="status"></div>
        </div>
      ) : (
        <div className="card border rounded-3 overflow-hidden">
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead>
                <tr>
                  <th>Dish</th>
                  <th>Store</th>
                  <th>Category</th>
                  <th>Diet</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {list.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-muted small">
                      No menu dishes found.
                    </td>
                  </tr>
                ) : (
                  list.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="d-flex align-items-center gap-3">
                          <img
                            src={item.imageUrl || "https://cdn-icons-png.flaticon.com/512/1046/1046784.png"}
                            alt={item.name}
                            width={42}
                            height={42}
                            className="rounded-2 object-fit-cover border"
                          />
                          <div>
                            <div className="fw-semibold text-dark" style={{ fontSize: '0.875rem' }}>{item.name}</div>
                            <div className="text-muted small text-truncate" style={{ maxWidth: '240px', fontSize: '0.75rem' }}>
                              {item.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-neutral">
                          {item.restaurantName || "General"}
                        </span>
                      </td>
                      <td className="small text-muted">{item.category}</td>
                      <td>
                        {item.veg ? <IconVeg size={15} /> : <IconNonVeg size={15} />}
                      </td>
                      <td className="fw-semibold text-dark" style={{ fontSize: '0.875rem' }}>
                        ₹{item.price}
                      </td>
                      <td>
                        <button
                          className={`btn btn-sm ${item.available ? 'btn-outline-secondary' : 'btn-subtle text-muted'}`}
                          style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                          onClick={() => handleToggleAvailability(item)}
                        >
                          {item.available ? 'In Stock' : 'Out of Stock'}
                        </button>
                      </td>
                      <td className="text-end">
                        <button
                          className="btn btn-sm btn-outline-secondary p-1"
                          onClick={() => removeFood(item.id)}
                          title="Remove dish"
                        >
                          <IconTrash size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListFood;