function NotificationsPanel({
  notifications,
  notificationPreferences,
  onSetNotificationPreference,
  onMarkAllRead,
  onMarkRead,
}) {
  return (
    <section className="card" style={{ marginBottom: 16 }}>
      <div className="section-head">
        <h3>Notifications</h3>
        <button className="btn light" onClick={onMarkAllRead}>Mark all read</button>
      </div>
      <div className="notification-preferences">
        <label>
          <input
            type="checkbox"
            checked={Boolean(notificationPreferences.booking)}
            onChange={(e) => onSetNotificationPreference('booking', e.target.checked)}
          />
          Booking
        </label>
        <label>
          <input
            type="checkbox"
            checked={Boolean(notificationPreferences.maintenance)}
            onChange={(e) => onSetNotificationPreference('maintenance', e.target.checked)}
          />
          Maintenance
        </label>
        <label>
          <input
            type="checkbox"
            checked={Boolean(notificationPreferences.system)}
            onChange={(e) => onSetNotificationPreference('system', e.target.checked)}
          />
          System
        </label>
      </div>
      {notifications.length === 0 && <p>No notifications.</p>}
      {notifications.map((item) => (
        <article key={item.id} className="card" style={{ marginBottom: 8, opacity: item.read ? 0.7 : 1 }}>
          <strong>{item.title}</strong>
          <p>{item.message}</p>
          <small>{new Date(item.createdAt).toLocaleString()}</small>
          {!item.read && (
            <button className="btn light btn-compact" onClick={() => onMarkRead(item.id)}>
              Mark read
            </button>
          )}
        </article>
      ))}
    </section>
  )
}

export default NotificationsPanel
