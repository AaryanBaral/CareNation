import React, { useEffect, useState } from "react";
import baseApi from "../Constants/baseApi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./Context/AuthContext";
import "../style/Login.css";

export default function Login() {
  const { token, login, setExpiry } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const LoginFunction = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Trim input values
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    try {
      const response = await baseApi.post("/user/login", {
        email: trimmedEmail,
        password: trimmedPassword,
      });

      const token = response.data.data;
      login(token);
      setExpiry();
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.title || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      navigate("/");
    }
  }, [token, navigate]);

  return (
    <div className="login-container login-fade-in">
      <h2 className="login-title">User Login</h2>
      <p className="login-subtext">Welcome back! Login to your user account</p>

      <form className="login-form" onSubmit={LoginFunction}>
        <div className="login-form-group">
          <label className="login-label" htmlFor="email">
            Email Address
          </label>
          <input
            className="login-input"
            type="email"
            id="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </div>
        <div className="login-form-group" style={{ marginTop: "1rem" }}>
          <label className="login-label" htmlFor="password">
            Password
          </label>
          <input
            className="login-input"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />
        </div>
        <button className="login-button" type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
        {error && <p className="login-error-text">{error}</p>}
      </form>

      <p className="login-link-text">
        Don't have an account? <a href="/signup">Signup</a>
      </p>
    </div>
  );
}
