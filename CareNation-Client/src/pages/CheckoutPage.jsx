import React, { useEffect, useMemo, useState } from "react";
import "../style/CheckoutPage.css";
import baseApi from "../Constants/baseApi";
import { useLocation, useNavigate } from "react-router-dom";

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState([]);
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [khaltiProcessing, setKhaltiProcessing] = useState(false);
  const [khaltiStatus, setKhaltiStatus] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const [address, setAddress] = useState({
    name: "test Test",
    details: "test, TEST, Bagmati, 44444, Nepal",
    phone: "123456789",
  });
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editAddress, setEditAddress] = useState(address);

  useEffect(() => {
    baseApi
      .get("cart")
      .then((res) => setCartItems(res.data.data.items || []))
      .catch((err) => console.error("Error fetching cart:", err));
  }, []);

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems]
  );
  const total = subtotal;

  const handlePlaceOrder = () => {
    if (paymentMethod !== "cod") {
      alert("Please use the Khalti option to complete online payments.");
      return;
    }

    baseApi
      .post("order/place")
      .then(() => {
        alert("Order placed successfully with Cash on Delivery!");
        navigate("/");
      })
      .catch((err) => {
        alert(
          err.response?.data?.message ||
            err.response?.data?.title ||
            "Failed to place COD order."
        );
      });
  };

  const handleKhaltiPayment = () => {
    setKhaltiStatus("");
    setKhaltiProcessing(true);
    baseApi
      .post("payments/khalti/initiate", {
        returnUrl: `${window.location.origin}/checkout`,
      })
      .then((res) => {
        const url = res.data?.data?.paymentUrl;
        if (!url) {
          throw new Error("Payment URL was not provided.");
        }
        window.location.href = url;
      })
      .catch((err) => {
        setKhaltiStatus(
          err.response?.data?.message ||
            err.response?.data?.title ||
            err.message ||
            "Unable to initiate Khalti payment."
        );
      })
      .finally(() => setKhaltiProcessing(false));
  };

  const verifyKhaltiPayment = (pidx) => {
    setKhaltiProcessing(true);
    setKhaltiStatus("Verifying payment...");
    baseApi
      .post("payments/khalti/verify", { pidx })
      .then((res) => {
        const payload = res.data?.data;
        const orderId = payload?.orderId;
        if (orderId) {
          const query = new URLSearchParams();
          query.set("orderId", String(orderId));
          if (payload?.amount) query.set("amount", String(payload.amount));
          if (payload?.pidx) query.set("pidx", payload.pidx);
          if (payload?.status) query.set("status", payload.status);
          if (payload?.purchaseOrderId)
            query.set("purchaseOrderId", payload.purchaseOrderId);
          navigate(`/payment-success?${query.toString()}`, { replace: true });
        } else {
          setKhaltiStatus("Payment verified, but order details were missing.");
        }
      })
      .catch((err) => {
        setKhaltiStatus(
          err.response?.data?.message ||
            err.response?.data?.title ||
            err.message ||
            "Unable to verify payment."
        );
      })
      .finally(() => {
        const url = new URL(window.location.href);
        url.searchParams.delete("pidx");
        window.history.replaceState({}, "", url);
        setKhaltiProcessing(false);
      });
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const pidx = params.get("pidx");
    if (pidx) {
      verifyKhaltiPayment(pidx);
    }
  }, [location.search]);

  const khaltiDisabled = cartItems.length === 0;

  return (
    <div className="checkout-page">
      <div className="checkout-left">
        <h1 className="title">Checkout</h1>

        <div className="section">
          <h2>Contact information</h2>
          <p className="subtext">
            We'll use this email to send you details and updates about your
            order.
          </p>
          <input
            type="email"
            placeholder="Email address"
            defaultValue="admin@hfnepal.com"
            className="input-box"
          />
        </div>

        <div className="section">
          <h2>Billing address</h2>
          <p className="subtext">
            Enter the billing address that matches your payment method.
          </p>
          <div className="address-box">
            <div>
              <strong>{address.name}</strong>
              <p>{address.details}</p>
              <p>{address.phone}</p>
            </div>
            <button
              className="edit-btn"
              onClick={() => setShowAddressModal(true)}
            >
              Edit
            </button>
          </div>
        </div>

        <div className="section">
          <h2>Payment options</h2>
          <div className="payment-box">
            <label>
              <input
                type="radio"
                name="payment"
                value="cod"
                checked={paymentMethod === "cod"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span className="payment-type">Cash on delivery</span>
            </label>
            <p className="payment-desc">Pay with cash upon delivery.</p>

            <label>
              <input
                type="radio"
                name="payment"
                value="khalti"
                checked={paymentMethod === "khalti"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span className="payment-type">Pay via Khalti</span>
            </label>
            <p className="payment-desc">
              Redirect to Khalti for secure online payment.
            </p>
          </div>
        </div>

        <div className="section">
          <label className="note-checkbox">
            <input
              type="checkbox"
              onChange={() => setShowComment(!showComment)}
            />{" "}
            Add a note to your order
          </label>
          {showComment && (
            <textarea
              className="input-box"
              placeholder="Write your note here..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              style={{ marginTop: "10px", height: "80px" }}
            ></textarea>
          )}
        </div>

        <p className="terms">
          By proceeding with your purchase you agree to our Terms and Conditions
          and Privacy Policy
        </p>

        {khaltiStatus && <p className="khalti-status">{khaltiStatus}</p>}

        {paymentMethod === "khalti" && (
          <button
            className="place-order-btn"
            onClick={handleKhaltiPayment}
            disabled={khaltiProcessing || khaltiDisabled}
          >
            {khaltiProcessing ? "Redirecting..." : "Pay with Khalti"}
          </button>
        )}

        <button
          className="place-order-btn"
          onClick={handlePlaceOrder}
          disabled={paymentMethod !== "cod"}
        >
          Place Order
        </button>
      </div>

      <div className="checkout-right">
        <h2>Order summary</h2>
        <div className="product-summary">
          {cartItems.map((item) => (
            <div className="product-item" key={item.productId}>
              <div className="qty">{item.quantity}</div>
              <div className="info">
                <p className="name">{item.productName}</p>
              </div>
              <div className="price">Rs {item.price.toFixed(2)}</div>
            </div>
          ))}
        </div>

        <div className="price-summary">
          <div className="row">
            <span>Subtotal</span>
            <span>Rs {subtotal.toFixed(2)}</span>
          </div>
          <div className="row total">
            <span>Total</span>
            <span>Rs {total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {showAddressModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Edit address</h3>
            <input
              type="text"
              value={editAddress.name}
              onChange={(e) =>
                setEditAddress({ ...editAddress, name: e.target.value })
              }
              className="input-box"
            />
            <textarea
              value={editAddress.details}
              onChange={(e) =>
                setEditAddress({ ...editAddress, details: e.target.value })
              }
              className="input-box"
              rows={3}
            ></textarea>
            <input
              type="text"
              value={editAddress.phone}
              onChange={(e) =>
                setEditAddress({ ...editAddress, phone: e.target.value })
              }
              className="input-box"
            />
            <div className="modal-actions">
              <button
                onClick={() => {
                  setAddress(editAddress);
                  setShowAddressModal(false);
                }}
              >
                Save
              </button>
              <button onClick={() => setShowAddressModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
