import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import Login from "../../Pages/Login";
import HomePage from "../../Pages/HomePage";
import UserReport from "../DashBoard/UserReport";
import DashBoardHome from "../DashBoard/DashBoardHome";
import TreeListing from "../../Pages/TreeListing";
import UserProfile from "../../Pages/UserProfile";
import PersonalReportPage from "../../Pages/PersonalReportPage";
import BalanceTransfer from "../../Pages/BalanceTransfer";
import WithdrawalRequestForm from "../../Pages/WithdrawalRequestForm";
import WalletStatementPage from "../../Pages/WalletStatementPage";
import Impersonation from "../../Pages/Impersonation";

export function AuthRoutes() {
  const { token, isDistributor, isImpersonating, isTokenExpired } = useAuth();

  if (!token || isTokenExpired()) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/impersonation" element={<Impersonation />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  if (!isDistributor && !isImpersonating) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/impersonation" element={<Impersonation />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<HomePage />}>
        <Route index element={<DashBoardHome />} />
        <Route path="users" element={<UserReport />} />
        <Route path="tree" element={<TreeListing />} />
        <Route path="profile" element={<UserProfile />} />
        <Route path="personal-report" element={<PersonalReportPage />} />
        <Route path="balance-transfer" element={<BalanceTransfer />} />
        <Route path="withdrawl" element={<WithdrawalRequestForm />} />
        <Route path="wallet" element={<WalletStatementPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
      <Route path="/impersonation" element={<Impersonation />} />
    </Routes>
  );
}
