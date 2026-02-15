import React, { useState, useEffect } from "react";
import { FaTrashAlt } from "react-icons/fa";
import "../style/CartPage.css";
import baseApi from "../Constants/baseApi";
import { useNavigate } from "react-router-dom";

export default function CartPage() {
  const [cart, setCart] = useState(null);
  const navigate = useNavigate();

  const fetchCart = () => {
    baseApi
      .get("cart")
      .then((res) => setCart(res.data.data))
      .catch((err) => console.error("Failed to fetch cart:", err));
  };

  useEffect(() => {
    fetchCart();
  }, []);

  if (!cart) return <div>Loading...</div>;

  const { items } = cart;
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const delivery = 15;
  const total = subtotal + delivery;

  const updateQuantity = (productId, quantity) => {
    baseApi
      .put("cart/update-quantity", { productId, quantity })
      .then(() => fetchCart())
      .catch((err) => {
        console.error("Update failed:", err);
        const message =
          err.response?.data?.message ||
          err.response?.data?.title ||
          "Unable to update quantity.";
        alert(message);
      });
  };

  const increaseQuantity = (item) => {
    const max = item.availableStock ?? Infinity;
    if (item.quantity >= max) {
      alert(
        max > 0
          ? `Only ${max} units of ${item.productName} are available.`
          : `${item.productName} is out of stock.`
      );
      return;
    }
    updateQuantity(item.productId, item.quantity + 1);
  };

  const decreaseQuantity = (item) => {
    if (item.quantity <= 1) return;
    updateQuantity(item.productId, item.quantity - 1);
  };

  const removeItem = (productId) => {
    baseApi
      .delete(`cart/${productId}`)
      .then(() => fetchCart())
      .catch((err) => console.error("Remove failed:", err));
  };

  const hasStockIssue = items.some(
    (item) =>
      (item.availableStock ?? Infinity) <= 0 ||
      item.quantity > (item.availableStock ?? Infinity)
  );

  return (
    <div className="cart-container">
      <h1 className="cart-title">Your Cart</h1>

      <div className="cart-content">
        <div className="cart-items">
          {items.map((item) => (
            <div className="cart-item" key={item.productId}>
              <img src={`http://localhost:5127${item.imageUrls[0]}`} alt={item.productName} />
              <div className="details">
                <h3>{item.productName}</h3>
                <p>Size: Free</p>
                <p>Color: Default</p>
                <span className="price">Rs {item.price.toFixed(2)}</span>
              </div>

              <div className="actions">
                <div className="qty-group">
                  <button
                    className="cart-button"
                    onClick={() => decreaseQuantity(item)}
                    disabled={item.quantity <= 1}
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    className="cart-button"
                    onClick={() => increaseQuantity(item)}
                    disabled={
                      (item.availableStock ?? Infinity) <= 0 ||
                      item.quantity >= (item.availableStock ?? Infinity)
                    }
                  >
                    +
                  </button>
                </div>
                <div className="stock-note">
                  {item.availableStock <= 0 ? (
                    <span className="out-stock">Out of stock</span>
                  ) : item.quantity >= item.availableStock ? (
                    <span className="stock-cap">
                      Max {item.availableStock} available
                    </span>
                  ) : null}
                </div>
                <FaTrashAlt
                  className="delete"
                  onClick={() => removeItem(item.productId)}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="summary">
          <h2>Order Summary</h2>
          <div className="row">
            <span>Subtotal</span>
            <span>Rs{subtotal.toFixed(2)}</span>
          </div>
          <div className="row">
            <span>Delivery Fee</span>
            <span>Rs {delivery.toFixed(2)}</span>
          </div>
          <div className="row total">
            <span>Total</span>
            <span>Rs {total.toFixed(2)}</span>
          </div>

          {hasStockIssue && (
            <p className="stock-warning">
              Please remove or adjust items that exceed current stock before checking out.
            </p>
          )}
          <button
            className="checkout-btn"
            disabled={hasStockIssue}
            onClick={() => !hasStockIssue && navigate("/checkout")}
          >
            Go to Checkout →
          </button>
        </div>
      </div>
    </div>
  );
}
