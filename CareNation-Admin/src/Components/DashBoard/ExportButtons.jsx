import React from "react";
import "../../styles/App.css";

function ExportButtons() {
  const handleExport = (type) => {
    alert(`Exporting data as ${type} (mock action)`);
  };

  return (
    <div className="card export-buttons-card">
      <h3 className="export-title">📤 Export Reports</h3>
      <div className="export-buttons">
        <button
          className="export-btn export-btn-csv"
          onClick={() => handleExport("CSV")}
        >
          📄 Export CSV
        </button>
        <button
          className="export-btn export-btn-pdf"
          onClick={() => handleExport("PDF")}
        >
          📕 Export PDF
        </button>
      </div>
    </div>
  );
}

export default ExportButtons;
