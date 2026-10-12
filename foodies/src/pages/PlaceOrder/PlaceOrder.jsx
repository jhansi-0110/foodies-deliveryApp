import React from "react";
import Header from "../../components/Header/Header";
import BillingForm from "../../components/BillingForm/BillingForm";
import CartSummary from "../../components/CartSummary/CartSummary";
import "./PlaceOrder.css";

function PlaceOrder() {
  return (
    <>
      <div className="container place-order-container">
        <div className="place-order-content">

          <BillingForm />

          <CartSummary />

        </div>
      </div>

    </>
  );
}

export default PlaceOrder;