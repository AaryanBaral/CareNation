import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FaEdit, FaPlus, FaTrash, FaSync } from "react-icons/fa";
import baseApi from "../Components/Constants/baseApi";
import "../styles/AdminManagement.css";
import { toast } from "sonner";

const defaultVendor = {
  id: null,
  name: "",
  companyName: "",
  contactPerson: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  country: "",
  taxId: "",
  isActive: true,
};

const AdminVendors = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: defaultVendor });

  const loadVendors = async () => {
    setLoading(true);
    try {
      const { data } = await baseApi.get("/vendors");
      setVendors(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load vendors:", error);
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.title ||
          "Unable to fetch vendors."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVendors();
  }, []);

  useEffect(() => {
    if (!showForm) {
      document.body.style.overflow = "";
      return () => {};
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [showForm]);

  const openCreateForm = () => {
    setIsEditing(false);
    reset(defaultVendor);
    setShowForm(true);
  };

  const openEditForm = (vendor) => {
    setIsEditing(true);
    reset({
      id: vendor.id,
      name: vendor.name || "",
      companyName: vendor.companyName || "",
      contactPerson: vendor.contactPerson || "",
      phone: vendor.phone || "",
      email: vendor.email || "",
      address: vendor.address || "",
      city: vendor.city || "",
      country: vendor.country || "",
      taxId: vendor.taxId || "",
      isActive: vendor.isActive ?? true,
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
  };

  const onSubmit = async (values) => {
    const payload = {
      name: values.name.trim(),
      companyName: values.companyName?.trim() || null,
      contactPerson: values.contactPerson?.trim() || null,
      phone: values.phone?.trim() || null,
      email: values.email?.trim() || null,
      address: values.address?.trim() || null,
      city: values.city?.trim() || null,
      country: values.country?.trim() || null,
      taxId: values.taxId?.trim() || null,
      isActive: Boolean(values.isActive),
    };

    try {
      if (isEditing && values.id != null) {
        await baseApi.put(`/vendors/${values.id}`, payload);
        toast.success("Vendor updated.");
      } else {
        await baseApi.post("/vendors", payload);
        toast.success("Vendor created.");
      }
      await loadVendors();
      closeForm();
    } catch (error) {
      console.error("Failed to save vendor:", error);
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.title ||
          "Unable to save vendor."
      );
    }
  };

  const deleteVendor = async (id) => {
    if (!confirm("Delete this vendor?")) return;
    try {
      await baseApi.delete(`/vendors/${id}`);
      toast.success("Vendor deleted.");
      await loadVendors();
    } catch (error) {
      console.error("Failed to delete vendor:", error);
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.title ||
          "Unable to delete vendor."
      );
    }
  };

  return (
    <div className="management-page">
      <div className="management-toolbar">
        <h2>🏭 Vendors</h2>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <button type="button" className="btn-secondary" onClick={loadVendors}>
            <FaSync /> Refresh
          </button>
          <button type="button" className="btn-primary" onClick={openCreateForm}>
            <FaPlus /> Add Vendor
          </button>
        </div>
      </div>

      <div className="management-card">
        <h3>Vendor Directory</h3>
        {loading ? (
          <p>Loading vendors...</p>
        ) : vendors.length ? (
          <div style={{ overflowX: "auto" }}>
            <table className="management-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Company</th>
                  <th>Contact Person</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Address</th>
                  <th>Status</th>
                  <th style={{ width: "160px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {vendors.map((vendor) => (
                  <tr key={vendor.id}>
                    <td>{vendor.name}</td>
                    <td>{vendor.companyName || "—"}</td>
                    <td>{vendor.contactPerson || "—"}</td>
                    <td>{vendor.phone || "—"}</td>
                    <td>{vendor.email || "—"}</td>
                    <td>
                      {[vendor.address, vendor.city, vendor.country].filter(Boolean).join(", ") ||
                        "—"}
                    </td>
                    <td>{vendor.isActive ? "Active" : "Inactive"}</td>
                    <td>
                      <div className="management-actions">
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => openEditForm(vendor)}
                        >
                          <FaEdit /> Edit
                        </button>
                        <button
                          type="button"
                          className="btn-danger"
                          onClick={() => deleteVendor(vendor.id)}
                        >
                          <FaTrash /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No vendors found.</p>
        )}
      </div>

      {showForm && (
        <div className="form-overlay" role="dialog" aria-modal="true">
          <form className="form-panel" onSubmit={handleSubmit(onSubmit)}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h3>{isEditing ? "Update Vendor" : "Create Vendor"}</h3>
              <button type="button" className="btn-outline" onClick={closeForm}>
                Close
              </button>
            </div>

            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="name">Name</label>
                <input
                  id="name"
                  {...register("name", { required: "Name is required" })}
                  placeholder="Vendor name"
                />
                {errors.name && <span className="form-error">{errors.name.message}</span>}
              </div>

              <div className="form-field">
                <label htmlFor="companyName">Company Name</label>
                <input id="companyName" {...register("companyName")} placeholder="Company name" />
              </div>

              <div className="form-field">
                <label htmlFor="contactPerson">Contact Person</label>
                <input
                  id="contactPerson"
                  {...register("contactPerson")}
                  placeholder="Contact person"
                />
              </div>

              <div className="form-field">
                <label htmlFor="phone">Phone</label>
                <input
                  id="phone"
                  {...register("phone", { required: "Phone is required" })}
                  placeholder="+977 9800000000"
                />
                {errors.phone && <span className="form-error">{errors.phone.message}</span>}
              </div>

              <div className="form-field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="vendor@example.com"
                />
              </div>
            </div>

            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="address">Address</label>
                <input
                  id="address"
                  {...register("address")}
                  placeholder="Street address"
                />
              </div>

              <div className="form-field">
                <label htmlFor="city">City</label>
                <input id="city" {...register("city")} placeholder="City" />
              </div>

              <div className="form-field">
                <label htmlFor="country">Country</label>
                <input id="country" {...register("country")} placeholder="Country" />
              </div>

              <div className="form-field">
                <label htmlFor="taxId">Tax ID</label>
                <input id="taxId" {...register("taxId")} placeholder="PAN / VAT" />
              </div>
            </div>

            <div className="form-field" style={{ flexDirection: "row", gap: "12px", alignItems: "center" }}>
              <input id="isActive" type="checkbox" {...register("isActive")} />
              <label htmlFor="isActive" style={{ margin: 0 }}>Active vendor</label>
            </div>

            <div className="form-actions">
              <button type="button" className="btn-outline" onClick={closeForm}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                {isEditing ? "Save Changes" : "Create Vendor"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminVendors;
