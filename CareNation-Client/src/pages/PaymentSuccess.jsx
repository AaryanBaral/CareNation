import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "../style/PaymentSuccess.css";
import baseApi from "../Constants/baseApi";

const formatDateTime = (value) => {
  if (!value) return "Not available";
  const date = new Date(value); 
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
};

const formatAmount = (amount) => {
  if (amount === null || amount === undefined) return "Not available";
  const numeric = Number(amount);
  if (!Number.isFinite(numeric)) return amount;
  return `Rs ${numeric.toFixed(2)}`;
};

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const orderId = searchParams.get("orderId");
  const pidx = searchParams.get("pidx") || "";
  const status = searchParams.get("status") || "";
  const amount = searchParams.get("amount") || "";
  const purchaseOrderId = searchParams.get("purchaseOrderId") || "";

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");

  useEffect(() => {
    if (!orderId) return;
    setLoading(true);
    setError("");
    baseApi
      .get(`order/${orderId}`)
      .then((res) => {
        setOrder(res.data?.data || null);
      })
      .catch((err) => {
        setError(
          err.response?.data?.message ||
            err.response?.data?.title ||
            "Unable to load order details."
        );
      })
      .finally(() => setLoading(false));
  }, [orderId]);

  const items = order?.items || [];

  const amountDisplay = useMemo(
    () => formatAmount(amount || order?.totalAmount),
    [amount, order?.totalAmount]
  );

  const handleDownloadReceipt = useCallback(async () => {
    setDownloadError("");
    setDownloading(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();
      let currentY = 20;
      const marginX = 14;
      const tableWidth = doc.internal.pageSize.getWidth() - marginX * 2;

      doc.setFontSize(16);
      doc.text("CareNation Store", marginX, currentY);
      doc.setFontSize(11);
      doc.text("Payment Receipt", marginX, currentY + 7);
      doc.text(`Generated: ${new Date().toLocaleString()}`, marginX, currentY + 14);

      currentY += 24;

      const drawSection = (title, rows) => {
        doc.setFontSize(12);
        doc.setFont(undefined, "bold");
        doc.text(title, marginX, currentY);
        currentY += 6;
        doc.setFontSize(10);
        doc.setFont(undefined, "normal");

        rows.forEach(([label, value]) => {
          doc.text(`${label}:`, marginX, currentY);
          doc.text(String(value), marginX + 60, currentY);
          currentY += 6;
        });

        currentY += 6;
      };

      drawSection("Payment Details", [
        ["Order ID", orderId || "Not available"],
        ["Purchase Order", purchaseOrderId || "--"],
        ["Payment Ref (pidx)", pidx || "--"],
        ["Status", status || "Completed"],
        ["Amount", amountDisplay],
        ["Paid On", formatDateTime(order?.orderDate)],
      ]);

      drawSection(
        "Items",
        items.length
          ? items.map((item) => [
              item.productName,
              `Qty: ${item.quantity}  •  Rs ${item.price.toFixed(2)}`,
            ])
          : [["Items", "Not available"]]
      );

      doc.save(`payment-receipt-${purchaseOrderId || orderId || "order"}.pdf`);
    } catch (err) {
      setDownloadError(err?.message || "Unable to generate receipt.");
    } finally {
      setDownloading(false);
    }
  }, [amountDisplay, items, orderId, purchaseOrderId, pidx, status, order?.orderDate]);

  return (
    <div className="payment-success-page">
      <div className="payment-card">
        <h1>Payment Successful</h1>
        <p className="subtext">
          Thank you for your purchase. Your payment has been confirmed.
        </p>

        <div className="payment-summary">
          <div>
            <span>Order ID</span>
            <strong>{orderId || "—"}</strong>
          </div>
          <div>
            <span>Payment Reference (pidx)</span>
            <strong>{pidx || "—"}</strong>
          </div>
          <div>
            <span>Amount</span>
            <strong>{amountDisplay}</strong>
          </div>
          <div>
            <span>Status</span>
            <strong className="status">{status || "Completed"}</strong>
          </div>
          <div>
            <span>Paid On</span>
            <strong>{formatDateTime(order?.orderDate)}</strong>
          </div>
        </div>

        {loading && <p>Loading order details…</p>}
        {error && <p className="error-text">{error}</p>}

        {!!items.length && (
          <div className="item-list">
            <h3>Items</h3>
            {items.map((item) => (
              <div key={item.id} className="item-row">
                <span>{item.productName}</span>
                <span>x{item.quantity}</span>
                <span>Rs {item.price.toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}

        {downloadError && <p className="error-text">{downloadError}</p>}

        <div className="actions">
          <button onClick={() => navigate("/")}>Continue Shopping</button>
          <button onClick={handleDownloadReceipt} disabled={downloading}>
            {downloading ? "Preparing..." : "Download Receipt"}
          </button>
        </div>
      </div>
    </div>
  );
}
