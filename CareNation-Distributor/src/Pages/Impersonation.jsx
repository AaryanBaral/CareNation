import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import baseApi from "../Components/Constants/baseApi";
import { useAuth } from "../Components/Context/AuthContext";
import "../styles/Login.css";

const parseParams = (search, hash) => {
  const params = new URLSearchParams(search);
  const hashParams = new URLSearchParams(hash?.startsWith("#") ? hash.slice(1) : hash);
  hashParams.forEach((value, key) => {
    if (!params.has(key)) params.set(key, value);
  });
  return params;
};

const StatusCard = ({ title, message }) => (
  <div className="container fade-in">
    <h2>{title}</h2>
    <p className="subtext">{message}</p>
  </div>
);

export default function Impersonation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, setIsDistributor, setIsImpersonating, setExpiry } = useAuth();
  const [status, setStatus] = useState("loading");

  const params = useMemo(
    () => parseParams(location.search, location.hash ?? ""),
    [location.search, location.hash]
  );

  useEffect(() => {
    const redeem = async () => {
      const code = params.get("code");
      if (!code) {
        navigate("/login", { replace: true });
        return;
      }

      const sessionId =
        params.get("sessionId") ||
        params.get("nonce") ||
        localStorage.getItem("impersonationSession") ||
        `${Date.now()}-${Math.random().toString(36).slice(2)}`;

      try {
        localStorage.setItem("impersonationSession", sessionId);

        const { data } = await baseApi.post(
          "/auth/impersonation/redeem",
          { code },
          {
            headers: {
              "X-Impersonation-Session": sessionId,
            },
          }
        );

        const { accessToken, expiresAtUtc, returnUrl: serverReturn } = data;

        login(accessToken);
        setIsDistributor(true);
        setIsImpersonating(true);

        if (expiresAtUtc) {
          const remaining = new Date(expiresAtUtc).getTime() - Date.now();
          setExpiry(Math.max(remaining, 0));
        } else {
          setExpiry();
        }

        const returnUrl = params.get("returnUrl") || serverReturn;
        if (returnUrl) {
          localStorage.setItem("impersonationReturnUrl", returnUrl);
        }

        setStatus("success");

        const cleanUrl = new URL(window.location.href);
        cleanUrl.search = "";
        cleanUrl.hash = "";
        window.history.replaceState({}, "", cleanUrl.toString());

        navigate("/profile", { replace: true });
      } catch (error) {
        console.error("Impersonation redeem failed", error);
        navigate("/login", { replace: true });
      }
    };

    redeem();
  }, [navigate, params, login, setIsDistributor, setIsImpersonating, setExpiry]);

  if (status === "loading") {
    return (
      <StatusCard
        title="Connecting"
        message="Launching the CareNation distributor portal, please wait..."
      />
    );
  }

  return (
    <StatusCard
      title="Success"
      message="Redirecting you to the distributor dashboard..."
    />
  );
}
