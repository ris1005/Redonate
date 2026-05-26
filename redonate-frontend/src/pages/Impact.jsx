import { useEffect, useState } from "react";
import { BarChart3, Bike, CheckCircle2, HeartHandshake, Package, Users } from "lucide-react";
import api from "../api/axios";

const Impact = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/admin/impact").then((res) => setStats(res.data)).catch(() => setStats({}));
  }, []);

  const cards = [
    { label: "Items pledged", value: stats?.totalItems || 0, icon: <Package /> },
    { label: "Items delivered", value: stats?.deliveredItems || 0, icon: <CheckCircle2 /> },
    { label: "Requests fulfilled", value: stats?.fulfilledRequests || 0, icon: <HeartHandshake /> },
    { label: "Active donors", value: stats?.activeDonors || 0, icon: <Users /> },
    { label: "Active agents", value: stats?.activeAgents || 0, icon: <Bike /> },
    { label: "Estimated km covered", value: stats?.estimatedKilometersCovered || 0, icon: <BarChart3 /> },
  ];

  return (
    <main className="feature-page">
      <section className="feature-header">
        <h1>Live Impact</h1>
        <p>Real platform metrics from donations, deliveries, and request fulfillment.</p>
      </section>

      <section className="metric-grid">
        {cards.map((card) => (
          <article className="metric-card" key={card.label}>
            {card.icon}
            <strong>{card.value}</strong>
            <span>{card.label}</span>
          </article>
        ))}
      </section>

      <section className="feature-panel">
        <h2>Category Breakdown</h2>
        <div className="category-bars">
          {(stats?.categoryBreakdown || []).map((item) => (
            <div className="category-bar" key={item._id}>
              <span>{item._id}</span>
              <div><i style={{ width: `${Math.min(item.total * 8, 100)}%` }} /></div>
              <strong>{item.total}</strong>
            </div>
          ))}
          {stats && (stats.categoryBreakdown || []).length === 0 && <p>No donations yet.</p>}
        </div>
      </section>
    </main>
  );
};

export default Impact;
