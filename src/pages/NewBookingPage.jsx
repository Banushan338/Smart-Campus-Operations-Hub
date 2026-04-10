function NewBookingPage({
  resources,
  selectedResourceId,
  bookingForm,
  loading,
  onSetBookingForm,
  onCreateBooking,
  onBack,
}) {
  const resource = resources.find((r) => r.id === selectedResourceId)

  return (
    <section>
      <div className="section-head">
        <div>
          <span className="eyebrow">MODULE B</span>
          <h1>New booking</h1>
          <p className="muted" style={{ marginTop: 8 }}>
            Request a time slot for a resource. Your booking will appear under My Bookings after submission.
          </p>
        </div>
        <button type="button" className="btn light" onClick={onBack}>
          Back to resources
        </button>
      </div>

      {!selectedResourceId || !resource ? (
        <div className="card">
          <p style={{ margin: 0 }}>No resource selected.</p>
          <button type="button" className="btn primary" style={{ marginTop: 14 }} onClick={onBack}>
            Browse resources
          </button>
        </div>
      ) : (
        <form className="card new-booking-form" onSubmit={onCreateBooking}>
          <h3>Request details</h3>
          <p className="new-booking-resource">
            <strong>{resource.name}</strong>
            <span className="muted">{resource.location}</span>
          </p>
          <label>
            Start
            <input
              type="datetime-local"
              required
              value={bookingForm.startAt}
              onChange={(e) => onSetBookingForm((prev) => ({ ...prev, startAt: e.target.value }))}
            />
          </label>
          <label>
            End
            <input
              type="datetime-local"
              required
              value={bookingForm.endAt}
              onChange={(e) => onSetBookingForm((prev) => ({ ...prev, endAt: e.target.value }))}
            />
          </label>
          <label>
            Purpose
            <input
              placeholder="Purpose"
              required
              value={bookingForm.purpose}
              onChange={(e) => onSetBookingForm((prev) => ({ ...prev, purpose: e.target.value }))}
            />
          </label>
          <label>
            Expected attendees
            <input
              type="number"
              min={0}
              placeholder="Optional"
              value={bookingForm.expectedAttendees}
              onChange={(e) => onSetBookingForm((prev) => ({ ...prev, expectedAttendees: e.target.value }))}
            />
          </label>
          <button className="btn primary" type="submit" disabled={loading}>
            Submit request
          </button>
        </form>
      )}
    </section>
  )
}

export default NewBookingPage
