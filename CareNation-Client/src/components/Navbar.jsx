import React, { useState, useEffect } from "react";
import {  Link, useNavigate } from "react-router-dom";
import { FaShoppingCart, FaUserCircle } from "react-icons/fa";
import "../style/Navbar.css";
import { useAuth } from "./Context/AuthContext";

export default function Navbar() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    logout();
    setIsLoggedIn(false);
    navigate("/login");
  };

  return (
    <div className="navbar">

      {/* Main Navbar */}
      <div className="navbar-content">
        {/* Logo and Brand */}
        <Link to ="/" className="brand" >
          <img src="/images/logo.png" alt="Logo" className="logo" />
          <span className="brand-name">
            <strong>Carenation</strong> International
          </span>
        </Link>

        {/* Nav Links */}
        <ul className="nav-links">
          <Link className="dropdown" to ="/item-list">Shop</Link>
        </ul>

        {/* Icons */}
        <div className="nav-icons">
          <Link to="/cart"><FaShoppingCart className="icon" /></Link>
          <Link to ="/profile" ><FaUserCircle className="icon" /></Link>
          {isLoggedIn ? (
            <span className="auth-link logout" onClick={handleLogout}>
              Logout
            </span>
          ) : (
            <span className="auth-link" onClick={() => navigate("/login")}>
              login | Register
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
