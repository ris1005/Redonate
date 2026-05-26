import { useEffect, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import api from "../api/axios";

const Notifications = () => {
  const [items, setItems] = useState([]);

  const fetchNotifications = async () => {
    const res = await api.get("/user/notifications");
    setItems(res.data || []);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markRead = async () => {
    await api.patch("/user/notifications/read");
    fetchNotifications();
  };

  return (
    <main className="feature-page">
      <section className="feature-header row-header">
        <div>
          <h1><Bell size={28} /> Notifications</h1>
          <p>Updates for matches, OTP handoffs, deliveries, ratings, and admin review.</p>
        </div>
        <button className="utility-btn" onClick={markRead}><CheckCheck size={18} /> Mark read</button>
      </section>

      <section className="notification-list">
        {items.length === 0 ? (
          <div className="empty-dashboard"><Bell size={44} /><p>No notifications yet.</p></div>
        ) : (
          items.map((item) => (
            <article className={`notification-item ${item.read ? "" : "unread"}`} key={item._id}>
              <strong>{item.title}</strong>
              <p>{item.message}</p>
              <span>{new Date(item.createdAt).toLocaleString()}</span>
            </article>
          ))
        )}
      </section>
    </main>
  );
};

export default Notifications;
