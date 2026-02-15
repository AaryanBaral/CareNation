import React, { useEffect, useMemo, useState } from "react";
import "../style/Profile.css";
import baseApi from "../Constants/baseApi"; // you said you'll handle the import path

export default function Profile() {
  const [copied, setCopied] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const parseErr = (e) => {
    const raw = e?.response?.data;
    if (!raw) return "Request failed.";
    if (typeof raw === "string") return raw;
    if (raw.message) return raw.message;
    if (raw.error) return raw.error;
    if (raw.data && typeof raw.data === "string") return raw.data;
    return "Request failed.";
  };

  useEffect(() => {
    let isMounted = true;
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const res = await baseApi.get("/user/my-profile");
        // assuming { data: { ...profile } } or { data: { data: { ... } } }
        const payload = res?.data?.data ?? res?.data ?? null;
        if (isMounted) setUser(payload);
      } catch (e) {
        if (isMounted) setErr(parseErr(e));
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  const firstName  = (user?.firstName  ?? "").trim();
  const middleName = (user?.middleName ?? "").trim();
  const lastName   = (user?.lastName   ?? "").trim();

  const fullName = useMemo(() => {
    return [firstName, middleName, lastName].filter(Boolean).join(" ") || "-";
  }, [firstName, middleName, lastName]);

  const initials = useMemo(() => {
    const parts = [firstName, middleName, lastName]
      .map((s) => (s || "").trim())
      .filter(Boolean)
      .map((s) => s[0].toUpperCase())
      .slice(0, 2);
    return parts.join("") || "U";
  }, [firstName, middleName, lastName]);

  async function copy(text, label) {
    if (!text) return;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(String(text));
      } else {
        const ta = document.createElement("textarea");
        ta.value = String(text);
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(label);
      setTimeout(() => setCopied(""), 1200);
    } catch {}
  }

  const roleText = (user?.role ?? "User").toString();
  const roleClass = roleText.toLowerCase();
  const userId = user?.id ?? user?.userId ?? "-";
  const email = user?.email ?? "-";
  const phone = user?.phoneNumber ?? user?.phone ?? "-";
  const address = user?.permanentFullAddress ?? user?.address ?? "-";

  return (
    <div className="wrap">
      <div className="bg-ornament" />

      <main className="profile">
        <div className="brandbar">
          <div className="brand-left">
            <span className="brand-dot" />
            <span className="brand-name">Care Nation</span>
          </div>
          <div className="brand-right">
            <span className="chip id">#{userId}</span>
            <span className={`chip role ${roleClass}`}>{roleText || "User"}</span>
          </div>
        </div>

        {loading ? (
          <div className="loader">Loading profile…</div>
        ) : err ? (
          <div className="error">{err}</div>
        ) : (
          <>
            <header className="header">
              <div className="avatar" aria-hidden="true">
                <span>{initials}</span>
                <div className="avatar-ring" />
              </div>

              <div className="head-text">
                <h1 className="name">{fullName}</h1>
                <p className="sub">Member Profile</p>
              </div>
            </header>

            <section className="grid">
              <div className="row">
                <div className="label">Email</div>
                <div className="value">
                  {email}
                  {email && email !== "-" && (
                    <button
                      className="btn ghost"
                      onClick={() => copy(email, "email")}
                      title="Copy email"
                    >
                      <CopyIcon />
                      <span>Copy</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="row">
                <div className="label">Phone</div>
                <div className="value">
                  {phone}
                  {phone && phone !== "-" && (
                    <button
                      className="btn ghost"
                      onClick={() => copy(phone, "phone")}
                      title="Copy phone"
                    >
                      <CopyIcon />
                      <span>Copy</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="row">
                <div className="label">Full Address</div>
                <div className="value">{address}</div>
              </div>

              <div className="row">
                <div className="label">Member Name</div>
                <div className="value">{fullName}</div>
              </div>
            </section>

            <footer className="actions">
              <button className="btn primary" onClick={() => copy(fullName, "name")}>
                <UserIcon />
                <span>Copy Name</span>
              </button>
              <button className="btn outline" onClick={() => copy(`#${userId}`, "id")}>
                <TagIcon />
                <span>Copy ID</span>
              </button>

              <span
                className={`toast ${copied ? "show" : ""}`}
                role="status"
                aria-live="polite"
                aria-atomic="true"
              >
                {copied ? `Copied ${copied}!` : ""}
              </span>
            </footer>
          </>
        )}
      </main>

      <footer className="tiny">
        <span>© {new Date().getFullYear()} Care Nation</span>
      </footer>
    </div>
  );
}

/* --- tiny inline icons (no deps) --- */
function CopyIcon() {
  return (
    <svg
      className="i"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M16 1H6a2 2 0 0 0-2 2v12h2V3h10V1zm3 4H10a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm0 16h-9V7h9v14z" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      className="i"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 12a5 5 0 1 0-5-5 5.006 5.006 0 0 0 5 5zm0 2c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5z" />
    </svg>
  );
}

function TagIcon() {
  return (
    <svg
      className="i"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M21.41 11.58 12.42 2.59A2 2 0 0 0 11 2H4a2 2 0 0 0-2 2v7a2 2 0 0 0 .59 1.41l8.99 8.99a2 2 0 0 0 2.82 0l7.01-7.01a2 2 0 0 0 0-2.82zM6.5 8A1.5 1.5 0 1 1 8 6.5 1.5 1.5 0 0 1 6.5 8z" />
    </svg>
  );
}
