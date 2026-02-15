import React, { useState, useEffect } from "react";
import { FaChartLine, FaUserCheck, FaUsers, FaWallet } from "react-icons/fa";
import baseApi from "../Constants/baseApi";

export default function StatsCards() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchStats() {
      try {
        const [individualRes, salesRes, referralRes, downlineRes] = await Promise.all([
          baseApi.get("/distributor/individual"),
          baseApi.get("/reports/total-sales"),
          baseApi.get("/distributor/total-referrals"),
          baseApi.get("/distributor/total-downlines")
        ]);

        if (!mounted) return;

        const individual = individualRes?.data ?? {};
        const sales = salesRes?.data ?? {};
        const totalReferrals = referralRes?.data ?? {};
        const totalDownlines = downlineRes?.data ?? {};

        setStats({
          totalReferrals: Number(totalReferrals.totalReferrals) || 0,
          totalDownlines: Number(totalDownlines.totalDownlines) || 0,
          totalSales: (Number(sales.teamSales) || 0) + (Number(sales.personalSales) || 0),
          totalWallet: Number(individual.totalWallet) || 0,
          // keeping your existing field name from earlier sample: totalcomission
          totalCommissions: Number(individual.totalcomission) || 0,
        });
      } catch (err) {
        console.error("Failed to load stats:", err);
        if (mounted) setStats(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchStats();
    return () => { mounted = false; };
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!stats) return <div>No data available.</div>;

  return (
    <div className="stats-grid">
      <div className="card stats-card stats-referrals">
        <FaUsers />
        <strong>Total Referrals</strong>
        <h2>{stats.totalReferrals}</h2>
      </div>

      <div className="card stats-card stats-downline">
        <FaUserCheck />
        <strong>Total Downline</strong>
        <h2>{stats.totalDownlines}</h2>
      </div>

      <div className="card stats-card stats-sales">
        <FaChartLine />
        <strong>Total Sales</strong>
        <h2>Rs. {stats.totalSales.toLocaleString()}</h2>
      </div>

      <div className="card stats-card stats-wallet">
        <FaWallet />
        <strong>Total Wallet</strong>
        <h2>Rs. {stats.totalWallet.toLocaleString()}</h2>
      </div>

      <div className="card stats-card stats-commission">
        💰
        <strong>Total Commission</strong>
        <h2>Rs. {stats.totalCommissions.toLocaleString()}</h2>
      </div>
    </div>
  );
}
