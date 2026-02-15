import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FaEdit, FaPlus, FaTrash, FaSync } from "react-icons/fa";
import baseApi from "../Components/Constants/baseApi";
import "../styles/AdminManagement.css";
import { toast } from "sonner";

const defaultCategory = {
  id: null,
  name: "",
};

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: defaultCategory });

  const loadCategories = async () => {
    setLoading(true);
    try {
      const { data } = await baseApi.get("/category");
      const list = Array.isArray(data?.data) ? data.data : [];
      setCategories(list);
    } catch (error) {
      console.error("Failed to load categories:", error);
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.title ||
          "Unable to fetch categories."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
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
    reset(defaultCategory);
    setShowForm(true);
  };

  const openEditForm = (category) => {
    setIsEditing(true);
    reset({ id: category.id, name: category.name });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
  };

  const onSubmit = async (values) => {
    const payload = { ...values, name: values.name.trim() };

    try {
      if (isEditing && values.id != null) {
        await baseApi.put("/category", payload);
        toast.success("Category updated.");
      } else {
        await baseApi.post("/category", { name: payload.name });
        toast.success("Category created.");
      }
      await loadCategories();
      closeForm();
    } catch (error) {
      console.error("Failed to save category:", error);
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.title ||
          "Unable to save category."
      );
    }
  };

  const deleteCategory = async (id) => {
    if (!confirm("Delete this category?")) return;
    try {
      await baseApi.delete(`/category/${id}`);
      toast.success("Category deleted.");
      await loadCategories();
    } catch (error) {
      console.error("Failed to delete category:", error);
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.title ||
          "Unable to delete category."
      );
    }
  };

  return (
    <div className="management-page">
      <div className="management-toolbar">
        <h2>🏷️ Categories</h2>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <button type="button" className="btn-secondary" onClick={loadCategories}>
            <FaSync /> Refresh
          </button>
          <button type="button" className="btn-primary" onClick={openCreateForm}>
            <FaPlus /> Add Category
          </button>
        </div>
      </div>

      <div className="management-card">
        <h3>Category List</h3>
        {loading ? (
          <p>Loading categories...</p>
        ) : categories.length ? (
          <div style={{ overflowX: "auto" }}>
            <table className="management-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th style={{ width: "160px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id}>
                    <td>#{category.id}</td>
                    <td>{category.name}</td>
                    <td>
                      <div className="management-actions">
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => openEditForm(category)}
                        >
                          <FaEdit /> Edit
                        </button>
                        <button
                          type="button"
                          className="btn-danger"
                          onClick={() => deleteCategory(category.id)}
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
          <p>No categories found.</p>
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
              <h3>{isEditing ? "Update Category" : "Create Category"}</h3>
              <button type="button" className="btn-outline" onClick={closeForm}>
                Close
              </button>
            </div>

            <div className="form-field">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                {...register("name", { required: "Category name is required" })}
                placeholder="Category name"
              />
              {errors.name && <span className="form-error">{errors.name.message}</span>}
            </div>

            <div className="form-actions">
              <button type="button" className="btn-outline" onClick={closeForm}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                {isEditing ? "Save Changes" : "Create Category"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
