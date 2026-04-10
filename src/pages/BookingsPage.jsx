import { Fragment, useEffect, useMemo, useState } from 'react'
import QRCode from 'qrcode'
import { buildCheckInPayload } from '../lib/checkIn'

function toDatetimeLocalValue(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function BookingsPage({ bookingsMine, loading, onCancelBooking, onRefresh, onUpdateBooking }) {
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({
    startAt: '',
    endAt: '',
    purpose: '',
    expectedAttendees: '',
  })
  const [showQrForBookingId, setShowQrForBookingId] = useState(null)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('')

  const selectedApprovedBooking = useMemo(
    () => bookingsMine.find((item) => item.id === showQrForBookingId && item.status === 'APPROVED') || null,
    [bookingsMine, showQrForBookingId],
  )

  useEffect(() => {
    if (!selectedApprovedBooking) return
    let active = true
    const payload = buildCheckInPayload(selectedApprovedBooking)
    QRCode.toDataURL(payload, { width: 200, margin: 1 })
      .then((url) => {
        if (active) setQrCodeDataUrl(url)
      })
      .catch(() => {
        if (active) setQrCodeDataUrl('')
      })
    return () => {
      active = false
    }
  }, [selectedApprovedBooking])

  function startEdit(item) {
    setEditingId(item.id)
    setEditForm({
      startAt: toDatetimeLocalValue(item.startAt),
      endAt: toDatetimeLocalValue(item.endAt),
      purpose: item.purpose || '',
      expectedAttendees: item.expectedAttendees != null ? String(item.expectedAttendees) : '',
    })
  }

  function cancelEdit() {
    setEditingId(null)
  }

  async function handleSaveEdit(event) {
    event.preventDefault()
    if (!editingId) return
    try {
      await onUpdateBooking(editingId, editForm)
      setEditingId(null)
    } catch {
      /* errorMessage from hub; keep edit form open */
    }
  }

  function statusLabel(status) {
    if (status === 'PENDING') return 'Pending'
    if (status === 'APPROVED') return 'Approved'
    if (status === 'CANCELLED') return 'Cancelled'
    if (status === 'REJECTED') return 'Rejected'
    return status || '-'
  }

  return (
    <section>
      <div className="section-head">
        <div>
          <span className="eyebrow">MODULE B</span>
          <h1>My bookings</h1>
          <p className="muted" style={{ marginTop: 8 }}>
            Bookings you have requested. To create a booking, open Resources and choose <strong>Book</strong> on a
            resource. Pending bookings can be edited until they are approved or cancelled.
          </p>
        </div>
        <button className="btn light" type="button" disabled={loading} onClick={onRefresh}>
          Refresh
        </button>
      </div>

      <section className="table-wrap in-content">
        {selectedApprovedBooking && (
          <div className="card booking-qr-panel">
            <div className="booking-qr-header">
              <h4>QR check-in pass</h4>
              <button
                className="btn light btn-compact"
                type="button"
                onClick={() => {
                  setShowQrForBookingId(null)
                  setQrCodeDataUrl('')
                }}
              >
                Close
              </button>
            </div>
            <p className="muted">
              Show this QR to admin staff for check-in verification.
            </p>
            <p className="muted" style={{ marginTop: 0 }}>
              #{selectedApprovedBooking.id} - {selectedApprovedBooking.resourceName}
            </p>
            {qrCodeDataUrl ? (
              <img src={qrCodeDataUrl} alt="Booking check-in QR code" className="booking-qr-image" />
            ) : (
              <p className="muted">Generating QR...</p>
            )}
          </div>
        )}

        {bookingsMine.length === 0 ? (
          <p className="muted" style={{ margin: '12px 0' }}>
            No bookings yet. Go to <strong>Resources</strong> and use <strong>Book</strong> on an available resource.
          </p>
        ) : (
          <table className="bookings-table">
            <thead>
              <tr>
                <th>Resource</th>
                <th>Start</th>
                <th>End</th>
                <th>Status</th>
                <th>Reason</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookingsMine.map((item) => (
                <Fragment key={item.id}>
                  <tr>
                    <td className="bookings-col-resource">{item.resourceName}</td>
                    <td>{new Date(item.startAt).toLocaleString()}</td>
                    <td>{new Date(item.endAt).toLocaleString()}</td>
                    <td>
                      <span className={`booking-status-pill status-${String(item.status || '').toLowerCase()}`}>
                        {statusLabel(item.status)}
                      </span>
                    </td>
                    <td>{item.rejectionReason || '-'}</td>
                    <td className="bookings-col-actions">
                      <div className="booking-row-actions">
                        {item.status === 'PENDING' && (
                          <button
                            className="btn light btn-compact"
                            type="button"
                            disabled={loading}
                            onClick={() => (editingId === item.id ? cancelEdit() : startEdit(item))}
                          >
                            {editingId === item.id ? 'Close' : 'Edit'}
                          </button>
                        )}
                        {(item.status === 'PENDING' || item.status === 'APPROVED') && (
                          <button
                            className="btn light btn-compact"
                            type="button"
                            disabled={loading}
                            onClick={() => onCancelBooking(item.id)}
                          >
                            Cancel booking
                          </button>
                        )}
                        {item.status === 'APPROVED' && (
                          <button
                            className="btn primary btn-compact"
                            type="button"
                            onClick={() => {
                              setShowQrForBookingId((prev) => (prev === item.id ? null : item.id))
                              if (showQrForBookingId === item.id) setQrCodeDataUrl('')
                            }}
                          >
                            {showQrForBookingId === item.id ? 'Hide QR' : 'Show QR'}
                          </button>
                        )}
                        {item.status !== 'PENDING' && item.status !== 'APPROVED' && (
                          <span className="bookings-empty-action">-</span>
                        )}
                      </div>
                    </td>
                  </tr>
                  {editingId === item.id && (
                    <tr className="booking-edit-row">
                      <td colSpan={6}>
                        <form className="booking-edit-form card" onSubmit={handleSaveEdit}>
                          <h4>Edit booking</h4>
                          <p className="muted" style={{ marginTop: 0 }}>
                            {item.resourceName}
                          </p>
                          <div className="booking-edit-grid">
                            <label>
                              Start
                              <input
                                type="datetime-local"
                                required
                                value={editForm.startAt}
                                onChange={(e) => setEditForm((prev) => ({ ...prev, startAt: e.target.value }))}
                              />
                            </label>
                            <label>
                              End
                              <input
                                type="datetime-local"
                                required
                                value={editForm.endAt}
                                onChange={(e) => setEditForm((prev) => ({ ...prev, endAt: e.target.value }))}
                              />
                            </label>
                            <label className="booking-edit-span-2">
                              Purpose
                              <input
                                required
                                value={editForm.purpose}
                                onChange={(e) => setEditForm((prev) => ({ ...prev, purpose: e.target.value }))}
                              />
                            </label>
                            <label>
                              Expected attendees
                              <input
                                type="number"
                                min={0}
                                placeholder="Optional"
                                value={editForm.expectedAttendees}
                                onChange={(e) =>
                                  setEditForm((prev) => ({ ...prev, expectedAttendees: e.target.value }))
                                }
                              />
                            </label>
                          </div>
                          <div className="booking-edit-form-actions">
                            <button className="btn light btn-compact" type="button" disabled={loading} onClick={cancelEdit}>
                              Discard
                            </button>
                            <button className="btn primary btn-compact" type="submit" disabled={loading}>
                              Save changes
                            </button>
                          </div>
                        </form>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </section>
  )
}

export default BookingsPage
