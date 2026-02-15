import React, { useEffect, useState } from "react";
import axios from "axios";
import "../style/HomePage.css";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:5127/api/product")
      .then((res) => setProducts(res.data.data))
      .catch((err) => console.error("Error fetching products:", err));
    axios
      .get("http://localhost:5127/api/category")
      .then((res) => setCategory(res.data.data))
      .catch((err) => console.error("Error fetching categories:", err));
  }, []);

  const featured = products.slice(0, 4);
  const trending = products.slice(4, 8);

  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-text">
          <h1>
            FIND PRODUCTS <br />
            THAT MATCH YOUR NEEDS
            <br />
            IN ONE PLACE
          </h1>
          <p>
            Explore a wide range of categories — electronics, clothing, home
            essentials, books, gadgets, and more — all in one seamless shopping
            experience.
          </p>
          <button className="primary-btn" onClick={() => navigate("/item-list")}>
            Shop Now
          </button>
          <div className="stats">
            <div>
              <div className="stat-number">5,000+</div>
              Product Categories
            </div>
            <div>
              <div className="stat-number">100,000+</div>
              Verified Products
            </div>
            <div>
              <div className="stat-number">1M+</div>
              Happy Shoppers
            </div>
          </div>
        </div>
        <div className="hero-image">
          <img src="/images/hero-model.png" alt="Hero" />
        </div>
      </section>

      {/* Categories Bar */}
      <section className="brands">
        {["Electronics", "Fashion", "Home & Living", "Books", "Grocery"].map((cat) => (
          <span key={cat}>{cat}</span>
        ))}
      </section>

      {/* Product Sections */}
      <section className="products">
        <h2>FEATURED PRODUCTS</h2>
        <div className="product-grid">
          {featured.map((item) => (
            <div
              key={item.id}
              className="product-card"
              onClick={() => navigate("/item-list")}
              style={{ cursor: "pointer" }}
            >
              <img src={`http://localhost:5127${item.imageUrl[0]}`} alt={item.title} />
              <h4>{item.title}</h4>
              <p>Rs {item.retailPrice}</p>
            </div>
          ))}
        </div>
        <div className="text-right">
          <button className="outline-btn" onClick={() => navigate("/item-list")}>
            View All
          </button>
        </div>

        <h2>TRENDING NOW</h2>
        <div className="product-grid">
          {trending.map((item) => (
            <div
              key={item.id}
              className="product-card"
              onClick={() => navigate("/item-list")}
              style={{ cursor: "pointer" }}
            >
              <img src={`http://localhost:5127${item.imageUrl[0]}`} alt={item.title} />
              <h4>{item.title}</h4>
              <p>Rs {item.retailPrice}</p>
            </div>
          ))}
        </div>
        <div className="text-right">
          <button className="outline-btn" onClick={() => navigate("/item-list")}>
            View All
          </button>
        </div>
      </section>

      {/* Browse By Category */}
      <section className="dress-style">
        <h2>BROWSE BY CATEGORY</h2>
        <div className="style-grid">
          {category.map((cat) => (
            <div
              key={cat.id}
              className="style-card"
              onClick={() => navigate(`/item-list?category=${cat.name.toLowerCase()}`)}
              style={{ cursor: "pointer" }}
            >
              <img src={`/images/${cat.name.toLowerCase()}.jpg`} alt={cat.name} />
              <p>{cat.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials">
        <h2>OUR HAPPY CUSTOMERS</h2>
        <div className="testimonial-grid">{/* Testimonial cards */}</div>
      </section>

      {/* Newsletter CTA */}
      <section className="newsletter">
        <h3>STAY UPTO DATE ABOUT OUR LATEST OFFERS</h3>
        <form>
          <input type="email" placeholder="Enter your email address" />
          <button type="submit">Subscribe to Newsletter</button>
        </form>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-grid">
          <div className="footer-brand">
            <h4>SHOP.CO</h4>
            <p>
              Your one-stop marketplace for all kinds of quality products and
              categories.
            </p>
          </div>
          <div>
            <h5>Company</h5>
            <ul>
              <li>About</li>
              <li>Features</li>
              <li>Works</li>
              <li>Career</li>
            </ul>
          </div>
          <div>
            <h5>Help</h5>
            <ul>
              <li>Customer Support</li>
              <li>Delivery Details</li>
              <li>Terms & Conditions</li>
              <li>Privacy Policy</li>
            </ul>
          </div>
          <div>
            <h5>FAQ</h5>
            <ul>
              <li>Account</li>
              <li>Manage Deliveries</li>
              <li>Orders</li>
              <li>Payments</li>
            </ul>
          </div>
          <div>
            <h5>Resources</h5>
            <ul>
              <li>Free eBooks</li>
              <li>Development Tutorial</li>
              <li>How to - Blog</li>
              <li>Youtube Playlist</li>
            </ul>
          </div>
        </div>
        <div className="footer-note">© 2025 SHOP.CO, All Rights Reserved</div>
      </footer>
    </div>
  );
}
