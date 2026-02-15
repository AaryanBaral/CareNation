import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import baseApi from "../Constants/baseApi";
import "../style/Signup.css";

export default function Signup() {
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState(""); // optional
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [permanentFullAddress, setPermanentFullAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload = {
      firstName: firstName.trim(),
      middleName: middleName.trim() || null, // optional
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      password: password.trim(),
      phoneNumber: phoneNumber.trim(),
      permanentFullAddress: permanentFullAddress.trim(),
      // role will default to "user" server-side
    };

    // Basic validation (middleName is optional)
    if (
      !payload.firstName ||
      !payload.lastName ||
      !payload.email ||
      !payload.password ||
      !payload.phoneNumber ||
      !payload.permanentFullAddress
    ) {
      setLoading(false);
      setError("Please fill in all required fields.");
      return;
    }

    try {
      const response = await baseApi.post("/user/signup", payload);
      console.log("Signup successful", response.data);
      navigate("/login");
    } catch (err) {
      console.error("Signup failed:", err.response?.data || err);
      const apiMsg =
        err.response?.data?.message ||
        err.response?.data?.title ||
        "Signup failed";
      setError(apiMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <h2 className="signup-title">Signup</h2>
      <form className="signup-form" onSubmit={handleSignup}>
        {/* First Name */}
        <div className="signup-form-group">
          <label className="signup-label" htmlFor="firstName">
            First Name
          </label>
          <input
            className="signup-input"
            type="text"
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="e.g., John"
            required
          />
        </div>

        {/* Middle Name (optional) */}
        <div className="signup-form-group">
          <label className="signup-label" htmlFor="middleName">
            Middle Name (optional)
          </label>
          <input
            className="signup-input"
            type="text"
            id="middleName"
            value={middleName}
            onChange={(e) => setMiddleName(e.target.value)}
            placeholder="e.g., Michael"
          />
        </div>

        {/* Last Name */}
        <div className="signup-form-group">
          <label className="signup-label" htmlFor="lastName">
            Last Name
          </label>
          <input
            className="signup-input"
            type="text"
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="e.g., Doe"
            required
          />
        </div>

        {/* Email */}
        <div className="signup-form-group">
          <label className="signup-label" htmlFor="email">
            Email
          </label>
          <input
            className="signup-input"
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
        </div>

        {/* Password */}
        <div className="signup-form-group">
          <label className="signup-label" htmlFor="password">
            Password
          </label>
          <input
            className="signup-input"
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create password"
            required
          />
        </div>

        {/* Phone Number */}
        <div className="signup-form-group">
          <label className="signup-label" htmlFor="phoneNumber">
            Phone Number
          </label>
          <input
            className="signup-input"
            type="tel"
            id="phoneNumber"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Enter your phone number"
            required
          />
        </div>

        {/* Permanent Full Address */}
        <div className="signup-form-group">
          <label className="signup-label" htmlFor="permanentFullAddress">
            Permanent Address
          </label>
          <input
            className="signup-input"
            type="text"
            id="permanentFullAddress"
            value={permanentFullAddress}
            onChange={(e) => setPermanentFullAddress(e.target.value)}
            placeholder="House/Street, City, State, ZIP"
            required
          />
        </div>

        <button className="signup-button" type="submit" disabled={loading}>
          {loading ? "Signing up..." : "Signup"}
        </button>
      </form>

      {error && <p className="signup-error-text">{error}</p>}

      <p className="signup-link-text">
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}
