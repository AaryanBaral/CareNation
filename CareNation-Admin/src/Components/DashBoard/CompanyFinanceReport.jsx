import React from "react";
import "../../styles/App.css";

function CompanyFinanceReport() {
  return (
    <div className="card">
      <h3>💰 Company Finance Report</h3>
      <table style={{ width: "100%", marginTop: "10px", borderCollapse: "collapse" }}>
        <tbody>
          <tr>
            <td style={{ padding: "8px 0", fontWeight: "500" }}>Total Revenue</td>
            <td style={{ textAlign: "right" }}>Rs. 15,00,000</td>
          </tr>
          <tr>
            <td style={{ padding: "8px 0", fontWeight: "500" }}>Expenses</td>
            <td style={{ textAlign: "right" }}>Rs. 6,50,000</td>
          </tr>
          <tr style={{ borderTop: "1px solid #ccc" }}>
            <td style={{ padding: "8px 0", fontWeight: "700" }}>Net Profit</td>
            <td style={{ textAlign: "right", fontWeight: "700" }}>Rs. 8,50,000</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default CompanyFinanceReport;
