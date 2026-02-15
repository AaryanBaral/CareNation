import React, { useState, useEffect } from "react";
import axios from "axios";
import "../style/ItemListPage.css";
import { Link, useLocation } from "react-router-dom";

export default function ItemListingPage() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [minPrice, setMinPrice] = useState(null);
  const [maxPrice, setMaxPrice] = useState(null);
  const [categoryMap, setCategoryMap] = useState({});

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const categoryParam = params.get("category") ?? null;

  useEffect(() => {
    axios
      .get("http://localhost:5127/api/category")
      .then((res) => {
        const map = {};
        res.data.data.forEach((item) => {
          map[item.name.toLowerCase()] = item.id;
        });
        setCategoryMap(map);

        if (categoryParam && map[categoryParam.toLowerCase()]) {
          setCategory(categoryParam);
          fetchFilteredProducts({
            categoryId: map[categoryParam.toLowerCase()],
          });
        } else {
          fetchAllProducts();
        }
      })
      .catch((err) => console.error("Error loading categories:", err));
  }, [categoryParam]);

  const fetchAllProducts = () => {
    axios
      .get("http://localhost:5127/api/product")
      .then((res) => setProducts(res.data.data))
      .catch((err) => console.error("Error fetching products:", err));
  };

  const fetchFilteredProducts = (filter) => {
    const queryParams = new URLSearchParams();
    if (filter.name) queryParams.append("name", filter.name ?? null);
    if (filter.minPrice) queryParams.append("minPrice", filter.minPrice);
    if (filter.maxPrice) queryParams.append("maxPrice", filter.maxPrice);
    if (filter.categoryId) queryParams.append("categoryId", filter.categoryId ?? null);

    axios
      .get(`http://localhost:5127/api/product/search?${queryParams.toString()}`)
      .then((res) => setProducts(res.data))
      .catch((err) => console.error("Error filtering products:", err));
  };

  const handleSearch = () => {
    const categoryId =
      category !== "All" && categoryMap[category.toLowerCase()]
        ? categoryMap[category.toLowerCase()]
        : null;

    fetchFilteredProducts({
      name: search,
      minPrice,
      maxPrice,
      categoryId,
    });
  };

  return (
    <div className="item-listing-page">
      <h1 className="item-listing-page-title">All Products</h1>

      <div className="item-listing-page-content-layout">
        <aside className="item-listing-page-sidebar">
          <div className="item-listing-page-filters fixed-padding-box">
            <div className="item-listing-page-section">
              <label htmlFor="search">Search</label>
              <input
                type="text"
                placeholder="Search by name"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="item-listing-page-section">
              <label htmlFor="category">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="All">All Categories</option>
                {Object.keys(categoryMap).map((cat) => (
                  <option key={cat} value={cat.id}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="item-listing-page-section">
              <label>Price Range</label>
              <div className="item-listing-page-price-range">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(Number(e.target.value))}
                />
                <span>-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                />
              </div>
            </div>

            <button className="item-listing-page-search-button" onClick={handleSearch}>
              Search
            </button>
          </div>
        </aside>

        <section className="item-listing-page-product-section">
          <div className="item-listing-page-sort-bar">
            <p>Showing {products.length} Products</p>
            <select>
              <option>Sort by: Most Popular</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
            </select>
          </div>

          <div className="item-listing-page-product-grid">
            {products.length ? (
              products.map((product) => (
                <Link
                  key={product.id}
                  className="item-listing-page-product-card"
                  to={`/detail/${product.id}`}
                >
                  <div className="item-listing-page-product-image">
                    <img
                      src={`http://localhost:5127${product.imageUrl[0]}`}
                      alt={product.title}
                    />
                  </div>
                  <div className="item-listing-page-product-name">{product.title}</div>
                  <div className="item-listing-page-product-price">Rs {product.retailPrice}</div>
                </Link>
              ))
            ) : (
              <p>No products match your filters.</p>
            )}
          </div>

          <div className="item-listing-page-pagination">
            <button>&lt; Previous</button>
            <button className="active">1</button>
            <button>2</button>
            <button>3</button>
            <button>Next &gt;</button>
          </div>
        </section>
      </div>
    </div>
  );
}
