import React, { useState } from "react";
import baseApi from "../Components/Constants/baseApi";
import "../styles/PersonalReportPage.css"

const personalReportOptions = [
  { key: "personal-earnings", label: "Personal Earnings" },
  { key: "commission-payouts", label: "My Commission Payouts" },
  { key: "commission-payout-summary", label: "Commission Summary" },
  { key: "withdrawal-requests", label: "My Withdrawal Requests" },
  { key: "withdrawal-transactions", label: "Withdrawal Transactions" },
  { key: "payments", label: "Payments" },
  { key: "full-transactions", label: "Full Transaction History" },
];

const PersonalReportPage = () => {
  const [selectedReport, setSelectedReport] = useState("");
  const [filters, setFilters] = useState({
    from: "",
    to: "",
    status: "",
    paymentType: "",
  });
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
      if (filters.from) params.append("from", filters.from);
      if (filters.to) params.append("to", filters.to);
      if (filters.status && (selectedReport.includes("commission") || selectedReport.includes("withdrawal")))
        params.append("status", filters.status);
      if (selectedReport === "payments" && filters.paymentType)
        params.append("paymentType", filters.paymentType);

      const res = await baseApi.get(`my-reports/${selectedReport}?${params.toString()}`);
      console.log(res)
      setReportData(Array.isArray(res.data) ? res.data : [res.data]);
    } catch (err) {
      console.error("Error loading report", err);
      setReportData([]);
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
    <div className="personal-report-page">
      <h2 className="title">📈 My Reports</h2>

      <div className="filter-box">
        <label>Select Report:</label>
        <select value={selectedReport} onChange={(e) => setSelectedReport(e.target.value)}>
          <option value="">-- Choose Report --</option>
          {personalReportOptions.map((r) => (
            <option key={r.key} value={r.key}>{r.label}</option>
          ))}
        </select>

        {(selectedReport && selectedReport !== "commission-payout-summary") && (
          <>
            <input type="date" name="from" value={filters.from} onChange={handleFilterChange} />
            <input type="date" name="to" value={filters.to} onChange={handleFilterChange} />
          </>
        )}

        {["commission-payouts", "withdrawal-requests"].includes(selectedReport) && (
          <input
            type="text"
            name="status"
            placeholder="Status (e.g. Paid, Pending)"
            value={filters.status}
            onChange={handleFilterChange}
          />
        )}

        {selectedReport === "payments" && (
          <select
            name="paymentType"
            value={filters.paymentType}
            onChange={handleFilterChange}
          >
            <option value="">All Payments</option>
            <option value="Order">Order Payments</option>
            <option value="Withdrawal">Distributor Payments</option>
          </select>
        )}

        <button onClick={fetchReport} className="btn-fetch">
          {loading ? "Loading..." : "Generate Report"}
        </button>
      </div>

      <div className="result-box">{renderTable()}</div>
    </div>
  );
};

export default PersonalReportPage;
