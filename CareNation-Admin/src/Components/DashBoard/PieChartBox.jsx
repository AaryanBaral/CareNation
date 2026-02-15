import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip } from "recharts";
import baseApi from "../Constants/baseApi"; // ✅ added

const COLORS = ["#ef4444", "#10b981", "#6366f1", "#f59e0b", "#3b82f6"];

function PieChartBox() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    baseApi
      .get("reports/sales-by-category")
      .then((res) => {
        const arr = Array.isArray(res.data) ? res.data : [];
        if (!mounted) return;

        const mapped = arr.map((cat) => ({
          name: cat.categoryName,
          value: cat.totalSales || 0,
        }));

        setData(mapped);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load category sales:", err);
        if (mounted) {
          setData([]);
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <div>Loading revenue breakdown...</div>;
  if (!data || data.length === 0) return <div>No category sales data.</div>;

  // Custom currency formatter
  const formatCurrency = (value) =>
    `Rs. ${value.toLocaleString("en-IN")}`;

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            background: "#fff",
            padding: "8px 12px",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            fontSize: "0.9rem",
          }}
        >
          <strong>{payload[0].name}</strong>
          <div>{formatCurrency(payload[0].value)}</div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="chart-card">
      <h3 className="chart-title">📈 Revenue Breakdown</h3>
      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={120}
            paddingAngle={4}
            dataKey="value"
            isAnimationActive={true}
          >
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={COLORS[index % COLORS.length]}
                style={{ cursor: "pointer" }}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="middle"
            align="right"
            layout="vertical"
            formatter={(value) => <span style={{ fontSize: "0.9rem" }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default PieChartBox;
