import React, { useState } from "react";
import baseApi from "../Components/Constants/baseApi";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css"
import { useAuth } from "../Components/Context/AuthContext";
import { toast } from "sonner";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, setIsDistributor, setIsImpersonating, setExpiry } = useAuth();

const LoginFunction = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError("");

  // Trim the values before sending
  const trimmedEmail = email.trim();
  const trimmedPassword = password.trim();

  try {
    const response = await baseApi.post("/distributor/login", {
      email: trimmedEmail,
      password: trimmedPassword,
    });

    const token = response.data.token;
    const isDistributor = response.data.isDistributor;

    login(token);
    setIsDistributor(isDistributor);
    setIsImpersonating(false);
    setExpiry();

    if (isDistributor) {
      toast.success("Login successful! Redirecting to dashboard...");
      navigate("/");
    } else {
      toast.success("Login successful! Redirecting to signup page...");
      navigate("/signup");
    }
  } catch (err) {
    console.log(err);
    toast.error(err.response?.data?.title || "Login failed");
    setError(err.response?.data?.title || "Login failed");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="container fade-in">
      <h2>Welcome Back 👋</h2>
      <p className="subtext">Login to your account to continue</p>
      <form onSubmit={LoginFunction}>
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </div>
        <div className="form-group" style={{ marginTop: "1rem" }}>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
        {error && <p className="error-text">{error}</p>}
      </form>
    </div>
  );
}
