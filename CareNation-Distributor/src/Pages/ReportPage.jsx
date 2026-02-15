import React, { useState } from "react";
import baseApi from "../Components/Constants/baseApi";
import "../styles/ReportPage.css"

const reportOptions = [
  { key: "sales-by-product", label: "Sales by Product" },
  { key: "sales-by-category", label: "Sales by Category" },
  { key: "sales-by-time", label: "Sales by Time" },
  { key: "commission-payouts", label: "Commission Payouts" },
  { key: "commission-payout-summary", label: "Commission Summary" },
  { key: "withdrawal-requests", label: "Withdrawal Requests" },
  { key: "withdrawal-transactions", label: "Withdrawal Transactions" },
  { key: "product-stock-report", label: "Product Stock Report" },
  { key: "distributor-performance", label: "Distributor Performance" },
  { key: "distributor-account-balances", label: "Distributor Account Balances" },
  { key: "user-growth", label: "User Growth" },
  { key: "full-transactional-report", label: "Full Transactional Report" }
];

function ReportPage() {
  const [selectedReport, setSelectedReport] = useState("");
  const [filters, setFilters] = useState({ from: "", to: "", userId: "", status: "", period: "" });
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const fetchReport = async () => {
    if (!selectedReport) return;
    setLoading(true);

    try {
      const params = new URLSearchParams();

      Object.keys(filters).forEach((key) => {
        if (filters[key]) {
          params.append(key, filters[key]);
        }
      });

      const res = await baseApi.get(`reports/${selectedReport}?${params.toString()}`);
      setReportData(Array.isArray(res.data) ? res.data : [res.data]);
    } catch (error) {
      console.error("Error fetching report:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderTable = () => {
    if (!reportData.length) return <p>No data available.</p>;

    const keys = Object.keys(reportData[0]);

    return (
      <table className="report-table">
        <thead>
          <tr>
            {keys.map((key) => (
              <th key={key}>{key.replace(/([A-Z])/g, " $1").toUpperCase()}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {reportData.map((row, idx) => (
            <tr key={idx}>
              {keys.map((key) => (
                <td key={key}>{row[key] ?? "-"}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="report-page">
      <h2 className="report-title">📊 Admin Reports</h2>

      <div className="report-filters">
        <label>Select Report:</label>
        <select value={selectedReport} onChange={(e) => setSelectedReport(e.target.value)}>
          <option value="">-- Choose Report --</option>
          {reportOptions.map((r) => (
            <option key={r.key} value={r.key}>
              {r.label}
            </option>
          ))}
        </select>

        {/* Dynamic filters based on report type */}
        <div className="dynamic-filters">
          {["sales-by-product", "sales-by-category", "sales-by-time", "commission-payouts", "commission-payout-summary", "withdrawal-requests", "withdrawal-transactions", "distributor-performance", "user-growth", "personal-earnings", "full-transactional-report"].includes(selectedReport) && (
            <>
              <input type="date" name="from" value={filters.from} onChange={handleFilterChange} />
              <input type="date" name="to" value={filters.to} onChange={handleFilterChange} />
            </>
          )}

          {["commission-payouts", "withdrawal-requests"].includes(selectedReport) && (
            <input
              type="text"
              placeholder="Status (e.g., Paid, Pending)"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
            />
          )}

          {["full-transactional-report", "personal-earnings"].includes(selectedReport) && (
            <input
              type="text"
              placeholder="User ID"
              name="userId"
              value={filters.userId}
              onChange={handleFilterChange}
            />
          )}
        
          {selectedReport === "sales-by-time" || selectedReport === "user-growth" ? (
            <select name="period" value={filters.period} onChange={handleFilterChange}>
              <option value="">Select Period</option>
              <option value="day">Day</option>
              <option value="month">Month</option>
              <option value="year">Year</option>
            </select>
          ) : null}
        </div>

        <button className="fetch-btn" onClick={fetchReport}>
          {loading ? "Loading..." : "Generate Report"}
        </button>
      </div>

      <div className="report-results">{renderTable()}</div>
    </div>
  );
}

export default ReportPage;
