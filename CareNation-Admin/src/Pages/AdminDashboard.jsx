import React, { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { FaChartLine, FaCoins, FaShieldAlt, FaUsers } from "react-icons/fa";
import baseApi from "../Components/Constants/baseApi";
import "../styles/Dashboard.css";

const currency = (value) =>
  `Rs. ${Number(value ?? 0)
    .toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

const DashboardCard = ({ icon, label, value, className }) => (
  <div className={`card stats-card ${className || ""}`}>
    {icon}
    <strong>{label}</strong>
    <h2>{value}</h2>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "#1e293b",
        color: "#f8fafc",
        padding: "8px 12px",
        borderRadius: "8px",
        display: "flex",
        flexDirection: "column",
        gap: "4px",
      }}
    >
      <span style={{ fontWeight: 600 }}>{label}</span>
      <span style={{ fontSize: "0.9rem", opacity: 0.85 }}>
        {currency(payload[0].value)}
      </span>
    </div>
  );
};

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalUsers: 0,
    totalDistributors: 0,
    totalSales: 0,
    totalCommission: 0,
  });
  const [salesTrend, setSalesTrend] = useState([]);
  const [recentPayouts, setRecentPayouts] = useState([]);
  const [recentWithdrawals, setRecentWithdrawals] = useState([]);

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      setLoading(true);
      try {
        const [
          usersRes,
          distributorsRes,
          salesByProductRes,
          payoutsRes,
          salesByTimeRes,
          withdrawalsRes,
        ] = await Promise.all([
          baseApi.get("/user"),
          baseApi.get("/distributor"),
          baseApi.get("/reports/sales-by-product"),
          baseApi.get("/reports/commission-payouts"),
          baseApi.get("/reports/sales-by-time?period=month"),
          baseApi.get("/withdrawals"),
        ]);

        if (!active) return;

        const users = usersRes?.data?.data ?? [];
        const distributors = Array.isArray(distributorsRes?.data)
          ? distributorsRes.data
          : [];
        const salesByProduct = Array.isArray(salesByProductRes?.data)
          ? salesByProductRes.data
          : [];
        const payouts = Array.isArray(payoutsRes?.data)
          ? payoutsRes.data
          : [];
        const salesByTime = Array.isArray(salesByTimeRes?.data)
          ? salesByTimeRes.data
          : [];
        const withdrawals = Array.isArray(withdrawalsRes?.data)
          ? withdrawalsRes.data
          : [];

        const totalSales = salesByProduct.reduce(
          (acc, item) => acc + Number(item.totalSales || 0),
          0
        );

        const totalCommission = payouts.reduce(
          (acc, item) => acc + Number(item.amount || 0),
          0
        );

        setSummary({
          totalUsers: users.length,
          totalDistributors: distributors.length,
          totalSales,
          totalCommission,
        });

        const trend = salesByTime
          .map((item) => ({
            period: item.date
              ? new Date(item.date).toLocaleDateString(undefined, {
                  month: "short",
                  year: "numeric",
                })
              : "Unknown",
            totalSales: Number(item.totalSales || 0),
          }))
          .filter((item) => item.totalSales > 0);
        setSalesTrend(trend.slice(-6));

        const payoutsSorted = payouts
          .slice()
          .sort(
            (a, b) =>
              new Date(b.payoutDate).getTime() -
              new Date(a.payoutDate).getTime()
          )
          .slice(0, 5);
        setRecentPayouts(payoutsSorted);

        const withdrawSorted = withdrawals
          .slice()
          .sort(
            (a, b) =>
              new Date(b.requestDate).getTime() -
              new Date(a.requestDate).getTime()
          )
          .slice(0, 5);
        setRecentWithdrawals(withdrawSorted);
      } catch (error) {
        console.error("Failed to load admin dashboard:", error);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadDashboard();
    return () => {
      active = false;
    };
  }, []);

  const cards = useMemo(
    () => [
      {
        label: "Total Users",
        value: summary.totalUsers.toLocaleString(),
        icon: <FaUsers />,
        className: "stats-referrals",
      },
      {
        label: "Distributors",
        value: summary.totalDistributors.toLocaleString(),
        icon: <FaShieldAlt />,
        className: "stats-downline",
      },
      {
        label: "Gross Sales",
        value: currency(summary.totalSales),
        icon: <FaChartLine />,
        className: "stats-sales",
      },
      {
        label: "Commission Paid",
        value: currency(summary.totalCommission),
        icon: <FaCoins />,
        className: "stats-commission",
      },
    ],
    [summary]
  );

  if (loading) {
    return (
      <div className="dashboard-container">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <section className="stats-grid">
        {cards.map((card) => (
          <DashboardCard key={card.label} {...card} />
        ))}
      </section>

      <section className="chart-card">
        <h3 className="chart-title">Revenue Trend (Last 6 Months)</h3>
        {salesTrend.length ? (
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={salesTrend}>
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.15} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="period" stroke="#1f2937" />
              <YAxis
                tickFormatter={(value) =>
                  `Rs. ${Number(value).toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                  })}`
                }
                stroke="#1f2937"
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="totalSales"
                stroke="#2563eb"
                fillOpacity={1}
                fill="url(#salesGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <p>No sales data available.</p>
        )}
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "20px",
        }}
      >
        <div className="chart-card">
          <h3 className="chart-title">Latest Commission Payouts</h3>
          {recentPayouts.length ? (
            <ul style={listStyle}>
              {recentPayouts.map((payout) => {
                const payoutDate = payout.payoutDate
                  ? new Date(payout.payoutDate)
                  : null;
                return (
                  <li key={payout.id} style={listItemStyle}>
                  <div>
                    <strong>{payout.distributorName}</strong>
                    <p style={subTextStyle}>{payout.distributorEmail}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontWeight: 600 }}>
                      {currency(payout.amount)}
                    </span>
                    <p style={subTextStyle}>
                      {payoutDate ? payoutDate.toLocaleDateString() : "—"}
                    </p>
                  </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p>No payouts recorded.</p>
          )}
        </div>

        <div className="chart-card">
          <h3 className="chart-title">Recent Withdrawal Requests</h3>
          {recentWithdrawals.length ? (
            <ul style={listStyle}>
              {recentWithdrawals.map((request) => {
                const requestedAt = request.requestDate
                  ? new Date(request.requestDate)
                  : null;
                return (
                  <li key={request.id} style={listItemStyle}>
                  <div>
                    <strong>{request.distributorName}</strong>
                    <p style={subTextStyle}>{request.distributorEmail}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontWeight: 600 }}>
                      {currency(request.amount)}
                    </span>
                    <p style={subTextStyle}>
                      {requestedAt ? requestedAt.toLocaleDateString() : "—"}
                    </p>
                    <span
                      style={{
                        display: "inline-block",
                        marginTop: "4px",
                        padding: "2px 8px",
                        borderRadius: "999px",
                        backgroundColor:
                          request.status === "Approved"
                            ? "#10b981"
                            : request.status === "Rejected"
                            ? "#ef4444"
                            : "#f59e0b",
                        color: "white",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                      }}
                    >
                      {request.status}
                    </span>
                  </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p>No withdrawal activity.</p>
          )}
        </div>
      </section>
    </div>
  );
};

const listStyle = {
  listStyle: "none",
  margin: 0,
  padding: 0,
  display: "flex",
  flexDirection: "column",
  gap: "14px",
};

const listItemStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "12px",
};

const subTextStyle = {
  margin: 0,
  fontSize: "0.85rem",
  color: "rgba(148, 163, 184, 0.9)",
};

export default AdminDashboard;
