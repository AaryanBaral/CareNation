import React, { useEffect, useState } from "react";
import { FaSync } from "react-icons/fa";
import baseApi from "../Components/Constants/baseApi";
import "../styles/AdminManagement.css";
import { toast } from "sonner";

const AdminBalanceTransfers = () => {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadTransfers = async () => {
    setLoading(true);
    try {
      const { data } = await baseApi.get("/balance-transfer/all");
      const list = Array.isArray(data) ? data : [];
      const sorted = [...list].sort((a, b) => {
        const aDate = a.transferDate;
        const bDate = b.transferDate;
        return new Date(bDate || 0) - new Date(aDate || 0);
      });
      setTransfers(sorted);
    } catch (error) {
      console.error("Failed to fetch balance transfers:", error);
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.title ||
          "Unable to fetch balance transfers."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransfers();
  }, []);

  return (
    <div className="management-page">
      <div className="management-toolbar">
        <h2>🔁 Balance Transfers</h2>
        <button type="button" className="btn-secondary" onClick={loadTransfers}>
          <FaSync /> Refresh
        </button>
      </div>

      <div className="management-card">
        <h3>Transfer History</h3>
        {loading ? (
          <p>Loading balance transfers...</p>
        ) : transfers.length ? (
          <div style={{ overflowX: "auto" }}>
            <table className="management-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Sender</th>
                  <th>Receiver</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {transfers.map((transfer) => (
                  <tr key={transfer.id}>
                    <td>#{transfer.id}</td>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span>{transfer.senderName || "—"}</span>
                        <span style={{ fontSize: "0.8rem", opacity: 0.7 }}>{transfer.senderId}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span>{transfer.receiverName || "—"}</span>
                        <span style={{ fontSize: "0.8rem", opacity: 0.7 }}>{transfer.receiverId}</span>
                      </div>
                    </td>
                    <td>Rs. {Number(transfer.amount || 0).toLocaleString()}</td>
                    <td>
                      {transfer.transferDate
                        ? new Date(transfer.transferDate).toLocaleString()
                        : "—"}
                    </td>
                    <td>{transfer.remarks || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No balance transfers recorded.</p>
        )}
      </div>
    </div>
  );
};

export default AdminBalanceTransfers;
