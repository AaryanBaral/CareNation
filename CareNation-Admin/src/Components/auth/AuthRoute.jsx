import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import Login from "../../Pages/Login";
import HomePage from "../../Pages/HomePage";
import AdminDashboard from "../../Pages/AdminDashboard";
import AdminReports from "../../Pages/AdminReports";
import AdminUsers from "../../Pages/AdminUsers";
import AdminDistributors from "../../Pages/AdminDistributors";
import AdminWithdrawals from "../../Pages/AdminWithdrawals";
import AdminOrders from "../../Pages/AdminOrders";
import AdminProducts from "../../Pages/AdminProducts";
import AdminVendors from "../../Pages/AdminVendors";
import AdminCommissionPayouts from "../../Pages/AdminCommissionPayouts";
import AdminBalanceTransfers from "../../Pages/AdminBalanceTransfers";
import AdminCategories from "../../Pages/AdminCategories";

export function AuthRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {!isAuthenticated && (
        <>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      )}

      {isAuthenticated && (
        <>
          <Route path="/login" element={<Navigate to="/dashboard" replace />} />
          <Route path="/" element={<HomePage />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="vendors" element={<AdminVendors />} />
            <Route path="commission-payouts" element={<AdminCommissionPayouts />} />
            <Route path="balance-transfers" element={<AdminBalanceTransfers />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="withdrawals" element={<AdminWithdrawals />} />
            <Route path="distributors" element={<AdminDistributors />} />
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </>
      )}
    </Routes>
  );
}
