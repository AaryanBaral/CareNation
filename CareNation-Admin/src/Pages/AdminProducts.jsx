import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { FaEdit, FaPlus, FaTrash } from "react-icons/fa";
import baseApi from "../Components/Constants/baseApi";
import "../styles/AdminManagement.css";
import { toast } from "sonner";

const defaultProduct = {
  id: null,
  title: "",
  description: "",
  categoryId: "",
  vendorId: "",
  stockQuantity: "",
  restockQuantity: "",
  warningStockQuantity: "",
  type: "retail",
  productPoint: "",
  discount: "",
  repurchaseSale: "",
  distributorPrice: "",
  retailPrice: "",
  costPrice: "",
};

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProductId, setCurrentProductId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [vendors, setVendors] = useState([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: defaultProduct });

  const loadData = async () => {
    setLoading(true);
    try {
      const [productRes, categoryRes, vendorRes] = await Promise.all([
        baseApi.get("/product"),
        baseApi.get("/category"),
        baseApi.get("/vendors"),
      ]);

      setProducts(Array.isArray(productRes?.data?.data) ? productRes.data.data : []);
      setCategories(Array.isArray(categoryRes?.data?.data) ? categoryRes.data.data : []);
      setVendors(Array.isArray(vendorRes?.data) ? vendorRes.data : []);
    } catch (error) {
      console.error("Failed to load product dependencies:", error);
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.title ||
          "Unable to load products."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
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
    setCurrentProductId(null);
    reset(defaultProduct);
    setShowForm(true);
  };

  const openEditForm = (product) => {
    setIsEditing(true);
    setCurrentProductId(product.id);
    const payload = {
      id: product.id,
      title: product.title,
      description: product.description || "",
      categoryId: product.categoryId ? String(product.categoryId) : "",
      vendorId: product.vendorId ? String(product.vendorId) : "",
      stockQuantity: product.stockQuantity ?? "",
      restockQuantity: product.restockQuantity ?? "",
      warningStockQuantity: product.warningStockQuantity ?? "",
      type: product.type || "",
      productPoint: product.productPoint ?? "",
      discount: product.discount ?? "",
      repurchaseSale: product.repurchaseSale ?? "",
      distributorPrice: product.distributorPrice ?? "",
      retailPrice: product.retailPrice ?? "",
      costPrice: product.costPrice ?? "",
    };
    reset(payload);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setCurrentProductId(null);
  };

  const appendNumberField = (formData, key, value) => {
    if (value !== "" && value !== null && value !== undefined) {
      formData.append(key, value);
    } else {
      formData.append(key, "0");
    }
  };

  const onSubmit = async (values) => {
    const title = values.title.trim();
    if (!title) {
      toast.error("Please enter a product title.");
      return;
    }

    if (!values.categoryId) {
      toast.error("Please select a category.");
      return;
    }

    if (!values.vendorId) {
      toast.error("Please select a vendor.");
      return;
    }

    const formData = new FormData();
    formData.append("Title", title);
    formData.append("Description", values.description.trim());
    formData.append("CategoryId", values.categoryId || "0");
    formData.append("VendorId", values.vendorId || "0");
    appendNumberField(formData, "StockQuantity", values.stockQuantity);
    appendNumberField(formData, "RestockQuantity", values.restockQuantity);
    appendNumberField(formData, "WarningStockQuantity", values.warningStockQuantity);
    formData.append("Type", values.type || "retail");
    appendNumberField(formData, "ProductPoint", values.productPoint);
    appendNumberField(formData, "Discount", values.discount);
    appendNumberField(formData, "RepurchaseSale", values.repurchaseSale);
    appendNumberField(formData, "DistributorPrice", values.distributorPrice);
    appendNumberField(formData, "RetailPrice", values.retailPrice);
    appendNumberField(formData, "CostPrice", values.costPrice);

    const files = values.images instanceof FileList ? Array.from(values.images) : [];
    if (!isEditing && files.length === 0) {
      toast.error("Please add at least one product image.");
      return;
    }
    files.forEach((file) => formData.append("images", file));

    try {
      if (isEditing && currentProductId != null) {
      await baseApi.put(`/product/${currentProductId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Product updated successfully.");
    } else {
      await baseApi.post("/product", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Product created successfully.");
      }
      await loadData();
      closeForm();
    } catch (error) {
      console.error("Failed to save product:", error);
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.title ||
          "Unable to save product."
      );
    }
  };

  const deleteProduct = async (productId) => {
    if (!confirm("Delete this product?")) return;
    try {
      await baseApi.delete(`/product/${productId}`);
      toast.success("Product deleted.");
      await loadData();
    } catch (error) {
      console.error("Failed to delete product:", error);
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.title ||
          "Unable to delete product."
      );
    }
  };

  const categoryName = useMemo(() => {
    const map = new Map(categories.map((cat) => [cat.id, cat.name]));
    return (id) => map.get(id) || "—";
  }, [categories]);

  const vendorName = useMemo(() => {
    const map = new Map(vendors.map((vendor) => [vendor.id, vendor.name ?? vendor.companyName ?? "—"]));
    return (id) => map.get(id) || "—";
  }, [vendors]);

  return (
    <div className="management-page">
      <div className="management-toolbar">
        <h2>🛒 Products</h2>
        <button type="button" className="btn-primary" onClick={openCreateForm}>
          <FaPlus /> Add Product
        </button>
      </div>

      <div className="management-card">
        <h3>Catalog</h3>
        {loading ? (
          <p>Loading products...</p>
        ) : products.length ? (
          <div style={{ overflowX: "auto" }}>
            <table className="management-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Retail Price</th>
                  <th>Distributor Price</th>
                  <th>Stock</th>
                  <th>Category</th>
                  <th>Vendor</th>
                  <th style={{ width: "160px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>{product.title}</td>
                    <td>Rs. {Number(product.retailPrice || 0).toLocaleString()}</td>
                    <td>Rs. {Number(product.distributorPrice || 0).toLocaleString()}</td>
                    <td>{product.stockQuantity ?? "—"}</td>
                    <td>{product.category?.name || categoryName(product.categoryId)}</td>
                    <td>{product.vendorName || vendorName(product.vendorId)}</td>
                    <td>
                      <div className="management-actions">
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => openEditForm(product)}
                        >
                          <FaEdit /> Edit
                        </button>
                        <button
                          type="button"
                          className="btn-danger"
                          onClick={() => deleteProduct(product.id)}
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
          <p>No products found.</p>
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
              <h3>{isEditing ? "Update Product" : "Create Product"}</h3>
              <button type="button" className="btn-outline" onClick={closeForm}>
                Close
              </button>
            </div>

            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="title">Title</label>
                <input
                  id="title"
                  {...register("title", { required: "Title is required" })}
                  placeholder="Product title"
                />
                {errors.title && <span className="form-error">{errors.title.message}</span>}
              </div>

              <div className="form-field">
                <label htmlFor="retailPrice">Retail Price</label>
                <input
                  id="retailPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register("retailPrice", { required: "Retail price is required" })}
                  placeholder="0.00"
                />
                {errors.retailPrice && (
                  <span className="form-error">{errors.retailPrice.message}</span>
                )}
              </div>

              <div className="form-field">
                <label htmlFor="distributorPrice">Distributor Price</label>
                <input
                  id="distributorPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register("distributorPrice", { required: "Distributor price is required" })}
                  placeholder="0.00"
                />
                {errors.distributorPrice && (
                  <span className="form-error">{errors.distributorPrice.message}</span>
                )}
              </div>

              <div className="form-field">
                <label htmlFor="costPrice">Cost Price</label>
                <input
                  id="costPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register("costPrice")}
                  placeholder="0.00"
                />
              </div>

              <div className="form-field">
                <label htmlFor="stockQuantity">Stock Quantity</label>
                <input
                  id="stockQuantity"
                  type="number"
                  min="0"
                  {...register("stockQuantity")}
                  placeholder="0"
                />
              </div>

              <div className="form-field">
                <label htmlFor="restockQuantity">Restock Quantity</label>
                <input
                  id="restockQuantity"
                  type="number"
                  min="0"
                  {...register("restockQuantity")}
                  placeholder="0"
                />
              </div>

              <div className="form-field">
                <label htmlFor="warningStockQuantity">Warning Stock</label>
                <input
                  id="warningStockQuantity"
                  type="number"
                  min="0"
                  {...register("warningStockQuantity")}
                  placeholder="0"
                />
              </div>

              <div className="form-field">
                <label htmlFor="type">Type</label>
                <select id="type" {...register("type")}>
                  <option value="retail">Retail</option>
                  <option value="resale">Resale</option>
                  <option value="both">Both</option>
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="productPoint">Product Points</label>
                <input id="productPoint" type="number" step="0.01" {...register("productPoint")} />
              </div>

              <div className="form-field">
                <label htmlFor="discount">Discount (%)</label>
                <input id="discount" type="number" step="0.01" {...register("discount")} />
              </div>

              <div className="form-field">
                <label htmlFor="repurchaseSale">Repurchase Sale</label>
                <input
                  id="repurchaseSale"
                  type="number"
                  step="0.01"
                  {...register("repurchaseSale")}
                />
              </div>

              <div className="form-field">
                <label htmlFor="categoryId">Category</label>
                <select id="categoryId" {...register("categoryId", { required: "Category is required" })}>
                  <option value="">-- Select --</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && (
                  <span className="form-error">{errors.categoryId.message}</span>
                )}
              </div>

              <div className="form-field">
                <label htmlFor="vendorId">Vendor</label>
                <select id="vendorId" {...register("vendorId", { required: "Vendor is required" })}>
                  <option value="">-- Select --</option>
                  {vendors.map((vendor) => (
                    <option key={vendor.id} value={vendor.id}>
                      {vendor.name ?? vendor.companyName ?? `Vendor #${vendor.id}`}
                    </option>
                  ))}
                </select>
                {errors.vendorId && <span className="form-error">{errors.vendorId.message}</span>}
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                {...register("description")}
                placeholder="About the product"
              />
            </div>

            <div className="form-field">
              <label htmlFor="images">Images</label>
              <input id="images" type="file" multiple accept="image/*" {...register("images")} />
              {!isEditing && (
                <span className="form-error">Upload at least one image.</span>
              )}
            </div>

            <div className="form-actions">
              <button type="button" className="btn-outline" onClick={closeForm}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                {isEditing ? "Save Changes" : "Create Product"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
