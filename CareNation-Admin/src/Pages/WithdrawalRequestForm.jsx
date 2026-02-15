import React, { useEffect, useState } from "react";
import "../styles/WithdrawalRequestForm.css";
import baseApi from "../Components/Constants/baseApi";

export default function WithdrawalRequestForm() {
  const [amount, setAmount] = useState("");
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [password, setPassword] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [authError, setAuthError] = useState("");
  const [formData, setFormData] = useState(null);
  const [walletAmount, setWalletAmount] = useState(0);
  const [userEmail, setUserEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage("");

    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      setMessage("❌ Please enter a valid amount.");
      return;
    }

    // Store form temporarily and open password modal
    setFormData({
      amount: parseFloat(amount),
      remarks: remarks.trim(),
    });
    setShowPasswordModal(true);
  };
  const confirmAndSubmit = async () => {
    setLoading(true);
    setAuthError("");

    try {
      const loginRes = await baseApi.post("user/login", {
        password,
        email: userEmail,
      });

      if (loginRes.status === 200) {
        await baseApi.post("/withdrawals/request", formData);

        setMessage("✅ Withdrawal request submitted successfully.");
        setAmount("");
        setRemarks("");
        setFormData(null);
        setShowPasswordModal(false);
        setPassword("");
      }
    } catch (err) {
      setAuthError("❌ Incorrect password");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await baseApi.get("distributor/individual");
        setWalletAmount(res.data.totalWallet || 0);
        setUserEmail(res.data.email || "");
      } catch (err) {
        console.error("Failed to fetch user profile:", err);
      }
    };

    fetchProfile();
  }, []);

  return (
    <div className="withdrawal-form">
      <h2>💸 Withdrawal Request</h2>
      <p style={{ marginBottom: "1rem", fontWeight: "500", color: "#374151" }}>
        Available Wallet Balance: <strong>Rs. {walletAmount}</strong>
      </p>
      {message && (
        <div
          className={`message ${
            message.startsWith("✅") ? "success" : "error"
          }`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <label>Amount (Rs.)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
          required
        />

        <label>Remarks (optional)</label>
        <textarea
          rows="3"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="Any message for admin"
        />

        <button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit Request"}
        </button>
      </form>
      {showPasswordModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>🔐 Confirm Password</h3>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {authError && <p className="error">{authError}</p>}
            <div className="modal-actions">
              <button onClick={confirmAndSubmit} disabled={loading}>
                {loading ? "Submitting..." : "Confirm"}
              </button>
              <button onClick={() => setShowPasswordModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
