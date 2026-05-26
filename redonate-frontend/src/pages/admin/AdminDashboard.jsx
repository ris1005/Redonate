import { useEffect, useState } from "react";
import { ShieldCheck, AlertTriangle, Users, ClipboardList, PackageCheck } from "lucide-react";
import api from "../../api/axios";

const AdminDashboard = () => {
  const [data, setData] = useState(null);

  const fetchDashboard = async () => {
    const res = await api.get("/admin/dashboard");
    setData(res.data);
  };

  useEffect(() => {
    fetchDashboard().catch(() => setData({ users: [], requests: [], donations: [], reportedDonations: [], summary: {} }));
  }, []);

  const verify = async (id) => {
    await api.patch(`/admin/verify-user/${id}`);
    fetchDashboard();
  };

  const closeRequest = async (id) => {
    await api.patch(`/admin/close-request/${id}`);
    fetchDashboard();
  };

  return (
    <main className="feature-page">
      <section className="feature-header">
        <h1>Admin Control</h1>
        <p>Verify partners, watch active deliveries, close stale requests, and inspect reports.</p>
      </section>

      <section className="metric-grid">
        <article className="metric-card"><Users /><strong>{data?.summary?.totalUsers || 0}</strong><span>Users</span></article>
        <article className="metric-card"><ClipboardList /><strong>{data?.summary?.openRequests || 0}</strong><span>Open requests</span></article>
        <article className="metric-card"><PackageCheck /><strong>{data?.summary?.deliveredDonations || 0}</strong><span>Delivered</span></article>
        <article className="metric-card"><AlertTriangle /><strong>{data?.reportedDonations?.length || 0}</strong><span>Reports</span></article>
      </section>

      <section className="feature-panel">
        <h2>User Verification</h2>
        <div className="admin-list">
          {(data?.users || []).map((user) => (
            <article key={user._id}>
              <div>
                <strong>{user.name}</strong>
                <span>{user.role} | {user.email} | score {Number(user.trustScore || 0).toFixed(1)}</span>
              </div>
              {user.isVerified ? <span className="status-chip">Verified</span> : <button onClick={() => verify(user._id)}><ShieldCheck size={16} /> Verify</button>}
            </article>
          ))}
        </div>
      </section>

      <section className="feature-panel">
        <h2>Open Requests</h2>
        <div className="admin-list">
          {(data?.requests || []).map((request) => (
            <article key={request._id}>
              <div>
                <strong>{request.category} | {request.urgency}</strong>
                <span>{request.description} ({request.quantityReceived}/{request.quantityNeeded})</span>
              </div>
              {request.status === "open" && <button onClick={() => closeRequest(request._id)}>Close</button>}
            </article>
          ))}
        </div>
      </section>

      <section className="feature-panel">
        <h2>Reports</h2>
        <div className="admin-list">
          {(data?.reportedDonations || []).length === 0 ? <p>No reports submitted.</p> : (data?.reportedDonations || []).map((donation) => (
            <article key={donation._id}>
              <div>
                <strong>{donation.category} donation</strong>
                <span>{donation.reports?.length || 0} report(s), current status: {donation.status}</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
};

export default AdminDashboard;
