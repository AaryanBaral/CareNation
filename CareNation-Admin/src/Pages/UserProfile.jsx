// UserProfile.jsx
import React, { useEffect, useState, useMemo } from "react";
import "../styles/UserProfile.css";
import baseApi from "../Components/Constants/baseApi";

function UserProfile() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const res = await baseApi.get("distributor/individual");
      const p = res?.data?.data ?? res?.data ?? null;
      setProfile(p);
    } catch (err) {
      console.error("Failed to load profile", err);
      setProfile(null);
    }
  }

  const fullName = useMemo(() => {
    if (!profile) return "";
    const f = (profile.firstName ?? "").trim();
    const m = (profile.middleName ?? "").trim();
    const l = (profile.lastName ?? "").trim();
    return [f, m, l].filter(Boolean).join(" ");
  }, [profile]);

  const currency = (n) =>
    (Number(n) || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  if (!profile) return <p className="loading">Loading...</p>;

  return (
    <div className="profile-container fb-theme">
      <h2 className="profile-title">👤 User Profile</h2>

      {/* ID Card */}
      <div className="idcard">
        <div className="idcard-header">
          <div className="idcard-brand">
            <div className="brand-mark">CN</div>
            <div className="brand-text">
              <div className="brand-name">Care Nation</div>
              <div className="brand-sub">Distributor ID</div>
            </div>
          </div>

          <div className="idcard-status">
            <span className="status-label">Status</span>
            <span className="status-value">Active</span>
          </div>
        </div>

        <div className="idcard-body">
          {/* Photo */}
          <div className="idcard-photo">
            <img
              src={
                ` http://localhost:5127${profile.profilePictureUrl}`
              }
              alt={`${fullName || "User"} photo`}
              loading="lazy"
            />
          </div>

          {/* Details */}
          <div className="idcard-details">
            <h3 className="idcard-name">{fullName || "(No name)"}</h3>

            <div className="fields-grid">
              <div className="field">
                <span className="label">Role</span>
                <span className="value">{profile.role || "—"}</span>
              </div>
              <div className="field">
                <span className="label">ID</span>
                <span className="value mono">{profile.id || "—"}</span>
              </div>
              <div className="field">
                <span className="label">Email</span>
                <span className="value">{profile.email || "—"}</span>
              </div>
              <div className="field">
                <span className="label">Phone</span>
                <span className="value">{profile.phoneNumber || "—"}</span>
              </div>
              <div className="field wide">
                <span className="label">Address</span>
                <span className="value">
                  {profile.permanentFullAddress || "—"}
                </span>
              </div>
              <div className="field">
                <span className="label">DOB</span>
                <span className="value">{profile.dob || "—"}</span>
              </div>
              <div className="field">
                <span className="label">Citizenship No.</span>
                <span className="value">{profile.citizenshipNo || "—"}</span>
              </div>
              <div className="field">
                <span className="label">Account Name</span>
                <span className="value">{profile.accountName || "—"}</span>
              </div>
              <div className="field">
                <span className="label">Account No.</span>
                <span className="value mono">
                  {profile.accountNumber || "—"}
                </span>
              </div>
              <div className="field">
                <span className="label">Bank</span>
                <span className="value">{profile.bankName || "—"}</span>
              </div>
              <div className="field">
                <span className="label">Bank Branch</span>
                <span className="value">{profile.bankBranchName || "—"}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="idcard-footer">
          <div className="id-number mono">#{profile.id || "—"}</div>
          <div className="seal">Care Nation • VERIFIED</div>
        </div>
      </div>

      {/* Wallet cards */}
      <div className="info-cards">
        <div className="info-card">
          <h4>Left Leftover</h4>
          <p>Rs. {currency(profile.leftWallet)}</p>
        </div>
        <div className="info-card">
          <h4>Right Leftover</h4>
          <p>Rs. {currency(profile.rightWallet)}</p>
        </div>
        <div className="info-card">
          <h4>Total Wallet</h4>
          <p>Rs. {currency(profile.totalWallet)}</p>
        </div>
        <div className="info-card">
          <h4>Total Commission</h4>
          <p>Rs. {currency(profile.totalcomission)}</p>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
