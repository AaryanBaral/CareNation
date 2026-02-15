import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { FaPen, FaPlus, FaTrash } from "react-icons/fa";
import baseApi from "../Components/Constants/baseApi";
import "../styles/AdminManagement.css";
import { toast } from "sonner";

const initialFormValues = {
  firstName: "",
  middleName: "",
  lastName: "",
  email: "",
  password: "",
  phoneNumber: "",
  permanentFullAddress: "",
  newPassword: "",
};

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [selectedUser, setSelectedUser] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: initialFormValues });

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data } = await baseApi.get("/user");
      const allUsers = Array.isArray(data?.data) ? data.data : [];
      setUsers(allUsers);
    } catch (error) {
      console.error("Failed to load users:", error);
      toast.error(
        error.response?.data?.message ||
          "Unable to fetch users, please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
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
    setFormMode("create");
    setSelectedUser(null);
    reset(initialFormValues);
    setShowForm(true);
  };

  const openEditForm = (user) => {
    setFormMode("edit");
    setSelectedUser(user);
    reset({
      firstName: user.firstName,
      middleName: user.middleName || "",
      lastName: user.lastName,
      email: user.email,
      password: "",
      phoneNumber: user.phoneNumber,
      permanentFullAddress: user.permanentFullAddress,
      newPassword: "",
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setSelectedUser(null);
  };

  const submitForm = async (values) => {
    if (formMode === "create") {
      try {
        await baseApi.post("/user/signup", {
          firstName: values.firstName.trim(),
          middleName: values.middleName?.trim() || null,
      lastName: values.lastName.trim(),
      email: values.email.trim(),
      password: values.password,
      phoneNumber: values.phoneNumber.trim(),
      permanentFullAddress: values.permanentFullAddress.trim(),
    });
        toast.success("User created successfully.");
        await loadUsers();
        closeForm();
      } catch (error) {
        console.error("Failed to create user:", error);
        const message =
          error.response?.data?.message ||
          error.response?.data?.title ||
          "Unable to create user.";
        toast.error(message);
      }
      return;
    }

    if (!selectedUser) return;

    try {
      const payload = {
        id: selectedUser.id,
        firstName: values.firstName.trim(),
        middleName: values.middleName?.trim() || "",
        lastName: values.lastName.trim(),
        email: values.email.trim(),
        phoneNumber: values.phoneNumber.trim(),
        permanentFullAddress: values.permanentFullAddress.trim(),
      };

      const params =
        values.newPassword?.trim() && values.newPassword.trim().length >= 6
          ? { newPassword: values.newPassword.trim() }
          : undefined;

      await baseApi.put(`/user/${selectedUser.id}`, payload, { params });
      toast.success("User updated successfully.");
      await loadUsers();
      closeForm();
    } catch (error) {
      console.error("Failed to update user:", error);
      const message =
        error.response?.data?.message ||
        error.response?.data?.title ||
        "Unable to update user.";
      toast.error(message);
    }
  };

  const deleteUser = async (user) => {
    const confirmation = confirm(
      `Delete ${user.firstName} ${user.lastName}? This cannot be undone.`
    );
    if (!confirmation) return;
    try {
      await baseApi.delete(`/user/${user.id}`);
      toast.success("User deleted successfully.");
      setUsers((prev) => prev.filter((item) => item.id !== user.id));
    } catch (error) {
      console.error("Failed to delete user:", error);
      const message =
        error.response?.data?.message ||
        error.response?.data?.title ||
        "Unable to delete user.";
      toast.error(message);
    }
  };

  const userCountByRole = useMemo(() => {
    return users.reduce(
      (acc, user) => {
        const role = user.role?.toLowerCase() || "user";
        acc[role] = (acc[role] || 0) + 1;
        return acc;
      },
      { total: users.length }
    );
  }, [users]);

  return (
    <div className="management-page">
      <div className="management-toolbar">
        <h2>👥 User Directory</h2>
        <button className="btn-primary" onClick={openCreateForm}>
          <FaPlus /> Add User
        </button>
      </div>

      <div className="management-card">
        <h3>Role Distribution</h3>
        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
            fontWeight: 600,
          }}
        >
          <span>Total: {userCountByRole.total}</span>
          {Object.entries(userCountByRole)
            .filter(([role]) => role !== "total")
            .map(([role, count]) => (
              <span key={role} style={{ textTransform: "capitalize" }}>
                {role}: {count}
              </span>
            ))}
        </div>
      </div>

      <div className="management-card">
        <h3>All Users</h3>
        {loading ? (
          <p>Loading users...</p>
        ) : users.length ? (
          <div style={{ overflowX: "auto" }}>
            <table className="management-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th style={{ width: "140px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      {[user.firstName, user.middleName, user.lastName]
                        .filter(Boolean)
                        .join(" ")}
                    </td>
                    <td>{user.email}</td>
                    <td>{user.phoneNumber}</td>
                    <td>{user.permanentFullAddress}</td>
                    <td>
                      <div className="management-actions">
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => openEditForm(user)}
                        >
                          <FaPen /> Edit
                        </button>
                        <button
                          type="button"
                          className="btn-danger"
                          onClick={() => deleteUser(user)}
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
          <p>No users found.</p>
        )}
      </div>

      {showForm && (
        <div className="form-overlay" role="dialog" aria-modal="true">
          <form className="form-panel" onSubmit={handleSubmit(submitForm)}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h3>
                {formMode === "create" ? "Create New User" : "Update User"}
              </h3>
              <button
                type="button"
                className="btn-outline"
                onClick={closeForm}
                style={{ color: "#e2e8f0" }}
              >
                Close
              </button>
            </div>

            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="firstName">First name</label>
                <input
                  id="firstName"
                  {...register("firstName", { required: "First name is required" })}
                  placeholder="John"
                />
                {errors.firstName && (
                  <span className="form-error">{errors.firstName.message}</span>
                )}
              </div>

              <div className="form-field">
                <label htmlFor="middleName">Middle name</label>
                <input id="middleName" {...register("middleName")} placeholder="--" />
              </div>

              <div className="form-field">
                <label htmlFor="lastName">Last name</label>
                <input
                  id="lastName"
                  {...register("lastName", { required: "Last name is required" })}
                  placeholder="Doe"
                />
                {errors.lastName && (
                  <span className="form-error">{errors.lastName.message}</span>
                )}
              </div>

              <div className="form-field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  {...register("email", { required: "Email is required" })}
                  placeholder="user@example.com"
                />
                {errors.email && (
                  <span className="form-error">{errors.email.message}</span>
                )}
              </div>

              <div className="form-field">
                <label htmlFor="phoneNumber">Phone number</label>
                <input
                  id="phoneNumber"
                  {...register("phoneNumber", {
                    required: "Phone number is required",
                    minLength: { value: 6, message: "Enter a valid phone number" },
                  })}
                  placeholder="+977 9800000000"
                />
                {errors.phoneNumber && (
                  <span className="form-error">
                    {errors.phoneNumber.message}
                  </span>
                )}
              </div>

              <div className="form-field">
                <label htmlFor="role">Role</label>
                <select id="role" {...register("role")}>
                  {roleOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {formMode === "create" ? (
                <div className="form-field">
                  <label htmlFor="password">Password</label>
                  <input
                    id="password"
                    type="password"
                    {...register("password", {
                      required: "Password is required",
                      minLength: { value: 6, message: "Minimum 6 characters" },
                    })}
                    placeholder="••••••"
                  />
                  {errors.password && (
                    <span className="form-error">{errors.password.message}</span>
                  )}
                </div>
              ) : (
                <div className="form-field">
                  <label htmlFor="newPassword">New password (optional)</label>
                  <input
                    id="newPassword"
                    type="password"
                    {...register("newPassword", {
                      minLength: {
                        value: 6,
                        message: "Minimum 6 characters",
                      },
                    })}
                    placeholder="Update password"
                  />
                  {errors.newPassword && (
                    <span className="form-error">
                      {errors.newPassword.message}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="form-field">
              <label htmlFor="permanentFullAddress">Permanent address</label>
              <textarea
                id="permanentFullAddress"
                {...register("permanentFullAddress", {
                  required: "Address is required",
                })}
                placeholder="Street, City, Province"
              />
              {errors.permanentFullAddress && (
                <span className="form-error">
                  {errors.permanentFullAddress.message}
                </span>
              )}
            </div>

            <div className="form-actions">
              <button type="button" className="btn-outline" onClick={closeForm}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                {formMode === "create" ? "Create User" : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
