import React, { useContext } from "react";
import { StoreContext } from "../../context/StoreContext";

function CartSummary() {

  const {
    foodList,
    quantities
  } = useContext(StoreContext);

  // Get only foods that are actually in the cart
  const cartItems = foodList.filter(
    food => quantities[food.id] > 0
  );

  // Calculate subtotal
  const subtotal = cartItems.reduce(
    (acc, food) =>
      acc + food.price * quantities[food.id],
    0
  );

  // Delivery charge
  const shipping = subtotal === 0 ? 0 : 10;

  // 10% tax
  const tax = subtotal * 0.1;

  // Final total
  const total = subtotal + shipping + tax;


  return (
    <div className="cart-summary">

      {/* Heading */}
      <div className="cart-heading">
        <h2>Your cart</h2>

        <span className="cart-count">
          {cartItems.reduce(
            (total, food) => total + quantities[food.id],
            0
          )}
        </span>
      </div>


      {/* Cart Items */}
      <div className="cart-items">

        {cartItems.length === 0 ? (

          <p>Your cart is empty.</p>

        ) : (

          cartItems.map((food) => (

            <div
              className="cart-item"
              key={food.id}
            >

              <div>

                <h4>{food.name}</h4>

                <p>
                  {food.category} × {quantities[food.id]}
                </p>

              </div>

              <span>
                ₹{(
                  food.price * quantities[food.id]
                ).toFixed(2)}
              </span>

            </div>

          ))

        )}


        {/* Order Summary */}
        {cartItems.length > 0 && (
          <>
            <div className="cart-total">
              <span>Subtotal</span>

              <strong>
                ₹{subtotal.toFixed(2)}
              </strong>
            </div>

            <div className="cart-total">
              <span>Delivery</span>

              <strong>
                ₹{shipping.toFixed(2)}
              </strong>
            </div>

            <div className="cart-total">
              <span>Tax</span>

              <strong>
                ₹{tax.toFixed(2)}
              </strong>
            </div>

            <hr />

            <div className="cart-total">
              <strong>Total</strong>

              <strong>
                ₹{total.toFixed(2)}
              </strong>
            </div>
          </>
        )}

      </div>

    </div>
  );
}

export default CartSummary;