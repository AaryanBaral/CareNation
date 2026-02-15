import React, { useMemo, useState } from "react";
import baseApi from "../Components/Constants/baseApi";
import "../styles/ReportPage.css";
import { toast } from "sonner";

const reportOptions = [
  { key: "sales-by-product", label: "Sales by Product" },
  { key: "sales-by-category", label: "Sales by Category" },
  { key: "sales-by-time", label: "Sales by Time" },
  { key: "commission-payouts", label: "Commission Payouts" },
  { key: "commission-payout-summary", label: "Commission Summary" },
  { key: "withdrawal-requests", label: "Withdrawal Requests" },
  { key: "withdrawal-transactions", label: "Withdrawal Transactions" },
  { key: "payments", label: "Payments" },
  { key: "product-stock-report", label: "Product Stock Report" },
  { key: "distributor-performance", label: "Distributor Performance" },
  { key: "distributor-account-balances", label: "Distributor Balances" },
  { key: "user-growth", label: "User Growth" },
  { key: "full-transactional-report", label: "Full Transactional Report" },
  { key: "personal-earnings", label: "Personal Earnings (by Distributor)" },
];

const defaultFilters = {
  from: "",
  to: "",
  userId: "",
  distributorId: "",
  reorderLevel: "",
  status: "",
  period: "",
  paymentType: "",
};

const dateReports = new Set([
  "sales-by-product",
  "sales-by-category",
  "sales-by-time",
  "commission-payouts",
  "commission-payout-summary",
  "withdrawal-requests",
  "withdrawal-transactions",
  "payments",
  "distributor-performance",
  "user-growth",
  "personal-earnings",
  "full-transactional-report",
]);

const statusReports = new Set([
  "commission-payouts",
  "withdrawal-requests",
]);

const userScopedReports = new Set([
  "full-transactional-report",
  "personal-earnings",
]);

const inventoryReports = new Set(["product-stock-report"]);

const periodReports = new Set(["sales-by-time", "user-growth"]);
const paymentTypeReports = new Set(["payments"]);

const AdminReports = () => {
  const [selectedReport, setSelectedReport] = useState("");
  const [filters, setFilters] = useState(defaultFilters);
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => setFilters(defaultFilters);

  const formattedData = useMemo(() => {
    if (!reportData?.length) return { rows: [], columns: [] };

    const columns = Object.keys(reportData[0]);

    const rows = reportData.map((row, index) => ({
      key: `${row.id ?? index}`,
      values: columns.map((column) => {
        const value = row[column];

        if (value === null || value === undefined || value === "") return "—";
        if (typeof value === "number") {
          if (Number.isInteger(value)) return value.toLocaleString();
          return value.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
        }

        if (typeof value === "string") {
          const maybeDate = Date.parse(value);
          if (!Number.isNaN(maybeDate) && value.includes("T")) {
            return new Date(value).toLocaleString();
          }
          return value;
        }

        return String(value);
      }),
    }));

    return { rows, columns };
  }, [reportData]);

  const fetchReport = async () => {
    if (!selectedReport) {
      toast.error("Please select a report first.");
      return;
    }
    setLoading(true);

    try {
      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (!value) return;
        params.append(key, value);
      });

      const query = params.toString();
      const endpoint = query
        ? `/reports/${selectedReport}?${query}`
        : `/reports/${selectedReport}`;

      const { data } = await baseApi.get(endpoint);
      const normalized = Array.isArray(data) ? data : data ? [data] : [];

      if (!normalized.length) {
        toast.info("No records found for the selected filters.");
      }

      setReportData(normalized);
    } catch (error) {
      console.error("Failed to fetch report:", error);
      const message =
        error.response?.data?.message ||
        error.response?.data?.title ||
        "Unable to fetch report data.";
      toast.error(message);
      setReportData([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="report-page">
      <h2 className="report-title">📊 Admin Reporting Suite</h2>

      <div className="report-filters">
        <label htmlFor="report-select">Select Report</label>
        <select
          id="report-select"
          value={selectedReport}
          onChange={(event) => {
            setSelectedReport(event.target.value);
            resetFilters();
          }}
        >
          <option value="">-- Choose Report --</option>
          {reportOptions.map((option) => (
            <option value={option.key} key={option.key}>
              {option.label}
            </option>
          ))}
        </select>

        <div className="dynamic-filters">
          {dateReports.has(selectedReport) && (
            <>
              <input
                type="date"
                name="from"
                value={filters.from}
                onChange={handleFilterChange}
              />
              <input
                type="date"
                name="to"
                value={filters.to}
                onChange={handleFilterChange}
              />
            </>
          )}

          {statusReports.has(selectedReport) && (
            <input
              type="text"
              placeholder="Status (Pending, Approved...)"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
            />
          )}

          {paymentTypeReports.has(selectedReport) && (
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

          {userScopedReports.has(selectedReport) && (
            <input
              type="text"
              placeholder="Distributor/User ID"
              name={
                selectedReport === "personal-earnings"
                  ? "distributorId"
                  : "userId"
              }
              value={
                selectedReport === "personal-earnings"
                  ? filters.distributorId
                  : filters.userId
              }
              onChange={handleFilterChange}
            />
          )}

          {inventoryReports.has(selectedReport) && (
            <input
              type="number"
              min={0}
              placeholder="Reorder level"
              name="reorderLevel"
              value={filters.reorderLevel}
              onChange={handleFilterChange}
            />
          )}

          {periodReports.has(selectedReport) && (
            <select
              name="period"
              value={filters.period}
              onChange={handleFilterChange}
            >
              <option value="">Select Period</option>
              <option value="day">Daily</option>
              <option value="month">Monthly</option>
              <option value="year">Yearly</option>
            </select>
          )}
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <button className="fetch-btn" onClick={fetchReport} disabled={loading}>
            {loading ? "Loading..." : "Generate Report"}
          </button>
          <button
            type="button"
            className="fetch-btn"
            style={{ backgroundColor: "#475569" }}
            onClick={resetFilters}
            disabled={loading}
          >
            Reset
          </button>
        </div>
      </div>

      <div className="report-results">
        {formattedData.rows.length ? (
          <table className="report-table">
            <thead>
              <tr>
                {formattedData.columns.map((column) => (
                  <th key={column}>
                    {column.replace(/([A-Z])/g, " $1").toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {formattedData.rows.map((row) => (
                <tr key={row.key}>
                  {row.values.map((value, index) => (
                    <td key={`${row.key}-${formattedData.columns[index]}`}>
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ marginTop: "20px" }}>
            Select a report and filters to view data.
          </p>
        )}
      </div>
    </div>
  );
};

export default AdminReports;
