import React, { useEffect, useState, useMemo } from "react";
import baseApi from "../Components/Constants/baseApi" // adjust path if needed
import "../styles/WalletStatementPage.css"; // adjust path if needed

function formatAmount(n) {
  if (n === null || n === undefined || isNaN(Number(n))) return "—";
  const v = Number(n);
  return `Rs. ${v.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(d) {
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return "—";
  return dt.toLocaleString("en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function WalletStatementPage() {
  const [data, setData] = useState({ walletBalance: 0, transactions: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const res = await baseApi.get("/distributor/statement/me"); // baseApi should have baseURL = http://localhost:5127/api
        if (!mounted) return;
        setData({
          walletBalance: res.data?.walletBalance ?? 0,
          transactions: Array.isArray(res.data?.transactions) ? res.data.transactions : [],
        });
      } catch (err) {
        console.error("Failed to load wallet statement", err);
        setError(err?.response?.data?.message || "Failed to load wallet statement.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const rows = useMemo(() => {
    return [...(data.transactions || [])].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
  }, [data.transactions]);

  const totals = useMemo(() => {
    return rows.reduce(
      (acc, t) => {
        const amt = Number(t.amount) || 0;
        if (amt > 0) acc.income += amt;
        if (amt < 0) acc.expense += Math.abs(amt);
        return acc;
      },
      { income: 0, expense: 0 }
    );
  }, [rows]);

  if (loading) {
    return (
      <div className="ws-wrap">
        <div className="ws-balance-card skeleton">
          <div className="ws-balance-label">Final Wallet Balance</div>
          <div className="ws-balance-value">Loading…</div>
        </div>
        <div className="ws-table-wrap skeleton" style={{ padding: 20 }}>Loading statement…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ws-wrap">
        <div className="ws-balance-card error-card">
          <div className="ws-balance-label">Final Wallet Balance</div>
          <div className="ws-balance-value neg">—</div>
          <div className="ws-balance-sub">Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="ws-wrap">
      {/* Header balance card */}
      <div className="ws-balance-card">
        <div className="ws-balance-label">Final Wallet Balance</div>
        <div
          className={`ws-balance-value ${
            data.walletBalance < 0 ? "neg" : "pos"
          }`}
        >
          {formatAmount(data.walletBalance)}
        </div>
        {rows.length > 0 && (
          <div className="ws-balance-sub">
            as of {formatDate(rows[rows.length - 1].date)}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="ws-table-wrap">
        <table className="ws-table">
          <thead>
            <tr>
              <th style={{ width: "180px" }}>Date</th>
              <th>Remarks</th>
              <th style={{ width: "180px" }}>Type</th>
              <th className="num" style={{ width: "160px" }}>Income</th>
              <th className="num" style={{ width: "160px" }}>Expense</th>
              <th className="num" style={{ width: "180px" }}>Balance After</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((t, idx) => {
              const amt = Number(t.amount) || 0;
              const income = amt > 0 ? amt : null;
              const expense = amt < 0 ? Math.abs(amt) : null;
              const remarks =
                t.remarks && String(t.remarks).trim().length > 0
                  ? t.remarks
                  : "—";

              return (
                <tr key={idx}>
                  <td className="mono">{formatDate(t.date)}</td>
                  <td className="ws-remarks">{remarks}</td>
                  <td>
                    <span
                      className={
                        "ws-type " +
                        (amt > 0
                          ? "ws-type-income"
                          : amt < 0
                          ? "ws-type-expense"
                          : "ws-type-neutral")
                      }
                    >
                      {t.type}
                    </span>
                  </td>
                  <td className={"num " + (income ? "pos" : "")}>
                    {income !== null ? formatAmount(income) : "—"}
                  </td>
                  <td className={"num " + (expense ? "neg" : "")}>
                    {expense !== null ? formatAmount(expense) : "—"}
                  </td>
                  <td
                    className={
                      "num mono " + ((t.balanceAfter || 0) < 0 ? "neg" : "pos")
                    }
                  >
                    {formatAmount(t.balanceAfter)}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="ws-totals">
              <td colSpan={3} className="ws-totals-label">
                Totals
              </td>
              <td className="num pos">{formatAmount(totals.income)}</td>
              <td className="num neg">{formatAmount(totals.expense)}</td>
              <td className="num mono">{/* intentionally empty */}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
