import React, { useEffect, useState } from "react";
import { FaUsers, FaPlus, FaSearch } from "react-icons/fa";
import baseApi from "../Constants/baseApi";
import "../../styles/UserReport.css";

function UserReport() {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    salesQty: "",
  });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    baseApi
      .get("distributor/me/downline")
      .then((res) => {
        const data = (res.data || []).map((u) => ({
          id: u.id,
          name: u.fullName,
          email: u.email,
          phone: u.phoneNumber,
        }));
        setUsers(data);
      })
      .catch((err) => {
        console.log(err);
        setError("Failed to fetch users");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = () => {
    setEditingUser(null);
    setFormData({ name: "", email: "", phone: "", address: "", salesQty: "" });
  };

  const filteredUsers = users.filter(
    (u) =>
      (u.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="card">
      <div className="card-header">
        <h3>
          <FaUsers style={{ marginRight: 10 }} /> User Report
        </h3>

        <div className="toolbar">
          <button onClick={handleAdd} className="btn-primary">
            <FaPlus style={{ marginRight: 6 }} /> Add User
          </button>

          {/* Search */}
          <div className="search">
            <FaSearch className="search-icon" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search by name or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
              aria-label="Search users"
            />
          </div>
        </div>
      </div>

      {loading && <div className="loading">Loading…</div>}
      {error && <div className="error">{error}</div>}

      <div className="table-wrap">
        <table className="user-report-table">
          <thead>
            <tr>
              <th style={{ minWidth: 180 }}>Name</th>
              <th style={{ minWidth: 220 }}>Email</th>
              <th style={{ minWidth: 140 }}>Phone</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 && !loading ? (
              <tr>
                <td colSpan={3} className="empty">
                  No users found
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td className="cell-name">{user.name || "—"}</td>
                  <td className="cell-email">{user.email || "—"}</td>
                  <td className="cell-phone">{user.phone || "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UserReport;
