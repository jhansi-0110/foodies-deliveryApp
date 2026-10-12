import React, { useState, useEffect } from 'react';
import Sidebar from './components/sidebar/sidebar';
import Menubar from './components/menubar/menubar';
import AddFood from './components/pages/addfood/addfood';
import ListFood from './components/pages/lisfood/listfood';
import Orders from './components/pages/orders/orders';
import Dashboard from './components/pages/dashboard/dashboard';
import Restaurants from './components/pages/restaurants/restaurants';
import AddRestaurant from './components/pages/addrestaurant/addrestaurant';
import Users from './components/pages/users/users';
import Subscriptions from './components/pages/subscriptions/subscriptions';
import Reviews from './components/pages/reviews/reviews';
import Login from './components/pages/login/login';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getCurrentUser, logout } from './services/authService';

const App = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(getCurrentUser());

  const handleLogout = () => {
    logout();
    setUser(null);
  };

  if (!user) {
    return (
      <>
        <ToastContainer position="top-right" autoClose={3000} theme="colored" />
        <Login onLoginSuccess={(loggedInUser) => setUser(loggedInUser)} />
      </>
    );
  }

  return (
    <div className="d-flex" id="wrapper" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <Sidebar sidebarOpen={sidebarOpen} user={user} />

      <div id="page-content-wrapper" className="flex-grow-1 d-flex flex-column">
        <Menubar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          user={user}
          onLogout={handleLogout}
        />

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnHover
          theme="colored"
        />

        <div className="container-fluid p-4 flex-grow-1">
          <Routes>
            <Route path="/dashboard" element={<Dashboard user={user} />} />
            <Route
              path="/restaurants"
              element={user.role === 'ROLE_ADMIN' ? <Restaurants user={user} /> : <Navigate to="/dashboard" replace />}
            />
            <Route path="/addrestaurant" element={<AddRestaurant user={user} />} />
            <Route
              path="/users"
              element={user.role === 'ROLE_ADMIN' ? <Users /> : <Navigate to="/dashboard" replace />}
            />
            <Route path="/addfood" element={<AddFood user={user} />} />
            <Route path="/listfood" element={<ListFood user={user} />} />
            <Route path="/orders" element={<Orders user={user} />} />
            <Route path="/subscriptions" element={<Subscriptions user={user} />} />
            <Route path="/reviews" element={<Reviews user={user} />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default App;