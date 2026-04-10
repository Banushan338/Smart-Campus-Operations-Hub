import { useMemo, useState } from 'react'
import { verifyCheckInPayload } from '../lib/checkIn'

function AdminPage({
  resources,
  resourceDraft,
  tickets,
  bookingsAll,
  reviewReasonByBookingId,
  onSetResourceDraft,
  onCreateResource,
  onUpdateResource,
  onDeleteResource,
  onSetReviewReasonByBookingId,
  onReviewBooking,
  onCheckInBooking,
  onUpdateTicketById,
  onRefresh,
}) {
  const [editingResourceId, setEditingResourceId] = useState(null)
  const [resourceEditForm, setResourceEditForm] = useState({
    name: '',
    location: '',
    capacity: '',
    resourceType: 'LECTURE_HALL',
    status: 'ACTIVE',
  })
  const [assignByTicketId, setAssignByTicketId] = useState({})
  const [qrScanPayload, setQrScanPayload] = useState('')
  const [qrVerificationMessage, setQrVerificationMessage] = useState('')

  const resourceStats = useMemo(() => {
    const total = resources.length
    const active = resources.filter((item) => item.status === 'ACTIVE').length
    const booked = resources.filter((item) => item.isBooked).length
    const outOfService = resources.filter((item) => item.status === 'OUT_OF_SERVICE').length
    return { total, active, booked, outOfService }
  }, [resources])

  const ticketStats = useMemo(() => {
    const open = tickets.filter((item) => item.status === 'OPEN').length
    const inProgress = tickets.filter((item) => item.status === 'IN_PROGRESS').length
    const resolved = tickets.filter((item) => item.status === 'RESOLVED').length
    return { open, inProgress, resolved }
  }, [tickets])

  const topResources = useMemo(() => {
    const counts = bookingsAll.reduce((acc, booking) => {
      const key = booking.resourceName || 'Unknown'
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {})
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }, [bookingsAll])

  const peakBookingHours = useMemo(() => {
    const hourCounts = bookingsAll.reduce((acc, booking) => {
      const date = new Date(booking.startAt)
      if (Number.isNaN(date.getTime())) return acc
      const hour = date.getHours()
      acc[hour] = (acc[hour] || 0) + 1
      return acc
    }, {})
    return Object.entries(hourCounts)
      .map(([hour, count]) => ({ hour: Number(hour), count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }, [bookingsAll])

  const maxTopResourceCount = Math.max(1, ...topResources.map((item) => item.count))
  const maxPeakHourCount = Math.max(1, ...peakBookingHours.map((item) => item.count))

  const slaStats = useMemo(() => {
    const firstResponseDurations = tickets
      .map((ticket) => {
        if (!ticket.createdAt || !ticket.updatedAt) return null
        const createdAt = new Date(ticket.createdAt).getTime()
        const updatedAt = new Date(ticket.updatedAt).getTime()
        if (Number.isNaN(createdAt) || Number.isNaN(updatedAt) || updatedAt < createdAt) return null
        return updatedAt - createdAt
      })
      .filter((value) => value != null)

    const resolutionDurations = tickets
      .map((ticket) => {
        if (!ticket.createdAt || !ticket.closedAt) return null
        const createdAt = new Date(ticket.createdAt).getTime()
        const closedAt = new Date(ticket.closedAt).getTime()
        if (Number.isNaN(createdAt) || Number.isNaN(closedAt) || closedAt < createdAt) return null
        return closedAt - createdAt
      })
      .filter((value) => value != null)

    const avg = (values) => {
      if (!values.length) return null
      return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)
    }

    return {
      firstResponseMs: avg(firstResponseDurations),
      resolutionMs: avg(resolutionDurations),
      respondedCount: firstResponseDurations.length,
      resolvedCount: resolutionDurations.length,
    }
  }, [tickets])

  function startEditResource(item) {
    setEditingResourceId(item.id)
    setResourceEditForm({
      name: item.name || '',
      location: item.location || '',
      capacity: item.capacity ?? '',
      resourceType: item.resourceType || 'LECTURE_HALL',
      status: item.status || 'ACTIVE',
    })
  }

  function cancelEditResource() {
    setEditingResourceId(null)
    setResourceEditForm({
      name: '',
      location: '',
      capacity: '',
      resourceType: 'LECTURE_HALL',
      status: 'ACTIVE',
    })
  }

  function submitCreateResource(event) {
    event.preventDefault()
    onCreateResource()
  }

  async function submitResourceUpdate(id) {
    await onUpdateResource(id, resourceEditForm)
    cancelEditResource()
  }

  async function assignTechnician(ticketId) {
    await onUpdateTicketById(ticketId, {
      assignedToUserId: assignByTicketId[ticketId] || '',
      status: 'IN_PROGRESS',
    })
    setAssignByTicketId((prev) => ({ ...prev, [ticketId]: '' }))
  }

  function formatDuration(ms) {
    if (!ms && ms !== 0) return 'N/A'
    const minutes = Math.round(ms / 60000)
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const remainder = minutes % 60
    if (hours < 24) return `${hours}h ${remainder}m`
    const days = Math.floor(hours / 24)
    return `${days}d ${hours % 24}h`
  }

  function runQrVerification() {
    const result = verifyCheckInPayload(qrScanPayload, bookingsAll)
    if (!result.ok) {
      setQrVerificationMessage(result.message)
      return
    }
    onCheckInBooking(result.booking.id)
    setQrVerificationMessage(`Check-in verified for booking #${result.booking.id} (${result.booking.resourceName}).`)
  }

  return (
    <section className="admin-page">
      <div className="section-head">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Manage resources, booking approvals, and maintenance assignment workflows.</p>
        </div>
        <div className="section-head-actions">
          <button className="btn light" onClick={onRefresh}>Refresh</button>
        </div>
      </div>

      <section className="metrics admin-metrics-grid">
        <article className="card metric">
          <h3>{resourceStats.total}</h3>
          <p>Total resources</p>
        </article>
        <article className="card metric">
          <h3>{resourceStats.active}</h3>
          <p>Active resources</p>
        </article>
        <article className="card metric">
          <h3>{resourceStats.booked}</h3>
          <p>Currently booked</p>
        </article>
        <article className="card metric">
          <h3>{resourceStats.outOfService}</h3>
          <p>Out of service</p>
        </article>
        <article className="card metric">
          <h3>{ticketStats.open}</h3>
          <p>Open tickets</p>
        </article>
        <article className="card metric">
          <h3>{ticketStats.inProgress}</h3>
          <p>In progress tickets</p>
        </article>
        <article className="card metric">
          <h3>{ticketStats.resolved}</h3>
          <p>Resolved tickets</p>
        </article>
        <article className="card metric">
          <h3>{formatDuration(slaStats.firstResponseMs)}</h3>
          <p>Avg first response ({slaStats.respondedCount})</p>
        </article>
        <article className="card metric">
          <h3>{formatDuration(slaStats.resolutionMs)}</h3>
          <p>Avg resolution ({slaStats.resolvedCount})</p>
        </article>
      </section>

      <section className="table-wrap in-content">
        <h2>Usage analytics</h2>
        <div className="admin-analytics-grid">
          <article className="card">
            <h3>Top resources</h3>
            {topResources.length === 0 ? (
              <p className="muted">No booking data yet.</p>
            ) : (
              <ol className="admin-ranking-list chart-list">
                {topResources.map((item) => (
                  <li key={item.name}>
                    <span className="chart-label">{item.name}</span>
                    <div className="chart-bar-wrap">
                      <div className="chart-bar-fill" style={{ width: `${(item.count / maxTopResourceCount) * 100}%` }} />
                    </div>
                    <strong>{item.count}</strong>
                  </li>
                ))}
              </ol>
            )}
          </article>
          <article className="card">
            <h3>Peak booking hours</h3>
            {peakBookingHours.length === 0 ? (
              <p className="muted">No booking data yet.</p>
            ) : (
              <ol className="admin-ranking-list chart-list">
                {peakBookingHours.map((item) => (
                  <li key={item.hour}>
                    <span className="chart-label">{String(item.hour).padStart(2, '0')}:00</span>
                    <div className="chart-bar-wrap">
                      <div className="chart-bar-fill" style={{ width: `${(item.count / maxPeakHourCount) * 100}%` }} />
                    </div>
                    <strong>{item.count}</strong>
                  </li>
                ))}
              </ol>
            )}
          </article>
        </div>
      </section>

      <section className="table-wrap in-content">
        <h2>QR check-in verification</h2>
        <div className="admin-checkin-verify">
          <textarea
            className="admin-reason-input"
            rows={3}
            placeholder="Paste scanned QR payload here"
            value={qrScanPayload}
            onChange={(e) => setQrScanPayload(e.target.value)}
          />
          <button className="btn primary" type="button" onClick={runQrVerification}>
            Verify check-in
          </button>
        </div>
        {qrVerificationMessage && <p className="muted">{qrVerificationMessage}</p>}
      </section>

      <section className="card in-content admin-resource-form">
        <h3>Add resource</h3>
        <form className="form-grid admin-form-grid" onSubmit={submitCreateResource}>
          <input
            required
            placeholder="Resource name"
            value={resourceDraft.name}
            onChange={(e) => onSetResourceDraft((prev) => ({ ...prev, name: e.target.value }))}
          />
          <input
            required
            placeholder="Location"
            value={resourceDraft.location}
            onChange={(e) => onSetResourceDraft((prev) => ({ ...prev, location: e.target.value }))}
          />
          <input
            required
            type="number"
            min={1}
            placeholder="Capacity"
            value={resourceDraft.capacity}
            onChange={(e) => onSetResourceDraft((prev) => ({ ...prev, capacity: e.target.value }))}
          />
          <select
            value={resourceDraft.resourceType}
            onChange={(e) => onSetResourceDraft((prev) => ({ ...prev, resourceType: e.target.value }))}
          >
            <option value="LECTURE_HALL">Lecture Hall</option>
            <option value="LAB">Lab</option>
            <option value="MEETING_ROOM">Meeting Room</option>
            <option value="EQUIPMENT">Equipment</option>
          </select>
          <select
            value={resourceDraft.status}
            onChange={(e) => onSetResourceDraft((prev) => ({ ...prev, status: e.target.value }))}
          >
            <option value="ACTIVE">Active</option>
            <option value="OUT_OF_SERVICE">Out of service</option>
          </select>
          <button className="btn primary" type="submit">Add Resource</button>
        </form>
      </section>

      <section className="table-wrap in-content">
        <h2>Resource management</h2>
        <table className="admin-bookings-table">
          <thead>
            <tr><th>Name</th><th>Location</th><th>Capacity</th><th>Type</th><th>Status</th><th>Action</th></tr>
          </thead>
          <tbody>
            {resources.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.location}</td>
                <td>{item.capacity}</td>
                <td>{item.resourceType}</td>
                <td>{item.status}</td>
                <td className="admin-decision-cell">
                  <div className="admin-decision-actions">
                    <button className="btn light btn-compact" onClick={() => startEditResource(item)} type="button">Edit</button>
                    <button className="btn light btn-compact" onClick={() => onDeleteResource(item.id)} type="button">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {editingResourceId && (
        <section className="card in-content admin-resource-form">
          <h3>Edit resource #{editingResourceId}</h3>
          <form className="form-grid admin-form-grid" onSubmit={(event) => { event.preventDefault(); void submitResourceUpdate(editingResourceId) }}>
            <input required value={resourceEditForm.name} onChange={(e) => setResourceEditForm((prev) => ({ ...prev, name: e.target.value }))} />
            <input required value={resourceEditForm.location} onChange={(e) => setResourceEditForm((prev) => ({ ...prev, location: e.target.value }))} />
            <input required type="number" min={1} value={resourceEditForm.capacity} onChange={(e) => setResourceEditForm((prev) => ({ ...prev, capacity: e.target.value }))} />
            <select value={resourceEditForm.resourceType} onChange={(e) => setResourceEditForm((prev) => ({ ...prev, resourceType: e.target.value }))}>
              <option value="LECTURE_HALL">Lecture Hall</option>
              <option value="LAB">Lab</option>
              <option value="MEETING_ROOM">Meeting Room</option>
              <option value="EQUIPMENT">Equipment</option>
            </select>
            <select value={resourceEditForm.status} onChange={(e) => setResourceEditForm((prev) => ({ ...prev, status: e.target.value }))}>
              <option value="ACTIVE">Active</option>
              <option value="OUT_OF_SERVICE">Out of service</option>
            </select>
            <div className="admin-decision-actions">
              <button className="btn primary" type="submit">Save</button>
              <button className="btn light" type="button" onClick={cancelEditResource}>Cancel</button>
            </div>
          </form>
        </section>
      )}

      <section className="table-wrap in-content">
        <h2>Booking approval</h2>
        <table className="admin-bookings-table">
          <thead>
            <tr><th>Requester</th><th>Resource</th><th>Schedule</th><th>Status</th><th>Check-in</th><th>Reason</th><th>Decision</th></tr>
          </thead>
          <tbody>
            {bookingsAll.map((item) => (
              <tr key={item.id}>
                <td>{item.requesterEmail}</td>
                <td>{item.resourceName}</td>
                <td>{new Date(item.startAt).toLocaleString()} - {new Date(item.endAt).toLocaleString()}</td>
                <td>{item.status}</td>
                <td>
                  {item.checkedInAt
                    ? `Verified ${new Date(item.checkedInAt).toLocaleString()} by ${item.checkedInByEmail || 'staff'}`
                    : '-'}
                </td>
                <td>
                  <input
                    className="admin-reason-input"
                    placeholder="Reason (required for rejection)"
                    value={reviewReasonByBookingId[item.id] || ''}
                    onChange={(e) => onSetReviewReasonByBookingId((prev) => ({ ...prev, [item.id]: e.target.value }))}
                  />
                </td>
                <td className="admin-decision-cell">
                  {item.status === 'PENDING' && (
                    <div className="admin-decision-actions">
                      <button className="btn primary btn-compact" onClick={() => onReviewBooking(item.id, 'APPROVED')}>Approve</button>
                      <button className="btn light btn-compact" onClick={() => onReviewBooking(item.id, 'REJECTED')}>Reject</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="table-wrap in-content">
        <h2>Maintenance reports and technician assignment</h2>
        <table className="admin-bookings-table">
          <thead>
            <tr><th>ID</th><th>Category</th><th>Priority</th><th>Status</th><th>Assigned</th><th>Assign technician</th></tr>
          </thead>
          <tbody>
            {tickets.map((item) => (
              <tr key={item.id}>
                <td>#{item.id}</td>
                <td>{item.category}</td>
                <td>{item.priority}</td>
                <td>{item.status}</td>
                <td>{item.assignedToEmail || '-'}</td>
                <td className="admin-decision-cell">
                  <div className="admin-decision-actions">
                    <input
                      className="admin-reason-input admin-assign-input"
                      type="number"
                      min={1}
                      placeholder="Technician user ID"
                      value={assignByTicketId[item.id] || ''}
                      onChange={(e) => setAssignByTicketId((prev) => ({ ...prev, [item.id]: e.target.value }))}
                    />
                    <button
                      className="btn primary btn-compact"
                      type="button"
                      disabled={!assignByTicketId[item.id]}
                      onClick={() => assignTechnician(item.id)}
                    >
                      Assign
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </section>
  )
}

export default AdminPage
