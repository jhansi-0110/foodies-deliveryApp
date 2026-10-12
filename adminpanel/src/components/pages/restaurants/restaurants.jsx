import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getAllRestaurants, toggleOpenStatus, updateApproval, updateActive, deleteRestaurant } from '../../../services/restaurantService';
import { IconPlus, IconTrash, IconCheck, IconStar, IconStore } from '../../common/Icons';

const Restaurants = ({ user }) => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const isAdmin = user?.role === 'ROLE_ADMIN';

  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      const data = await getAllRestaurants();
      setRestaurants(data);
    } catch (err) {
      toast.error('Failed to load restaurants');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleOpen = async (rest) => {
    try {
      const newStatus = !rest.open;
      await toggleOpenStatus(rest.id, newStatus);
      toast.success(`Marked as ${newStatus ? 'OPEN' : 'CLOSED'}`);
      setRestaurants(prev => prev.map(r => r.id === rest.id ? { ...r, open: newStatus } : r));
    } catch (err) {
      toast.error('Failed to update store status');
    }
  };

  const handleToggleApproval = async (rest) => {
    try {
      const newApproval = !rest.approved;
      await updateApproval(rest.id, newApproval);
      toast.success(`Restaurant ${newApproval ? 'Approved' : 'Unapproved'}`);
      setRestaurants(prev => prev.map(r => r.id === rest.id ? { ...r, approved: newApproval } : r));
    } catch (err) {
      toast.error('Failed to update approval');
    }
  };

  const handleToggleActive = async (rest) => {
    try {
      const newActive = !rest.active;
      await updateActive(rest.id, newActive);
      toast.success(`Restaurant ${newActive ? 'Activated' : 'Suspended'}`);
      setRestaurants(prev => prev.map(r => r.id === rest.id ? { ...r, active: newActive } : r));
    } catch (err) {
      toast.error('Failed to update active status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this restaurant and its menu catalog?')) {
      return;
    }
    try {
      await deleteRestaurant(id);
      toast.success('Restaurant removed');
      setRestaurants(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      toast.error('Failed to delete restaurant');
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const filteredRestaurants = restaurants.filter(r =>
    (r.name && r.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (r.cuisine && r.cuisine.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (r.city && r.city.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="container-fluid py-3 px-0">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h3 className="fw-bold m-0 text-dark" style={{ letterSpacing: '-0.02em' }}>
            Stores
          </h3>
          <p className="text-muted small m-0 mt-1">Partner restaurant store governance and approvals</p>
        </div>
        <div className="d-flex gap-2">
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="Search stores..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '220px' }}
          />
          <Link to="/addrestaurant" className="btn btn-dark btn-sm d-flex align-items-center gap-1 text-nowrap">
            <IconPlus size={14} /> Onboard Store
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
                  <th>Store</th>
                  <th>Location</th>
                  <th>Owner</th>
                  <th>Verification</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRestaurants.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-muted small">No stores found.</td>
                  </tr>
                ) : (
                  filteredRestaurants.map((rest) => (
                    <tr key={rest.id}>
                      <td>
                        <div className="d-flex align-items-center gap-3">
                          <img
                            src={rest.imageUrl || "https://cdn-icons-png.flaticon.com/512/1046/1046784.png"}
                            alt={rest.name}
                            width={42}
                            height={42}
                            className="rounded-2 object-fit-cover border"
                          />
                          <div>
                            <div className="fw-semibold text-dark" style={{ fontSize: '0.875rem' }}>{rest.name}</div>
                            <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
                              {rest.cuisine} • Rating: {rest.rating} / 5
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="small text-dark fw-medium">{rest.city || 'Hyderabad'}</div>
                        <div className="text-muted small text-truncate" style={{ maxWidth: '180px', fontSize: '0.75rem' }}>
                          {rest.address}
                        </div>
                      </td>
                      <td>
                        <div className="small text-dark fw-medium">{rest.ownerName || 'Partner'}</div>
                        <div className="text-muted small" style={{ fontSize: '0.75rem' }}>{rest.ownerEmail}</div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-1">
                          <span className={`badge ${rest.approved ? 'badge-success-subtle' : 'badge-neutral'}`}>
                            {rest.approved ? 'Approved' : 'Pending Review'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <button
                          className={`btn btn-sm ${rest.open ? 'btn-outline-secondary' : 'btn-subtle text-muted'}`}
                          style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                          onClick={() => handleToggleOpen(rest)}
                        >
                          {rest.open ? 'Open' : 'Closed'}
                        </button>
                      </td>
                      <td className="text-end">
                        <div className="btn-group btn-group-sm">
                          <a
                            href={`http://localhost:5173/restaurant/${rest.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-outline-secondary"
                            style={{ fontSize: '0.75rem' }}
                            title="View Store on Customer App"
                          >
                            View Store ↗
                          </a>
                          {!rest.approved ? (
                            <button
                              className="btn btn-dark"
                              style={{ fontSize: '0.75rem' }}
                              onClick={() => handleToggleApproval(rest)}
                              title="Approve and notify partner"
                            >
                              Approve
                            </button>
                          ) : (
                            <button
                              className="btn btn-outline-secondary"
                              style={{ fontSize: '0.75rem' }}
                              onClick={() => handleToggleApproval(rest)}
                            >
                              Revoke
                            </button>
                          )}
                          <button
                            className="btn btn-outline-secondary"
                            style={{ fontSize: '0.75rem' }}
                            onClick={() => handleToggleActive(rest)}
                          >
                            {rest.active ? 'Suspend' : 'Activate'}
                          </button>
                          <button
                            className="btn btn-outline-secondary p-1"
                            onClick={() => handleDelete(rest.id)}
                            title="Delete Store"
                          >
                            <IconTrash size={14} />
                          </button>
                        </div>
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

export default Restaurants;
