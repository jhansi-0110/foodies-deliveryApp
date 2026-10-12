import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { StoreContext } from "../../context/StoreContext";
import { createOrderApi, verifyPaymentApi } from "../service/OrderService";

function BillingForm() {
  const navigate = useNavigate();
  const { foodList, quantities, token, clearCart, cartRestaurant } = useContext(StoreContext);

  const [addressData, setAddressData] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    area: "",
    landmark: "",
    city: "",
    state: "Telangana",
    zip: "",
    instructions: ""
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setAddressData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Load Razorpay script dynamically
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCheckout = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.warning("Please login to proceed with checkout.");
      navigate("/login");
      return;
    }

    const cartItems = foodList
      .filter(food => quantities[food.id] > 0)
      .map(food => ({
        foodId: food.id,
        name: food.name,
        price: food.price,
        quantity: quantities[food.id]
      }));

    if (cartItems.length === 0) {
      toast.error("Your cart is empty!");
      return;
    }

    const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const shipping = 10;
    const tax = subtotal * 0.1;
    const totalAmount = Math.round((subtotal + shipping + tax) * 100) / 100;

    const foodWithRest = foodList.find(f => quantities[f.id] > 0 && f.restaurantId);
    const restaurantId = cartRestaurant?.id || foodWithRest?.restaurantId || "";
    const restaurantName = cartRestaurant?.name || foodWithRest?.restaurantName || "";

    setLoading(true);

    try {
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        toast.error("Failed to load Razorpay SDK. Please check your internet connection.");
        setLoading(false);
        return;
      }

      // Step 1: Create Order in Backend
      const orderResponse = await createOrderApi({
        restaurantId,
        restaurantName,
        items: cartItems,
        amount: totalAmount,
        address: addressData
      });

      // Step 2: Open Razorpay Checkout Modal
      const options = {
        key: "rzp_test_TmUGNjlxPYnWFP",
        amount: Math.round(totalAmount * 100),
        currency: "INR",
        name: "Foodies Food Delivery",
        description: "Order Checkout Payment",
        order_id: orderResponse.razorpayOrderId?.startsWith("order_") ? orderResponse.razorpayOrderId : undefined,
        prefill: {
          name: addressData.fullName,
          email: addressData.email,
          contact: addressData.phone
        },
        theme: {
          color: "#0f172a"
        },
        handler: async function (response) {
          try {
            await verifyPaymentApi({
              orderId: orderResponse.id,
              razorpayOrderId: response.razorpay_order_id || orderResponse.razorpayOrderId,
              razorpayPaymentId: response.razorpay_payment_id || "pay_mock_" + Date.now(),
              razorpaySignature: response.razorpay_signature || "sig_mock"
            });
            await clearCart();
            toast.success("Payment successful! Your order has been placed.");
            navigate("/myorders");
          } catch (verErr) {
            toast.error(verErr.message || "Payment verification failed.");
          }
        },
        modal: {
          ondismiss: function () {
            toast.info("Payment cancelled.");
          }
        }
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();

    } catch (err) {
      toast.error(err.message || "Failed to initiate payment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="container billing-form" onSubmit={handleCheckout}>
      <h2>Delivery Address</h2>
      <p className="form-subtitle">
        Enter your details so we can deliver your order to you.
      </p>

      {/* Name */}
      <div className="form-group mb-3">
        <label htmlFor="fullName" className="form-label">Full Name</label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          className="form-control"
          placeholder="Enter your full name"
          value={addressData.fullName}
          onChange={handleChange}
          required
        />
      </div>

      {/* Phone */}
      <div className="form-group mb-3">
        <label htmlFor="phone" className="form-label">Phone Number</label>
        <input
          id="phone"
          name="phone"
          type="tel"
          className="form-control"
          placeholder="Enter your phone number"
          value={addressData.phone}
          onChange={handleChange}
          required
        />
      </div>

      {/* Email */}
      <div className="form-group mb-3">
        <label htmlFor="email" className="form-label">
          Email <span>(Optional)</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          className="form-control"
          placeholder="you@example.com"
          value={addressData.email}
          onChange={handleChange}
        />
      </div>

      {/* House / Building */}
      <div className="form-group mb-3">
        <label htmlFor="address" className="form-label">
          House / Flat No. & Building Name
        </label>
        <input
          id="address"
          name="address"
          type="text"
          className="form-control"
          placeholder="e.g. Flat 204, Green Heights"
          value={addressData.address}
          onChange={handleChange}
          required
        />
      </div>

      {/* Area / Street */}
      <div className="form-group mb-3">
        <label htmlFor="area" className="form-label">Street / Area</label>
        <input
          id="area"
          name="area"
          type="text"
          className="form-control"
          placeholder="e.g. MG Road, Madhapur"
          value={addressData.area}
          onChange={handleChange}
          required
        />
      </div>

      {/* Location Row */}
      <div className="row g-2 mb-3">
        <div className="col-md-5">
          <label htmlFor="city" className="form-label">City</label>
          <input
            id="city"
            name="city"
            type="text"
            className="form-control"
            placeholder="Enter city"
            value={addressData.city}
            onChange={handleChange}
            required
          />
        </div>

        <div className="col-md-4">
          <label htmlFor="state" className="form-label">State</label>
          <select
            id="state"
            name="state"
            className="form-select"
            value={addressData.state}
            onChange={handleChange}
          >
            <option value="Andhra Pradesh">Andhra Pradesh</option>
            <option value="Telangana">Telangana</option>
            <option value="Karnataka">Karnataka</option>
            <option value="Tamil Nadu">Tamil Nadu</option>
            <option value="Maharashtra">Maharashtra</option>
            <option value="Kerala">Kerala</option>
            <option value="Delhi">Delhi</option>
          </select>
        </div>

        <div className="col-md-3">
          <label htmlFor="zip" className="form-label">PIN Code</label>
          <input
            id="zip"
            name="zip"
            type="text"
            maxLength="6"
            className="form-control"
            placeholder="500001"
            value={addressData.zip}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      {/* Delivery Instructions */}
      <div className="form-group mb-3">
        <label htmlFor="instructions" className="form-label">
          Delivery Instructions <span>(Optional)</span>
        </label>
        <textarea
          id="instructions"
          name="instructions"
          rows="2"
          className="form-control"
          placeholder="e.g. Please call when you arrive"
          value={addressData.instructions}
          onChange={handleChange}
        ></textarea>
      </div>

      <hr />

      <button
        type="submit"
        className="btn btn-dark w-100 py-2.5 fw-semibold"
        disabled={loading}
      >
        {loading ? "Processing Order..." : "Proceed to Razorpay Payment"}
      </button>
    </form>
  );
}

export default BillingForm;