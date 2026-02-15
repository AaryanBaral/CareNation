// BalanceTransfer.jsx
import React, { useEffect, useState, useMemo } from "react";
import baseApi from "../Components/Constants/baseApi";
import "../styles/BalanceTransfer.css";

const BalanceTransfer = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [amount, setAmount] = useState("");
  const [remarks, setRemarks] = useState("");
  const [walletVisible, setWalletVisible] = useState(false);
  const [passwordPrompt, setPasswordPrompt] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [walletAmount, setWalletAmount] = useState(null);
  const [selfProfile, setSelfProfile] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [transferPayload, setTransferPayload] = useState(null);

  // --- helpers ---
  const fullName = (u) => {
    const f = (u?.firstName ?? "").trim();
    const m = (u?.middleName ?? "").trim();
    const l = (u?.lastName ?? "").trim();
    return [f, m, l].filter(Boolean).join(" ");
  };

  const currency = (n) =>
    (Number(n) || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const normalizedUsers = useMemo(
    () =>
      (users || []).map((u) => ({
        ...u,
        _displayName: fullName(u),
        _searchBlob: `${fullName(u)} ${u?.email ?? ""}`.toLowerCase(),
      })),
    [users]
  );

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    return normalizedUsers.filter((u) => u._searchBlob.includes(q));
  }, [normalizedUsers, search]);

  // --- API calls ---
  useEffect(() => {
    getUsers();
    getMyProfile();
  }, []);

  const getUsers = async () => {
    try {
      const res = await baseApi.get("distributor");
      // support both shapes: array or { data: [...] }
      const list = Array.isArray(res.data) ? res.data : res.data?.data;
      setUsers(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Error fetching users:", err);
      setUsers([]);
    }
  };

  const getMyProfile = async () => {
    try {
      const res = await baseApi.get("distributor/individual");
      const profile = res.data?.data ?? res.data;
      setSelfProfile(profile);
      setWalletAmount(profile?.totalWallet ?? 0);
    } catch (err) {
      console.error("Failed to load profile", err);
      setSelfProfile(null);
      setWalletAmount(0);
    }
  };

  // --- auth + transfer ---
  const submitTransferWithPassword = async () => {
    if (!selfProfile?.email) {
      setAuthError("Your profile email was not found.");
      return;
    }
    try {
      const res = await baseApi.post("user/login", {
        email: selfProfile.email,
        password: password,
      });

      if (res.status === 200) {
        await baseApi.post("balance-transfer", transferPayload);
        alert("✅ Transfer successful!");
        setAmount("");
        setSelectedUser(null);
        setSearch("");
        setRemarks("");
        setPassword("");
        setAuthError("");
        getMyProfile();
        setShowPasswordModal(false);
      }
    } catch (err) {
      setAuthError("❌ Incorrect password. Please try again.");
    }
  };

  const confirmPassword = async () => {
    if (!selfProfile?.email) {
      setAuthError("Your profile email was not found.");
      return;
    }
    try {
      const res = await baseApi.post("user/login", {
        email: selfProfile.email,
        password: password,
      });
      if (res.status === 200) {
        setWalletVisible(true);
        setPasswordPrompt(false);
      }
    } catch (err) {
      setAuthError("Incorrect password");
    }
  };

  const handleTransfer = () => {
    if (!selectedUser || !amount) {
      alert("Please select a user and enter an amount.");
      return;
    }
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      alert("Amount must be a positive number.");
      return;
    }

    setTransferPayload({
      receiverId: selectedUser.id, // GUID string from your new JSON
      amount: amt,
      remarks,
    });
    setShowPasswordModal(true);
  };

  return (
    <div className="transfer-page">
      <h2 className="title">🔁 Transfer Balance</h2>

      <div className="wallet-section">
        <strong>Your Wallet:</strong> <span>Rs. {currency(walletAmount)}</span>
        {passwordPrompt && (
          <div className="password-prompt">
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={confirmPassword}>Confirm</button>
            {authError && <p className="error">{authError}</p>}
          </div>
        )}
      </div>

      <div className="transfer-form">
        <input
          type="text"
          placeholder="Search user by name or email"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            // if user edits search, clear selectedUser so we don't send stale receiverId
            setSelectedUser(null);
          }}
        />

        <div
          className={`dropdown-list ${
            search && filteredUsers.length > 0 ? "open" : ""
          }`}
        >
          {filteredUsers.map((user) => {
            const name = user._displayName || "(No name)";
            return (
              <div
                key={user.id}
                className="dropdown-item"
                onClick={() => {
                  setSelectedUser(user);
                  setSearch(`${name} (${user.email || "no-email"})`);
                }}
              >
                <strong>{name}</strong> <br />
                <small>{user.email || "no-email"}</small>
              </div>
            );
          })}
        </div>

        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min="0"
          step="0.01"
        />
        <input
          type="text"
          placeholder="Remarks (optional)"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
        />
        <button
          onClick={handleTransfer}
          className="submit-btn"
          disabled={!selectedUser || !amount}
        >
          Transfer
        </button>
      </div>

      {showPasswordModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>🔒 Confirm Password</h3>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && submitTransferWithPassword()
              }
            />
            {authError && <p className="error">{authError}</p>}
            <div className="modal-actions">
              <button onClick={submitTransferWithPassword}>Confirm</button>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setAuthError("");
                  setPassword("");
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Optional: show who is selected */}
      {selectedUser && (
        <div className="selected-user-hint">
          Sending to: <strong>{fullName(selectedUser)}</strong>{" "}
          <span>({selectedUser.email})</span>
        </div>
      )}
    </div>
  );
};

export default BalanceTransfer;
