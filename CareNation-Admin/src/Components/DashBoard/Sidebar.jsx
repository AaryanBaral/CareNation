import React from "react";

const Sidebar = ({ selectedView, setSelectedView }) => {
  const navItems = [
    { label: "Dashboard", icon: "📊" },
    { label: "Users", icon: "👥" },
    { label: "Tree View", icon: "🌳" },
    { label: "Payouts", icon: "��" },
    { label: "Packages", icon: "📦" },
    { label: "Reports", icon: "📈" },
    { label: "Settings", icon: "⚙️" },
  ];

  return (
    <div className="sidebar">
      <h2>MLM Admin</h2>
      <div className="sidebar-nav">
        {navItems.map((item) => (
          <a
            key={item.label}
            className={selectedView === item.label ? "active" : ""}
            onClick={() => setSelectedView(item.label)}
          >
            <span className="icon">{item.icon}</span>
            {item.label}
          </a>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
