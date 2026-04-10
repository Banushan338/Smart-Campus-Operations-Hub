function Sidebar({
  isAdminRoute,
  isTechnicianRoute,
  isAdminUser,
  isTechnicianUser,
  activePage,
  onNavigatePage,
  onGoAdmin,
  onGoTechnician,
  user,
}) {
  return (
    <aside className="left-rail">
      <h2>Operations</h2>
      <p>{user?.email || 'smartcampus.local'}</p>
      {!isAdminUser && (
        <>
          <button className={!isAdminRoute && activePage === 'resources' ? 'rail-item active' : 'rail-item'} onClick={() => onNavigatePage('resources')}>
            Resources
          </button>
          <button className={!isAdminRoute && activePage === 'bookings' ? 'rail-item active' : 'rail-item'} onClick={() => onNavigatePage('bookings')}>
            My Bookings
          </button>
          <button className={!isAdminRoute && activePage === 'maintenance' ? 'rail-item active' : 'rail-item'} onClick={() => onNavigatePage('maintenance')}>
            Maintenance
          </button>
        </>
      )}
      {isAdminUser && (
        <button className={isAdminRoute ? 'rail-item active' : 'rail-item'} onClick={onGoAdmin}>
          Admin Dashboard
        </button>
      )}
      {isTechnicianUser && (
        <button className={isTechnicianRoute ? 'rail-item active' : 'rail-item'} onClick={onGoTechnician}>
          Technician Dashboard
        </button>
      )}
    </aside>
  )
}

export default Sidebar
