import React, { useEffect, useMemo, useState } from "react";
import { FaCheck, FaSync, FaTimes } from "react-icons/fa";
import baseApi from "../Components/Constants/baseApi";
import "../styles/AdminManagement.css";
import { toast } from "sonner";

const statusOptions = ["All", "Pending", "Delivered", "Cancelled"];
const statusLabel = (status) => {
  if (typeof status === "number") {
    switch (status) {
      case 0:
        return "Cancelled";
      case 1:
        return "Delivered";
      case 2:
        return "Pending";
      default:
        return "Pending";
    }
  }
  if (!status) return "Pending";
  const normalized = String(status).toLowerCase();
  if (normalized.includes("pending")) return "Pending";
  if (normalized.includes("deliver")) return "Delivered";
  if (normalized.includes("cancel")) return "Cancelled";
  return status;
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("All");
  const [processingId, setProcessingId] = useState(null);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const { data } = await baseApi.get("/order/all");
      const list = Array.isArray(data?.data) ? data.data : [];
      const sorted = [...list].sort((a, b) => {
        const aDate = a.orderDate || a.createdAt;
        const bDate = b.orderDate || b.createdAt;
        return new Date(bDate || 0) - new Date(aDate || 0);
      });
      setOrders(sorted);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.title ||
          "Unable to fetch orders."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    if (filterStatus === "All") return orders;
    return orders.filter(
      (order) => statusLabel(order.status).toLowerCase() === filterStatus.toLowerCase()
    );
  }, [orders, filterStatus]);

  const handleAction = async (orderId, action) => {
    const verb = action === "approve" ? "approve" : "reject";
    setProcessingId(orderId);

    try {
      await baseApi.post(`/order/${action}/${orderId}`);
      toast.success(`Order ${verb}d.`);
      await loadOrders();
    } catch (error) {
      console.error(`Failed to ${verb} order:`, error);
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.title ||
          `Unable to ${verb} the order.`
      );
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="management-page">
      <div className="management-toolbar">
        <h2>🛍️ Orders</h2>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <select
            value={filterStatus}
            onChange={(event) => setFilterStatus(event.target.value)}
            className="btn-outline"
            style={{ padding: "8px 12px", borderRadius: "8px" }}
          >
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <button type="button" className="btn-secondary" onClick={loadOrders}>
            <FaSync /> Refresh
          </button>
        </div>
      </div>

      <div className="management-card">
        <h3>All Orders</h3>
        {loading ? (
          <p>Loading orders...</p>
        ) : filteredOrders.length ? (
          <div style={{ overflowX: "auto" }}>
            <table className="management-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>User</th>
                  <th>Status</th>
                  <th>Total Amount</th>
                  <th>Placed At</th>
                  <th>Items</th>
                  <th style={{ width: "160px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const created = order.orderDate
                    ? new Date(order.orderDate).toLocaleString()
                    : "—";
                  const label = statusLabel(order.status);
                  const isPending = label.toLowerCase() === "pending";
                  const itemCount = Array.isArray(order.items) ? order.items.length : 0;
                  const userName = order.user
                    ? [order.user.firstName, order.user.lastName].filter(Boolean).join(" ")
                    : "";
                  return (
                    <tr key={order.id}>
                      <td>#{order.id}</td>
                      <td>{userName || order.userId}</td>
                      <td style={{ textTransform: "capitalize" }}>{label}</td>
                      <td>Rs. {Number(order.totalAmount || 0).toLocaleString()}</td>
                      <td>{created}</td>
                      <td>{itemCount}</td>
                      <td>
                        {isPending ? (
                          <div className="management-actions">
                            <button
                              type="button"
                              className="btn-primary"
                              onClick={() => handleAction(order.id, "approve")}
                              disabled={processingId === order.id}
                            >
                              <FaCheck /> Approve
                            </button>
                            <button
                              type="button"
                              className="btn-danger"
                              onClick={() => handleAction(order.id, "reject")}
                              disabled={processingId === order.id}
                            >
                              <FaTimes /> Reject
                            </button>
                          </div>
                        ) : (
                          <span style={{ opacity: 0.65 }}>No actions</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No orders found.</p>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
