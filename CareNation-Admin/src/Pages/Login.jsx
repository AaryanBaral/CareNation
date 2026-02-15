import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import baseApi from "../Components/Constants/baseApi";
import "../styles/Login.css";
import { toast } from "sonner";
import { useAuth } from "../Components/Context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const { data } = await baseApi.post("/admins/login", {
        email: email.trim(),
        password: password.trim(),
      });

      if (!data?.token) {
        throw new Error("Invalid login response");
      }

      login(data.token);
      toast.success("Welcome back! Redirecting to your dashboard.");
      navigate("/dashboard", { replace: true });
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.title ||
        "Unable to login, please try again.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container fade-in">
      <h2>CareNation Admin Portal</h2>
      <p className="subtext">Sign in with your administrator credentials.</p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email address</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@example.com"
            autoComplete="email"
            required
          />
        </div>

        <div className="form-group" style={{ marginTop: "1rem" }}>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            autoComplete="current-password"
            required
          />
        </div>

        <button type="submit" disabled={loading} style={{ marginTop: "24px" }}>
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
