import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "../style/ProductDetailPage.css";
import baseApi from "../Constants/baseApi";

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);

  const handleAddToCart = async () => {
    const availableStock = product?.stockQuantity ?? 0;
    if (availableStock <= 0) {
      alert("This item is currently out of stock.");
      return;
    }

    if (quantity > availableStock) {
      alert(`Only ${availableStock} units are available.`);
      return;
    }

    try {
      const response = await baseApi.post("cart/add", {
        productId: product.id,
        quantity: quantity,
      });

      alert("Product added to cart successfully!");
      console.log("Cart Response:", response.data);
    } catch (error) {
      console.error("Failed to add to cart:", error);
      const message =
        error.response?.data?.message ||
        error.response?.data?.title ||
        "Failed to add product to cart.";
      alert(message);
    }
  };

  useEffect(() => {
    fetch(`http://localhost:5127/api/product/${id}`)
      .then((res) => res.json())
      .then((data) => {
        const productData = data.data;
        setProduct(productData);
        setMainImage(productData.imageUrl[0]);
        setQuantity(productData.stockQuantity > 0 ? 1 : 0);

        fetch(
          `http://localhost:5127/api/product?categoryId=${productData.categoryId}`
        )
          .then((res) => res.json())
          .then((related) => {
            const filtered = related.data.filter(
              (p) => p.id !== productData.id
            );
            setRelatedProducts(filtered);
          });
      });
  }, [id]);

  const changeQuantity = (type) => {
    if (!product) return;
    const availableStock = product.stockQuantity ?? 0;
    if (type === "inc" && quantity < availableStock) setQuantity((q) => q + 1);
    if (type === "dec" && quantity > 1) setQuantity((q) => q - 1);
  };

  if (!product) return <div>Loading...</div>;

  return (
    <div className="product-detail-container">
      <div className="product-main">
        <div className="product-images">
          <div className="thumbnails">
            {product.imageUrl.map((img, i) => (
              <img
                key={i}
                src={`http://localhost:5127${img}`}
                alt="thumb"
                className={mainImage === img ? "active" : ""}
                onClick={() => setMainImage(img)}
              />
            ))}
          </div>
          <img
            className="main-image"
            src={`http://localhost:5127${mainImage}`}
            alt={product.title}
          />
        </div>

        <div className="product-info">
          <h2>{product.title}</h2>
          <div className="price-wrapper">
            <span className="price">Rs {product.retailPrice}</span>
          </div>
          <p className={`stock-text ${product.stockQuantity <= 0 ? "out" : ""}`}>
            {product.stockQuantity > 0
              ? `In stock: ${product.stockQuantity}`
              : "Out of stock"}
          </p>
          <p className="description">{product.description}</p>

          <div className="quantity-control">
            <button onClick={() => changeQuantity("dec")}>-</button>
            <span>{quantity}</span>
            <button
              onClick={() => changeQuantity("inc")}
              disabled={quantity >= (product.stockQuantity ?? 0)}
            >
              +
            </button>
          </div>

          <button
            className="add-to-cart-btn"
            onClick={handleAddToCart}
            disabled={(product.stockQuantity ?? 0) <= 0}
          >
            Add to Cart
          </button>
        </div>
      </div>

      <div className="recommendation-section">
        <h3>You might also like</h3>
        <div className="recommendation-grid">
          {relatedProducts.map((prod) => (
            <a
              className="recommendation-card"
              key={prod.id}
              href={`/detail/${prod.id}`}
            >
              <img
                src={`http://localhost:5127${prod.imageUrl[0]}`}
                alt={prod.title}
              />
              <h4>{prod.title}</h4>
              <div className="price">Rs {prod.retailPrice}</div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
