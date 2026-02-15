import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Components/Context/AuthContext";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  FaBars,
  FaUsers,
  FaProjectDiagram,
  FaMoneyBillWave,
  FaCubes,
  FaChartLine,
  FaCog,
  FaWallet,
} from "react-icons/fa";
import "../styles/Navbar.css";
import "../styles/Sidebar.css";
import DarkModeContext from "../Components/Context/DarkModeContext";
import DarkModeToggle from "../Components/DashBoard/DarkModeToggle";
import Navbar from "../Components/DashBoard/Navbar";
import { BiTransfer } from "react-icons/bi";

export default function HomePage() {
  // localStorage.clear();
  const [showSidebar, setShowSidebar] = useState(true);
  const { darkMode } = useContext(DarkModeContext);
  const location = useLocation();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // Clear tokens or session
    navigate("/login"); // Redirect to login page
  };

  const navItems = [
    { path: "/dashboard", icon: <FaChartLine />, label: "Dashboard" },
    { path: "/users", icon: <FaUsers />, label: "Users" },
    { path: "/tree", icon: <FaProjectDiagram />, label: "Tree View" },
    // { path: "/reports", icon: <FaChartLine />, label: "Reports" },
    { path: "/withdrawl", icon: <FaChartLine />, label: "Withdrawl request " },
    { path: "/wallet", icon: <FaWallet />, label: "Wallet " },
    {
      path: "/balance-transfer",
      icon: <BiTransfer />,
      label: "balance-transfer",
    },
    {
      path: "/personal-report",
      icon: <FaChartLine />,
      label: "Personal Reports",
    },
  ];

  return (
    <div className={darkMode ? "app dark-mode" : "app"}>
      {/* Global Navbar */}
      <Navbar />
      {/* Sidebar + Routed Content */}
      <div style={{ display: "flex" }}>
        {showSidebar && (
          <div className="sidebar">
            <h2 style={{ color: "white" }}>MLM Admin</h2>
            <div className="sidebar-nav">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={
                    location.pathname.startsWith(item.path) ? "active" : ""
                  }
                  style={{ display: "flex", alignItems: "center", gap: 10 }}
                >
                  {item.icon} {item.label}
                </Link>
              ))}
            </div>
            <button
              onClick={handleLogout}
              style={{
                marginTop: "20px",
                color: "red",
                border: "none",
                background: "none",
                cursor: "pointer",
              }}
            >
              Logout
            </button>
          </div>
        )}
        <div className="main-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
