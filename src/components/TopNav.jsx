function TopNav({
  user,
  onLogout,
  unreadCount = 0,
  onOpenNotifications,
}) {
  const name = user?.displayName || user?.email || 'Campus User'
  const initials = name
    .split(' ')
    .map((part) => part[0] || '')
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'U'

  return (
    <header className="top-nav">
      <div className="brand">SmartCampus Core</div>
      <div className="search-box">
        <input placeholder="Search resources..." />
      </div>
      <button className="btn light btn-compact" onClick={onOpenNotifications}>
        Notifications ({unreadCount})
      </button>
      <div className="user-chip" title={user?.email || 'Signed in user'}>
        <span className="avatar">{initials}</span>
        <div>
          <strong>{name}</strong>
          <small>{user?.role || 'USER'}</small>
        </div>
      </div>
      <button className="btn light btn-compact" onClick={onLogout}>Logout</button>
    </header>
  )
}

export default TopNav
