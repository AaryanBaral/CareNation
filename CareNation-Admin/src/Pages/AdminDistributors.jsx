import React, { useEffect, useRef, useState } from "react";
import { FaExternalLinkAlt, FaEye, FaSync } from "react-icons/fa";
import baseApi from "../Components/Constants/baseApi";
import "../styles/AdminManagement.css";
import { toast } from "sonner";

const AdminDistributors = () => {
  const [distributors, setDistributors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [openingId, setOpeningId] = useState(null);
  const sessionIdRef = useRef(null);
  const portalWindowRef = useRef(null);

  const loadDistributors = async () => {
    setLoading(true);
    try {
      const { data } = await baseApi.get("/distributor");
      const list = Array.isArray(data) ? data : [];
      setDistributors(list);
    } catch (error) {
      console.error("Failed to fetch distributors:", error);
      toast.error(
        error.response?.data?.message ||
          "Unable to fetch distributors. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDistributors();
  }, []);

  const safeOpenInNewTab = (urlStr) => {
    // Primary: programmatic <a> with rel=noopener noreferrer (most reliable across browsers)
    const a = document.createElement("a");
    a.href = urlStr;
    a.target = "_blank";
    a.rel = "noopener noreferrer"; // ensures new tab CAN'T touch opener
    // Required in some browsers to allow programmatic clicks
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Defensive fallback: try severing the opener if the browser still gave one
    const w = window.open("", "_blank"); // may return the last created tab/window
    if (w && w.opener) {
      try {
        w.opener = null;
      } catch {}
    }
  };

  const viewPortal = async (distributor) => {
    setOpeningId(distributor.id);

    const previousSession = sessionIdRef.current;
    const impersonationSession = `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}`;
    sessionIdRef.current = impersonationSession;

    try {
      const { data } = await baseApi.post(
        "/auth/impersonation/start",
        {
          targetUserId: distributor.id,
          reason: "View distributor portal",
          returnUrl: `${window.location.origin}/distributors`,
        },
        { headers: { "X-Impersonation-Session": impersonationSession } }
      );

      const { code, distributorImpersonationUrl } = data || {};
      if (!code || !distributorImpersonationUrl) {
        throw new Error("Failed to start impersonation session.");
      }

      const url = new URL(distributorImpersonationUrl);
      url.pathname = "/impersonation";
      url.searchParams.set("code", code);
      url.searchParams.set("returnUrl", window.location.origin);
      url.searchParams.set("nonce", impersonationSession);
      url.searchParams.set("sessionId", impersonationSession);
      if (previousSession) url.searchParams.set("prevSession", previousSession);

      // 🔒 Open without giving the new tab any access to this one
      safeOpenInNewTab(url.toString());
    } catch (error) {
      console.error("Failed to open distributor portal:", error);
      toast.error(
        error.response?.data?.message ||
          "Unable to open distributor portal. Please try again."
      );
    } finally {
      setOpeningId(null);
    }
  };

  return (
    <div className="management-page">
      <div className="management-toolbar">
        <h2>🛡️ Distributors</h2>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontWeight: 600, color: "#1e293b" }}>
            Total distributors: {distributors.length}
          </span>
          <button
            type="button"
            className="btn-secondary"
            onClick={loadDistributors}
          >
            <FaSync /> Refresh
          </button>
        </div>
      </div>

      <div className="management-card">
        <h3>Registered Distributors</h3>
        {loading ? (
          <p>Loading distributors...</p>
        ) : distributors.length ? (
          <div style={{ overflowX: "auto" }}>
            <table className="management-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Referral</th>
                  <th>Wallet</th>
                  <th style={{ width: "100px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {distributors.map((distributor) => (
                  <tr key={distributor.id}>
                    <td>
                      {[
                        distributor.firstName,
                        distributor.middleName,
                        distributor.lastName,
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    </td>
                    <td>{distributor.email}</td>
                    <td>{distributor.phoneNumber}</td>
                    <td>{distributor.referalId}</td>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span>
                          Total: Rs.{" "}
                          {Number(
                            distributor.totalWallet || 0
                          ).toLocaleString()}
                        </span>
                        <span style={{ opacity: 0.8 }}>
                          Left: Rs.{" "}
                          {Number(distributor.leftWallet || 0).toLocaleString()}{" "}
                          | Right: Rs.{" "}
                          {Number(
                            distributor.rightWallet || 0
                          ).toLocaleString()}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="management-actions">
                        <button
                          type="button"
                          className="btn-outline"
                          onClick={() => viewPortal(distributor)}
                          disabled={openingId === distributor.id}
                        >
                          <FaExternalLinkAlt /> View Portal
                        </button>
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => setSelected(distributor)}
                        >
                          <FaEye /> View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No distributors available.</p>
        )}
      </div>

      {selected && (
        <div
          className="form-overlay"
          role="dialog"
          aria-modal="true"
          onClick={(event) => {
            if (event.target === event.currentTarget) setSelected(null);
          }}
        >
          <div className="form-panel" style={{ maxWidth: "720px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "12px",
              }}
            >
              <h3>Distributor Profile</h3>
              <button
                type="button"
                className="btn-outline"
                onClick={() => setSelected(null)}
                style={{ color: "#e2e8f0" }}
              >
                Close
              </button>
            </div>

            <div
              className="form-grid"
              style={{
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              }}
            >
              <InfoBlock
                label="Name"
                value={[
                  selected.firstName,
                  selected.middleName,
                  selected.lastName,
                ]
                  .filter(Boolean)
                  .join(" ")}
              />
              <InfoBlock label="Email" value={selected.email} />
              <InfoBlock label="Phone" value={selected.phoneNumber} />
              <InfoBlock label="Role" value={selected.role} />
              <InfoBlock label="Referral ID" value={selected.referalId} />
              <InfoBlock label="Parent ID" value={selected.parentId} />
              <InfoBlock
                label="Citizenship No."
                value={selected.citizenshipNo}
              />
              <InfoBlock label="DOB" value={selected.dob} />
            </div>

            <div
              className="form-grid"
              style={{
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              }}
            >
              <InfoBlock
                label="Total Wallet"
                value={`Rs. ${Number(
                  selected.totalWallet || 0
                ).toLocaleString()}`}
              />
              <InfoBlock
                label="Left Wallet"
                value={`Rs. ${Number(
                  selected.leftWallet || 0
                ).toLocaleString()}`}
              />
              <InfoBlock
                label="Right Wallet"
                value={`Rs. ${Number(
                  selected.rightWallet || 0
                ).toLocaleString()}`}
              />
              <InfoBlock
                label="Total Commission"
                value={`Rs. ${Number(
                  selected.totalcomission || 0
                ).toLocaleString()}`}
              />
            </div>

            <div
              className="form-grid"
              style={{
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              }}
            >
              <InfoBlock label="Account Name" value={selected.accountName} />
              <InfoBlock
                label="Account Number"
                value={selected.accountNumber}
              />
              <InfoBlock label="Bank Name" value={selected.bankName} />
              <InfoBlock label="Bank Branch" value={selected.bankBranchName} />
            </div>

            <div
              className="form-grid"
              style={{
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              }}
            >
              <InfoBlock label="Nominee" value={selected.nomineeName} />
              <InfoBlock
                label="Nominee Relation"
                value={selected.nomineeRelation}
              />
              <InfoBlock label="VAT/PAN Name" value={selected.vatPanName} />
              <InfoBlock
                label="VAT/PAN Number"
                value={selected.vatPanRegistrationNumber}
              />
            </div>

            <div className="form-field">
              <label>Permanent Address</label>
              <div
                style={{
                  padding: "12px",
                  borderRadius: "12px",
                  border: "1px solid rgba(148, 163, 184, 0.25)",
                  background: "rgba(15, 23, 42, 0.35)",
                }}
              >
                {selected.permanentFullAddress}
              </div>
            </div>

            {selected.citizenshipImageUrl && (
              <div className="form-field">
                <label>Citizenship Document</label>
                <a
                  href={selected.citizenshipImageUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "#38bdf8" }}
                >
                  View uploaded file
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const InfoBlock = ({ label, value }) => (
  <div className="form-field">
    <label style={{ color: "#94a3b8" }}>{label}</label>
    <span style={{ fontWeight: 600, color: "#e2e8f0" }}>{value || "—"}</span>
  </div>
);

export default AdminDistributors;
