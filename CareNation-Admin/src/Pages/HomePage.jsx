import React, { useMemo, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  FaBars,
  FaChartLine,
  FaShoppingCart,
  FaBoxOpen,
  FaStore,
  FaClipboardList,
  FaMoneyBillWave,
  FaMoneyCheckAlt,
  FaExchangeAlt,
  FaTags,
  FaPowerOff,
  FaShieldAlt,
  FaUsers,
} from "react-icons/fa";
import "../styles/Navbar.css";
import "../styles/Sidebar.css";
import { useAuth } from "../Components/Context/AuthContext";

export default function HomePage() {
  const [showSidebar, setShowSidebar] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, profile } = useAuth();

  const navItems = useMemo(
    () => [
      { path: "/dashboard", icon: <FaChartLine />, label: "Dashboard" },
      { path: "/reports", icon: <FaClipboardList />, label: "Reports" },
      { path: "/users", icon: <FaUsers />, label: "Users" },
      { path: "/orders", icon: <FaShoppingCart />, label: "Orders" },
      { path: "/products", icon: <FaBoxOpen />, label: "Products" },
      { path: "/vendors", icon: <FaStore />, label: "Vendors" },
      { path: "/categories", icon: <FaTags />, label: "Categories" },
      { path: "/commission-payouts", icon: <FaMoneyCheckAlt />, label: "Commission Payouts" },
      { path: "/balance-transfers", icon: <FaExchangeAlt />, label: "Balance Transfers" },
      { path: "/withdrawals", icon: <FaMoneyBillWave />, label: "Withdrawals" },
      { path: "/distributors", icon: <FaShieldAlt />, label: "Distributors" },
    ],
    []
  );

  const currentTitle =
    navItems.find((item) => location.pathname.startsWith(item.path))?.label ||
    "Dashboard";

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="app">
      <header className="navbar">
        <div className="navbar-title">
          <FaBars
            className="hamburger"
            onClick={() => setShowSidebar((prev) => !prev)}
            role="button"
            aria-label="Toggle sidebar"
          />
          <div>
            <span className="navbar-brand">CareNation Admin</span>
            <span className="navbar-tagline">{currentTitle}</span>
          </div>
        </div>
        <div className="navbar-right">
          <Link className="profile" to="/dashboard">
            <img src="https://i.pravatar.cc/48?img=12" alt="avatar" />
            <span>{profile?.firstName ?? "CareNation Admin"}</span>
          </Link>
          <button type="button" onClick={handleLogout} className="navbar-logout">
            <FaPowerOff /> Logout
          </button>
        </div>
      </header>

      <div style={{ display: "flex" }}>
        {showSidebar && (
          <aside className="sidebar">
            <h2 style={{ color: "white" }}>CareNation Admin Portal</h2>
            <nav className="sidebar-nav">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    isActive ||
                    (item.path !== "/dashboard" &&
                      location.pathname.startsWith(item.path))
                      ? "active"
                      : undefined
                  }
                  style={{ display: "flex", alignItems: "center", gap: 10 }}
                  end={item.path === "/dashboard"}
                >
                  {item.icon} {item.label}
                </NavLink>
              ))}
            </nav>
          </aside>
        )}

        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
