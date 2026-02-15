import React from "react";
import { Link } from "react-router-dom";
import DarkModeToggle from "./DarkModeToggle";
import { FaBars, FaChartLine, FaCog, FaCubes, FaMoneyBillWave, FaProjectDiagram, FaUsers } from "react-icons/fa";


const Navbar = () => {

    const navItems = [
      { path: "/dashboard", icon: <FaChartLine />, label: "Dashboard" },
      { path: "/users", icon: <FaUsers />, label: "Users" },
      { path: "/tree", icon: <FaProjectDiagram />, label: "Tree View" },
      { path: "/payouts", icon: <FaMoneyBillWave />, label: "Payouts" },
      { path: "/packages", icon: <FaCubes />, label: "Packages" },
      { path: "/reports", icon: <FaChartLine />, label: "Reports" },
      { path: "/settings", icon: <FaCog />, label: "Settings" },
    ];

  return (
      <div className="navbar">
        <div className="navbar-title">
          <FaBars className="hamburger" onClick={() => setShowSidebar(s => !s)} />
          <span>
            {navItems.find(item => location.pathname.startsWith(item.path))?.label || "Dashboard"}
          </span>
        </div>
        <div className="navbar-right">
          <DarkModeToggle />
          <Link className="profile" to="/profile">
            <img src="https://i.pravatar.cc/300?img=32" alt="avatar" />
            <span>Admin</span>
          </Link>
        </div>
      </div>
  );
};

export default Navbar;
