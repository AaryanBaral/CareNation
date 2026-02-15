import React, { useEffect, useState, useContext } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import DarkModeContext from "../Context/DarkModeContext";
import baseApi from "../Constants/baseApi"; // ✅ added

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: "#fff",
          border: "1px solid #ddd",
          padding: "8px 12px",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <strong>{label}</strong>
        <p style={{ margin: 0, color: "#2563eb", fontWeight: 600 }}>
          Rs. {payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

const SalesChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { darkMode } = useContext(DarkModeContext);

  useEffect(() => {
    let mounted = true;

    baseApi
      .get("/my-reports/team-sales-by-time?period=month")
      .then((res) => {
        const arr = Array.isArray(res.data) ? res.data : [];
        if (!mounted) return;

        const mapped = arr.map((item) => ({
          name: item.date
            ? new Date(item.date).toLocaleString("default", {
                month: "short",
                year: "numeric",
              })
            : "Unknown",
          sales: item.totalSales || 0,
        }));

        setData(mapped);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch sales chart:", err);
        if (mounted) {
          setData([]);
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <div>Loading sales chart...</div>;
  if (!data.length) return <div>No sales data.</div>;

  return (
    <div
      className={`chart-card ${darkMode ? "dark-mode" : ""}`}
      style={{
        padding: "20px",
        borderRadius: "12px",
        background: darkMode ? "#1e293b" : "#fff",
      }}
    >
      <h3 className="chart-title" style={{ marginBottom: "20px" }}>
        📊 Team Sales Overview
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={darkMode ? "#38bdf8" : "#2563eb"} stopOpacity={0.9} />
              <stop offset="95%" stopColor={darkMode ? "#0ea5e9" : "#1d4ed8"} stopOpacity={0.8} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#334155" : "#e5e7eb"} />
          <XAxis dataKey="name" stroke={darkMode ? "#fff" : "#374151"} />
          <YAxis stroke={darkMode ? "#fff" : "#374151"} />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="sales"
            fill="url(#barGradient)"
            radius={[6, 6, 0, 0]}
            barSize={40}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SalesChart;
