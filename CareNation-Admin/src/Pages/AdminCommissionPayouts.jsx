import React, { useEffect, useMemo, useState } from "react";
import { FaSync } from "react-icons/fa";
import baseApi from "../Components/Constants/baseApi";
import "../styles/AdminManagement.css";
import { toast } from "sonner";

const AdminCommissionPayouts = () => {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadPayouts = async () => {
    setLoading(true);
    try {
      let list = [];
      try {
        const { data } = await baseApi.get("/commissionpayout");
        list = Array.isArray(data) ? data : [];
      } catch (innerError) {
        const status = innerError.response?.status;
        if (status === 401 || status === 403 || status === 404 || status === 500) {
          const { data } = await baseApi.get("/reports/commission-payouts");
          list = Array.isArray(data) ? data : [];
        } else {
          throw innerError;
        }
      }
      const sorted = [...list].sort((a, b) => {
        const aDate = a.payoutDate;
        const bDate = b.payoutDate;
        return new Date(bDate || 0) - new Date(aDate || 0);
      });
      setPayouts(sorted);
    } catch (error) {
      console.error("Failed to load commission payouts:", error);
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.title ||
          "Unable to fetch commission payouts."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayouts();
  }, []);

  const totalPaid = useMemo(
    () =>
      payouts
        .filter((p) => (p.status || "").toLowerCase() === "paid")
        .reduce((sum, p) => sum + Number(p.amount || 0), 0),
    [payouts]
  );

  return (
    <div className="management-page">
      <div className="management-toolbar">
        <h2>💼 Commission Payouts</h2>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <span style={{ fontWeight: 600 }}>
            Total Paid: Rs. {totalPaid.toLocaleString()}
          </span>
          <button type="button" className="btn-secondary" onClick={loadPayouts}>
            <FaSync /> Refresh
          </button>
        </div>
      </div>

      <div className="management-card">
        <h3>History</h3>
        {loading ? (
          <p>Loading commission payouts...</p>
        ) : payouts.length ? (
          <div style={{ overflowX: "auto" }}>
            <table className="management-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Distributor</th>
                  <th>Email</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Payout Date</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((payout) => {
                  const payoutDate = payout.payoutDate
                    ? new Date(payout.payoutDate).toLocaleDateString()
                    : "—";
                  const distributorName = payout.user
                    ? [payout.user.firstName, payout.user.lastName].filter(Boolean).join(" ")
                    : payout.distributorName || "—";
                  const distributorEmail = payout.user?.email || payout.distributorEmail || "—";
                  const distributorId = payout.userId || payout.distributorId || "—";

                  return (
                    <tr key={payout.id}>
                      <td>#{payout.id}</td>
                      <td>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <span>{distributorName}</span>
                          <span style={{ fontSize: "0.8rem", opacity: 0.7 }}>{distributorId}</span>
                        </div>
                      </td>
                      <td>{distributorEmail}</td>
                      <td>Rs. {Number(payout.amount || 0).toLocaleString()}</td>
                      <td style={{ textTransform: "capitalize" }}>{payout.status || "Pending"}</td>
                      <td>{payoutDate}</td>
                      <td>{payout.remarks || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No commission payouts found.</p>
        )}
      </div>
    </div>
  );
};

export default AdminCommissionPayouts;
