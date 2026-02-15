import React, { useEffect, useMemo, useState } from "react";
import { FaSync, FaEye } from "react-icons/fa";
import baseApi from "../Components/Constants/baseApi";
import "../styles/AdminManagement.css";
import { toast } from "sonner";

const statusOptions = ["All", "Pending", "Paid", "Approved", "Rejected"];
const assetBaseUrl =
  baseApi.defaults.baseURL?.replace(/\/api$/, "") ?? "http://localhost:5127";

const DetailItem = ({ label, value }) => (
  <div
    style={{
      padding: "0.65rem 0.85rem",
      borderRadius: 8,
      background: "#f8fafc",
      border: "1px solid #e2e8f0",
    }}
  >
    <p style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "#94a3b8" }}>
      {label}
    </p>
    <p style={{ fontWeight: 600, color: "#0f172a", marginTop: 4 }}>{value}</p>
  </div>
);

const AdminWithdrawals = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("All");
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailRequest, setDetailRequest] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editRequest, setEditRequest] = useState(null);
  const [editForm, setEditForm] = useState({
    status: "",
    referenceNumber: "",
    remarks: "",
    proof: null,
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const [proofUpdateSaving, setProofUpdateSaving] = useState(false);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const { data } = await baseApi.get("/withdrawals");
      const list = Array.isArray(data) ? data : [];
      const sorted = [...list].sort((a, b) => {
        const aDate = a.requestDate;
        const bDate = b.requestDate;
        return new Date(bDate || 0) - new Date(aDate || 0);
      });
      setRequests(sorted);
    } catch (error) {
      console.error("Failed to load withdrawal requests:", error);
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.title ||
          "Unable to fetch withdrawal requests."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const filteredRequests = useMemo(() => {
    if (filterStatus === "All") return requests;
    return requests.filter(
      (request) => request.status?.toLowerCase() === filterStatus.toLowerCase()
    );
  }, [requests, filterStatus]);

  const handleRefresh = () => {
    if (!loading) {
      loadRequests();
    }
  };

  const openDetailModal = (request) => {
    setDetailRequest(request);
    setDetailModalOpen(true);
  };

  const handleViewDetails = (id) => {
    const match = requests.find((req) => req.id === id);
    if (!match) {
      toast.error("Unable to load withdrawal details. Please refresh and try again.");
      return;
    }
    openDetailModal(match);
  };

  const closeDetailModal = () => {
    setDetailModalOpen(false);
    setDetailRequest(null);
  };

  const openEditModal = (request) => {
    const isPending = request.status?.toLowerCase() === "pending";
    setEditRequest(request);
    setEditForm({
      status: isPending ? "" : request.status,
      referenceNumber: request.paymentReferenceNumber || "",
      remarks: request.remarks || "",
      proof: null,
    });
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditRequest(null);
    setEditForm({
      status: "",
      referenceNumber: "",
      remarks: "",
      proof: null,
    });
    setSavingEdit(false);
    setProofUpdateSaving(false);
  };

  const handleEditSave = async () => {
    if (!editRequest) return;
    if (editRequest.status?.toLowerCase() !== "pending") {
      toast.info("Only pending withdrawals can change status.");
      return;
    }

    const desiredStatus = editForm.status;
    if (!desiredStatus || desiredStatus === editRequest.status) {
      toast.info("Select a new status to update this withdrawal.");
      return;
    }

    setSavingEdit(true);
    try {
      if (desiredStatus.toLowerCase() === "paid") {
        if (!editForm.proof) {
          toast.error("Payment proof is required to mark this withdrawal as paid.");
          setSavingEdit(false);
          return;
        }

        const payload = new FormData();
        payload.append("amount", editRequest.amount);
        if (editForm.referenceNumber)
          payload.append("referenceNumber", editForm.referenceNumber);
        if (editForm.remarks) payload.append("remarks", editForm.remarks);
        payload.append("proof", editForm.proof);

        await baseApi.put(`/withdrawals/${editRequest.id}/approve`, payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Withdrawal marked as paid.");
      } else if (desiredStatus.toLowerCase() === "rejected") {
        await baseApi.put(
          `/withdrawals/${editRequest.id}/reject`,
          editForm.remarks || ""
        );
        toast.success("Withdrawal rejected.");
      } else {
        toast.info("Only Paid or Rejected statuses can be applied.");
        setSavingEdit(false);
        return;
      }

      await loadRequests();
      closeEditModal();
    } catch (error) {
      console.error("Failed to update withdrawal:", error);
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.title ||
          "Unable to update the withdrawal."
      );
      setSavingEdit(false);
    }
  };

  const handleProofUpdate = async () => {
    if (!editRequest) return;
    if (editRequest.status?.toLowerCase() !== "paid") {
      toast.info("Only paid withdrawals allow proof replacement.");
      return;
    }
    if (!editForm.proof) {
      toast.error("Please select an image to upload.");
      return;
    }

    const payload = new FormData();
    payload.append("proof", editForm.proof);
    if (editForm.referenceNumber)
      payload.append("referenceNumber", editForm.referenceNumber);
    if (editForm.remarks) payload.append("remarks", editForm.remarks);

    setProofUpdateSaving(true);
    try {
      await baseApi.put(`/withdrawals/${editRequest.id}/payment-proof`, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Payment proof updated.");
      await loadRequests();
      closeEditModal();
    } catch (error) {
      console.error("Failed to update payment proof:", error);
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.title ||
          "Unable to update payment proof."
      );
      setProofUpdateSaving(false);
    }
  };

  const buildProofUrl = (path) => {
    if (!path) return null;
    return path.startsWith("http") ? path : `${assetBaseUrl}${path}`;
  };

  const detailProofUrl = detailRequest ? buildProofUrl(detailRequest.paymentProofUrl) : null;
  const editProofUrl = editRequest ? buildProofUrl(editRequest.paymentProofUrl) : null;
  const editStatus = editRequest?.status?.toLowerCase();
  const isPendingEdit = editStatus === "pending";
  const isPaidEdit = editStatus === "paid";

  return (
    <div className="management-page">
      <div className="management-toolbar">
        <h2>💸 Withdrawal Requests</h2>
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
          <button
            type="button"
            className="btn-secondary"
            onClick={handleRefresh}
            disabled={loading}
          >
            <FaSync className={loading ? "btn-icon-spin" : ""} />
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      <div className="management-card">
        <h3>All Requests</h3>
        {loading ? (
          <p>Loading withdrawal requests...</p>
        ) : filteredRequests.length ? (
          <div style={{ overflowX: "auto" }}>
            <table className="management-table">
              <thead>
                <tr>
                  <th>Distributor</th>
                  <th>Email</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Payment Status</th>
                  <th>Reference</th>
                  <th>Proof</th>
                  <th>Requested At</th>
                  <th>Remarks</th>
                  <th style={{ width: "220px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((request) => {
                  const requestedAt = request.requestDate
                    ? new Date(request.requestDate).toLocaleString()
                    : "—";
                  const status = request.status || "Pending";
                  const isPending = status.toLowerCase() === "pending";
                  const proofUrl = buildProofUrl(request.paymentProofUrl);
                  const paymentStatus = request.paymentStatus || "Not Recorded";
                  const reference = request.paymentReferenceNumber || "—";
                  const paidAt = request.paidAt
                    ? new Date(request.paidAt).toLocaleString()
                    : null;
                  return (
                    <tr key={request.id}>
                      <td>{request.distributorName}</td>
                      <td>{request.distributorEmail}</td>
                      <td>Rs. {Number(request.amount || 0).toLocaleString()}</td>
                      <td style={{ textTransform: "capitalize" }}>{status}</td>
                      <td>
                        {paymentStatus}
                        {paidAt && (
                          <div style={{ fontSize: "0.85rem", color: "#64748b" }}>
                            Paid at: {paidAt}
                          </div>
                        )}
                      </td>
                      <td>{reference}</td>
                      <td>
                        {proofUrl ? (
                          <img
                            src={proofUrl}
                            alt="Payment proof"
                            style={{
                              width: 64,
                              height: 64,
                              objectFit: "cover",
                              borderRadius: 8,
                              border: "1px solid #e2e8f0",
                            }}
                          />
                        ) : (
                          "—"
                        )}
                      </td>
                      <td>{requestedAt}</td>
                      <td>{request.remarks || "—"}</td>
                      <td>
                        <div className="management-actions" style={{ gap: "8px" }}>
                          <button
                            type="button"
                            className="btn-outline"
                            onClick={() => handleViewDetails(request.id)}
                          >
                            <FaEye /> View
                          </button>
                          <button
                            type="button"
                            className="btn-primary"
                            onClick={() => openEditModal(request)}
                          >
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No withdrawal requests found.</p>
        )}
      </div>

      {detailModalOpen && detailRequest && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: 720, width: "100%" }}>
            <h3 style={{ marginBottom: "0.5rem" }}>Withdrawal Details</h3>
            <p style={{ color: "#64748b", marginBottom: "1.25rem" }}>
              Request #{detailRequest.id} • {detailRequest.distributorName}
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "12px",
                marginBottom: "1rem",
              }}
            >
              <DetailItem label="Distributor Email" value={detailRequest.distributorEmail} />
              <DetailItem
                label="Amount"
                value={`Rs. ${Number(detailRequest.amount || 0).toLocaleString()}`}
              />
              <DetailItem label="Status" value={detailRequest.status} />
              <DetailItem label="Payment Status" value={detailRequest.paymentStatus || "Not Recorded"} />
              <DetailItem label="Reference" value={detailRequest.paymentReferenceNumber || "—"} />
              <DetailItem
                label="Requested At"
                value={detailRequest.requestDate ? new Date(detailRequest.requestDate).toLocaleString() : "—"}
              />
              <DetailItem
                label="Processed At"
                value={detailRequest.processedDate ? new Date(detailRequest.processedDate).toLocaleString() : "—"}
              />
              <DetailItem label="Remarks" value={detailRequest.remarks || "—"} />
            </div>
            {detailProofUrl ? (
              <div style={{ marginBottom: "1.25rem" }}>
                <p style={{ fontWeight: 600, marginBottom: "0.5rem" }}>Payment Proof</p>
                <img
                  src={detailProofUrl}
                  alt="Payment proof"
                  style={{
                    width: "100%",
                    maxHeight: 360,
                    objectFit: "contain",
                    borderRadius: 12,
                    border: "1px solid #e2e8f0",
                    background: "#fff",
                  }}
                />
              </div>
            ) : (
              <p style={{ color: "#94a3b8", marginBottom: "1.25rem" }}>
                No payment proof uploaded yet.
              </p>
            )}
            <div className="modal-actions">
              <button type="button" onClick={closeDetailModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {editModalOpen && editRequest && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: 520, width: "100%" }}>
            <h3 style={{ marginBottom: "0.25rem" }}>Edit Withdrawal</h3>
            <p style={{ color: "#64748b", marginBottom: "1rem" }}>
              Current status: <strong>{editRequest.status}</strong>
            </p>
            {isPendingEdit ? (
              <>
                <label style={{ fontWeight: 600, marginBottom: "0.25rem" }}>
                  Update Status
                </label>
                <select
                  value={editForm.status}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, status: e.target.value }))
                  }
                  style={{
                    width: "100%",
                    borderRadius: 10,
                    border: "1px solid #e2e8f0",
                    padding: "0.65rem 0.85rem",
                    marginBottom: "1rem",
                  }}
                >
                  <option value="">Select new status</option>
                  <option value="Paid">Mark as Paid</option>
                  <option value="Rejected">Reject</option>
                </select>

                <label style={{ fontWeight: 600, marginBottom: "0.25rem" }}>
                  Reference Number (optional)
                </label>
                <input
                  type="text"
                  value={editForm.referenceNumber}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      referenceNumber: e.target.value,
                    }))
                  }
                  style={{
                    width: "100%",
                    borderRadius: 10,
                    border: "1px solid #e2e8f0",
                    padding: "0.65rem 0.85rem",
                    marginBottom: "1rem",
                  }}
                />

                <label style={{ fontWeight: 600, marginBottom: "0.25rem" }}>
                  Remarks
                </label>
                <textarea
                  rows={3}
                  value={editForm.remarks}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, remarks: e.target.value }))
                  }
                  style={{
                    width: "100%",
                    borderRadius: 10,
                    border: "1px solid #e2e8f0",
                    padding: "0.65rem 0.85rem",
                    marginBottom: "1rem",
                  }}
                />

                {editForm.status === "Paid" && (
                  <>
                    <label style={{ fontWeight: 600, marginBottom: "0.25rem" }}>
                      Payment Proof (image)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) =>
                        setEditForm((prev) => ({
                          ...prev,
                          proof: event.target.files?.[0] || null,
                        }))
                      }
                      style={{
                        width: "100%",
                        borderRadius: 10,
                        border: "1px solid #e2e8f0",
                        padding: "0.5rem",
                        marginBottom: "1rem",
                      }}
                    />
                  </>
                )}

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={handleEditSave}
                    disabled={savingEdit}
                  >
                    {savingEdit ? "Saving..." : "Save"}
                  </button>
                  <button type="button" className="btn-outline" onClick={closeEditModal}>
                    Cancel
                  </button>
                </div>
              </>
            ) : isPaidEdit ? (
              <>
                <p style={{ color: "#64748b", marginBottom: "1rem" }}>
                  Upload a new payment proof image to replace the existing screenshot.
                </p>
                {editProofUrl ? (
                  <div style={{ marginBottom: "1rem" }}>
                    <p style={{ fontWeight: 600, marginBottom: "0.4rem" }}>Current Proof</p>
                    <img
                      src={editProofUrl}
                      alt="Current proof"
                      style={{
                        width: "100%",
                        maxHeight: 300,
                        objectFit: "contain",
                        borderRadius: 12,
                        border: "1px solid #e2e8f0",
                      }}
                    />
                  </div>
                ) : null}

                <label style={{ fontWeight: 600, marginBottom: "0.25rem" }}>
                  Reference Number (optional)
                </label>
                <input
                  type="text"
                  value={editForm.referenceNumber}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      referenceNumber: e.target.value,
                    }))
                  }
                  style={{
                    width: "100%",
                    borderRadius: 10,
                    border: "1px solid #e2e8f0",
                    padding: "0.65rem 0.85rem",
                    marginBottom: "1rem",
                  }}
                />

                <label style={{ fontWeight: 600, marginBottom: "0.25rem" }}>
                  Remarks (optional)
                </label>
                <textarea
                  rows={3}
                  value={editForm.remarks}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, remarks: e.target.value }))
                  }
                  style={{
                    width: "100%",
                    borderRadius: 10,
                    border: "1px solid #e2e8f0",
                    padding: "0.65rem 0.85rem",
                    marginBottom: "1rem",
                  }}
                />

                <label style={{ fontWeight: 600, marginBottom: "0.25rem" }}>
                  New Payment Proof
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) =>
                    setEditForm((prev) => ({
                      ...prev,
                      proof: event.target.files?.[0] || null,
                    }))
                  }
                  style={{
                    width: "100%",
                    borderRadius: 10,
                    border: "1px solid #e2e8f0",
                    padding: "0.5rem",
                    marginBottom: "1rem",
                  }}
                />

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={handleProofUpdate}
                    disabled={proofUpdateSaving}
                  >
                    {proofUpdateSaving ? "Uploading..." : "Replace Proof"}
                  </button>
                  <button type="button" className="btn-outline" onClick={closeEditModal}>
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <p style={{ color: "#94a3b8", marginBottom: "1.25rem" }}>
                  Only pending withdrawals can change status, and only paid withdrawals can replace
                  their proof.
                </p>
                <div className="modal-actions">
                  <button type="button" className="btn-outline" onClick={closeEditModal}>
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminWithdrawals;
