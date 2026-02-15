import React, { useEffect, useState } from "react";
import "../../styles/RecentActivity.css";
import baseApi from "../Constants/baseApi"; // ✅ added

function RecentActivity() {
  const [activities, setActivities] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fromIso = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    baseApi
      .get(
        "reports/full-transactional-report?from=" +
          encodeURIComponent(fromIso)
      )
      .then((res) => {
        if (!mounted) return;
        const arr = Array.isArray(res.data) ? res.data : [];
        setActivities(arr.slice(0, 5));
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load recent activity:", err);
        if (mounted) {
          setActivities([]);
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <div>Loading recent activity...</div>;
  if (!activities || activities.length === 0)
    return <div>No recent activity.</div>;

  return (
    <div className="card">
      <h3>🕒 Recent Activity</h3>
      <ul style={{ marginTop: "12px", paddingLeft: "20px", lineHeight: "1.8" }}>
        {activities.map((activity, index) => (
          <li key={index}>
            <strong>{activity.transactionType}</strong>
            <span className="activity-meta">
              {activity.userName} ({activity.userEmail}) — Rs. {activity.amount}
              <br />
              on{" "}
              {activity.date
                ? new Date(activity.date).toLocaleDateString()
                : "Unknown"}
            </span>
            <span className={`status-badge ${activity.status?.toLowerCase()}`}>
              {activity.status}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default RecentActivity;
