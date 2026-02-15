import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Signup from "./components/Signup";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import HomePage from "./pages/HomePage";
import ItemListPage from "./pages/ItemListPage";
import CartPage from "./pages/CartPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import Navbar from "./components/Navbar";
import { useAuth } from "./components/Context/AuthContext";
import CheckoutPage from "./pages/CheckoutPage";
import Profile from "./pages/Profile";
import PaymentSuccess from "./pages/PaymentSuccess";

const App = () => {
  const {token} = useAuth();

  return (
    <Router>
      {/* Show Navbar only if logged in */}
      {token && <Navbar />}

      <Routes>
        {/* Public Routes */}
        <Route exact path="/login" element={<Login />} />
        <Route exact path="/signup" element={<Signup />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route exact path="/" element={<HomePage />} />
          <Route exact path="/item-list" element={<ItemListPage />} />
          <Route exact path="/cart" element={<CartPage />} />
          <Route exact path="/detail/:id" element={<ProductDetailPage />} />
          <Route exact path="/checkout" element={<CheckoutPage />} />
          <Route exact path="/profile" element={<Profile />} />
          <Route exact path="/payment-success" element={<PaymentSuccess />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
