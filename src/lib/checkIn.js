export function buildCheckInPayload(booking) {
  const payload = {
    type: 'BOOKING_CHECKIN',
    bookingId: booking.id,
    resourceId: booking.resourceId,
    resourceName: booking.resourceName,
    requesterEmail: booking.requesterEmail,
    startAt: booking.startAt,
    endAt: booking.endAt,
    status: booking.status,
    issuedAt: new Date().toISOString(),
  }
  return JSON.stringify(payload)
}

export function verifyCheckInPayload(rawValue, bookingsAll) {
  let parsed
  try {
    parsed = JSON.parse(rawValue)
  } catch {
    return { ok: false, message: 'Invalid QR payload format.' }
  }
  if (parsed?.type !== 'BOOKING_CHECKIN' || !parsed?.bookingId) {
    return { ok: false, message: 'Unsupported QR payload.' }
  }
  const booking = bookingsAll.find((item) => item.id === Number(parsed.bookingId))
  if (!booking) return { ok: false, message: 'Booking not found.' }
  if (booking.status !== 'APPROVED') {
    return { ok: false, message: `Booking is ${booking.status}. Only APPROVED bookings can check in.` }
  }
  if (booking.checkedInAt) {
    return { ok: false, message: 'Booking already checked in.' }
  }
  return { ok: true, booking }
}

