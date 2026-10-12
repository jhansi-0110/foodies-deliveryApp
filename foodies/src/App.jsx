import React from 'react'
import MenuBar from './components/MenuBar/MenuBar'
import ExploreFood from './pages/ExplorerFood/ExploreFood'
import ContactUs from './pages/ContactUs/ContactUs'
import Home from './pages/Home/Home'
import FoodDetails from './pages/FoodDetails/FoodDetails'
import PlaceOrder from './pages/PlaceOrder/PlaceOrder'
import Cart from './pages/Cart/Cart'
import Register from './components/Register/Register'
import Login from './components/Login/Login'
import MyOrders from './pages/MyOrders/MyOrders'
import RestaurantDetails from './pages/RestaurantDetails/RestaurantDetails'
import PartnerPortal from './pages/PartnerPortal/PartnerPortal'
import ForgotPassword from './pages/ForgotPassword/ForgotPassword'
import { Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const App = () => {
  return (
    <div>
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
      <MenuBar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<ExploreFood />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/restaurant/:id" element={<RestaurantDetails />} />
        <Route path="/food/:id" element={<FoodDetails />} />
        <Route path="/partner" element={<PartnerPortal />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/order" element={<PlaceOrder />} />
        <Route path="/myorders" element={<MyOrders />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ForgotPassword />} />
      </Routes>
    </div>
  )
}

export default App;
