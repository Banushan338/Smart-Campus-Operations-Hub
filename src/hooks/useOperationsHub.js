import { useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'

function normalizePagePayload(payload) {
  if (Array.isArray(payload)) return payload
  return payload?.content || []
}

function toIso(value) {
  if (!value) return null
  return new Date(value).toISOString()
}

const DEFAULT_NOTIFICATION_PREFERENCES = {
  booking: true,
  maintenance: true,
  system: true,
}

function getNotificationCategory(item) {
  const haystack = `${item?.type || ''} ${item?.title || ''} ${item?.message || ''}`.toLowerCase()
  if (haystack.includes('book')) return 'booking'
  if (haystack.includes('ticket') || haystack.includes('maint') || haystack.includes('incident')) return 'maintenance'
  return 'system'
}

export function useOperationsHub({ authState, isAdminUser }) {
  const [resources, setResources] = useState([])
  const [selectedResourceId, setSelectedResourceId] = useState(null)
  const [resourceType, setResourceType] = useState('')
  const [resourceStatus, setResourceStatus] = useState('')
  const [resourceLocation, setResourceLocation] = useState('')
  const [minCapacity, setMinCapacity] = useState('')
  const [bookingsMine, setBookingsMine] = useState([])
  const [bookingsAll, setBookingsAll] = useState([])
  const [bookingForm, setBookingForm] = useState({
    startAt: '',
    endAt: '',
    purpose: '',
    expectedAttendees: '',
  })
  const [reviewReasonByBookingId, setReviewReasonByBookingId] = useState({})
  const [resourceDraft, setResourceDraft] = useState({
    name: '',
    location: '',
    capacity: '',
    resourceType: 'LECTURE_HALL',
    status: 'ACTIVE',
  })
  const [tickets, setTickets] = useState([])
  const [selectedTicketId, setSelectedTicketId] = useState(null)
  const [ticketComments, setTicketComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [editingCommentId, setEditingCommentId] = useState(null)
  const [editingCommentBody, setEditingCommentBody] = useState('')
  const [ticketForm, setTicketForm] = useState({
    relatedResourceId: '',
    locationDescription: '',
    category: 'INFRASTRUCTURE',
    description: '',
    priority: 'MEDIUM',
    contactEmail: '',
    contactPhone: '',
  })
  const [ticketPatchForm, setTicketPatchForm] = useState({
    status: '',
    assignedToUserId: '',
    resolutionNotes: '',
    rejectedReason: '',
  })
  const [attachmentFile, setAttachmentFile] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [notificationPreferences, setNotificationPreferences] = useState(() => {
    try {
      const raw = window.localStorage.getItem('notificationPreferences')
      if (!raw) return DEFAULT_NOTIFICATION_PREFERENCES
      return { ...DEFAULT_NOTIFICATION_PREFERENCES, ...JSON.parse(raw) }
    } catch {
      return DEFAULT_NOTIFICATION_PREFERENCES
    }
  })
  const [showNotifications, setShowNotifications] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const selectedTicket = useMemo(
    () => tickets.find((ticket) => ticket.id === selectedTicketId) ?? null,
    [tickets, selectedTicketId],
  )
  const filteredNotifications = useMemo(
    () =>
      notifications.filter((item) => {
        const category = getNotificationCategory(item)
        return Boolean(notificationPreferences[category])
      }),
    [notifications, notificationPreferences],
  )

  useEffect(() => {
    if (authState === 'authenticated') {
      void refreshAll()
    }
  }, [authState, isAdminUser])

  useEffect(() => {
    if (selectedTicketId) {
      void loadComments(selectedTicketId)
    } else {
      setTicketComments([])
    }
  }, [selectedTicketId])

  useEffect(() => {
    window.localStorage.setItem('notificationPreferences', JSON.stringify(notificationPreferences))
  }, [notificationPreferences])

  useEffect(() => {
    const filteredUnread = notifications.filter(
      (item) => !item.read && notificationPreferences[getNotificationCategory(item)],
    ).length
    setUnreadCount(filteredUnread)
  }, [notifications, notificationPreferences])

  function seedContactEmail(email) {
    setTicketForm((prev) => ({ ...prev, contactEmail: email || '' }))
  }

  async function runAction(action, successMessage) {
    setErrorMessage('')
    setFeedback('')
    try {
      setLoading(true)
      await action()
      if (successMessage) setFeedback(successMessage)
    } catch (error) {
      setErrorMessage(error.message || 'Operation failed.')
    } finally {
      setLoading(false)
    }
  }

  async function fetchResourcesList(query) {
    const list = await api.resources.list({
      type: query.type,
      status: query.status,
      minCapacity: query.minCapacity,
      location: query.location,
    })
    const content = normalizePagePayload(list)
    setResources(content)
    if (content.length > 0 && !selectedResourceId) {
      setSelectedResourceId(content[0].id)
    }
  }

  async function loadResources() {
    return fetchResourcesList({
      type: resourceType || undefined,
      status: resourceStatus || undefined,
      minCapacity: minCapacity || undefined,
      location: resourceLocation || undefined,
    })
  }

  async function resetResourceFilters() {
    setResourceType('')
    setResourceStatus('')
    setResourceLocation('')
    setMinCapacity('')
    await fetchResourcesList({})
  }

  async function createResource() {
    await runAction(async () => {
      await api.resources.create({
        name: resourceDraft.name.trim(),
        location: resourceDraft.location.trim(),
        capacity: Number(resourceDraft.capacity),
        resourceType: resourceDraft.resourceType,
        status: resourceDraft.status,
      })
      setResourceDraft({
        name: '',
        location: '',
        capacity: '',
        resourceType: 'LECTURE_HALL',
        status: 'ACTIVE',
      })
      await loadResources()
    }, 'Resource created.')
  }

  async function updateResource(id, payload) {
    await runAction(async () => {
      await api.resources.update(id, {
        name: payload.name.trim(),
        location: payload.location.trim(),
        capacity: Number(payload.capacity),
        resourceType: payload.resourceType,
        status: payload.status,
      })
      await loadResources()
    }, 'Resource updated.')
  }

  async function deleteResource(id) {
    await runAction(async () => {
      await api.resources.delete(id)
      await loadResources()
    }, 'Resource deleted.')
  }

  async function loadBookings() {
    const mine = await api.bookings.mine()
    setBookingsMine(normalizePagePayload(mine))
    if (isAdminUser) {
      const all = await api.bookings.listAll()
      setBookingsAll(normalizePagePayload(all))
    }
  }

  async function loadTickets() {
    const list = isAdminUser ? await api.tickets.all() : await api.tickets.mine()
    const content = normalizePagePayload(list)
    setTickets(content)
    if (content.length > 0 && !selectedTicketId) {
      setSelectedTicketId(content[0].id)
    }
  }

  async function loadComments(ticketId) {
    const items = await api.ticketComments.list(ticketId)
    setTicketComments(items)
  }

  async function loadNotifications() {
    const [list, countPayload] = await Promise.all([
      api.notifications.list(),
      api.notifications.unreadCount(),
    ])
    const normalized = list || []
    setNotifications(normalized)
    const localUnread = normalized.filter(
      (item) => !item.read && notificationPreferences[getNotificationCategory(item)],
    ).length
    setUnreadCount(localUnread || countPayload?.count || 0)
  }

  async function refreshAll() {
    await Promise.all([loadResources(), loadBookings(), loadTickets(), loadNotifications()])
  }

  async function createBooking(event, onSuccess) {
    event.preventDefault()
    await runAction(async () => {
      await api.bookings.create({
        resourceId: selectedResourceId,
        startAt: toIso(bookingForm.startAt),
        endAt: toIso(bookingForm.endAt),
        purpose: bookingForm.purpose,
        expectedAttendees: bookingForm.expectedAttendees ? Number(bookingForm.expectedAttendees) : null,
      })
      setBookingForm({ startAt: '', endAt: '', purpose: '', expectedAttendees: '' })
      await loadBookings()
      if (typeof onSuccess === 'function') onSuccess()
    }, 'Booking request submitted.')
  }

  async function updateBooking(id, form) {
    setErrorMessage('')
    setFeedback('')
    const startAt = toIso(form.startAt)
    const endAt = toIso(form.endAt)
    if (!startAt || !endAt) {
      const msg = 'Start and end date/time are required.'
      setErrorMessage(msg)
      throw new Error(msg)
    }
    const purpose = (form.purpose || '').trim()
    if (!purpose) {
      const msg = 'Purpose is required.'
      setErrorMessage(msg)
      throw new Error(msg)
    }
    try {
      setLoading(true)
      await api.bookings.update(id, {
        startAt,
        endAt,
        purpose,
        expectedAttendees: form.expectedAttendees ? Number(form.expectedAttendees) : null,
      })
      await loadBookings()
      setFeedback('Booking updated.')
    } catch (error) {
      setErrorMessage(error.message || 'Operation failed.')
      throw error
    } finally {
      setLoading(false)
    }
  }

  async function cancelBooking(id) {
    await runAction(async () => {
      await api.bookings.cancel(id)
      await loadBookings()
    }, 'Booking cancelled.')
  }

  async function reviewBooking(id, decision) {
    const reason = reviewReasonByBookingId[id] || ''
    await runAction(async () => {
      await api.bookings.review(id, { decision, reason })
      await loadBookings()
    }, `Booking ${decision.toLowerCase()}.`)
  }

  async function checkInBooking(id) {
    await runAction(async () => {
      await api.bookings.checkIn(id)
      await loadBookings()
    }, 'Booking check-in verified.')
  }

  async function createTicket(event) {
    event.preventDefault()
    await runAction(async () => {
      const created = await api.tickets.create({
        relatedResourceId: ticketForm.relatedResourceId ? Number(ticketForm.relatedResourceId) : null,
        locationDescription: ticketForm.locationDescription || null,
        category: ticketForm.category,
        description: ticketForm.description,
        priority: ticketForm.priority,
        contactEmail: ticketForm.contactEmail,
        contactPhone: ticketForm.contactPhone || null,
      })
      if (attachmentFile) {
        await api.ticketAttachments.upload(created.id, attachmentFile)
      }
      setAttachmentFile(null)
      setTicketForm((prev) => ({
        ...prev,
        relatedResourceId: '',
        locationDescription: '',
        description: '',
        contactPhone: '',
      }))
      await loadTickets()
    }, 'Ticket created.')
  }

  async function updateTicket(event) {
    event.preventDefault()
    if (!selectedTicketId) return
    await runAction(async () => {
      await api.tickets.update(selectedTicketId, {
        status: ticketPatchForm.status || null,
        assignedToUserId: ticketPatchForm.assignedToUserId ? Number(ticketPatchForm.assignedToUserId) : null,
        resolutionNotes: ticketPatchForm.resolutionNotes || null,
        rejectedReason: ticketPatchForm.rejectedReason || null,
      })
      await loadTickets()
    }, 'Ticket updated.')
  }

  async function updateTicketById(id, payload) {
    await runAction(async () => {
      await api.tickets.update(id, {
        status: payload.status || null,
        assignedToUserId: payload.assignedToUserId ? Number(payload.assignedToUserId) : null,
        resolutionNotes: payload.resolutionNotes || null,
        rejectedReason: payload.rejectedReason || null,
      })
      await loadTickets()
    }, 'Ticket updated.')
  }

  async function addComment(event) {
    event.preventDefault()
    if (!selectedTicketId || !newComment.trim()) return
    await runAction(async () => {
      await api.ticketComments.add(selectedTicketId, { body: newComment.trim() })
      setNewComment('')
      await loadComments(selectedTicketId)
      await loadNotifications()
    }, 'Comment added.')
  }

  async function saveComment(commentId) {
    if (!selectedTicketId || !editingCommentBody.trim()) return
    await runAction(async () => {
      await api.ticketComments.update(selectedTicketId, commentId, { body: editingCommentBody.trim() })
      setEditingCommentId(null)
      setEditingCommentBody('')
      await loadComments(selectedTicketId)
    }, 'Comment updated.')
  }

  async function deleteComment(commentId) {
    if (!selectedTicketId) return
    await runAction(async () => {
      await api.ticketComments.delete(selectedTicketId, commentId)
      await loadComments(selectedTicketId)
    }, 'Comment deleted.')
  }

  async function markNotificationRead(id) {
    await runAction(async () => {
      await api.notifications.markRead(id)
      await loadNotifications()
    }, '')
  }

  async function markAllNotificationsRead() {
    await runAction(async () => {
      await api.notifications.markAllRead()
      await loadNotifications()
    }, 'All notifications marked as read.')
  }

  function setNotificationPreference(category, enabled) {
    setNotificationPreferences((prev) => ({ ...prev, [category]: Boolean(enabled) }))
  }

  return {
    resources,
    selectedResourceId,
    resourceType,
    resourceStatus,
    resourceLocation,
    minCapacity,
    bookingsMine,
    bookingsAll,
    bookingForm,
    reviewReasonByBookingId,
    resourceDraft,
    tickets,
    selectedTicket,
    ticketComments,
    newComment,
    editingCommentId,
    editingCommentBody,
    ticketForm,
    ticketPatchForm,
    notifications: filteredNotifications,
    unreadCount,
    notificationPreferences,
    showNotifications,
    feedback,
    errorMessage,
    loading,
    setSelectedResourceId,
    setResourceType,
    setResourceStatus,
    setResourceLocation,
    setMinCapacity,
    setBookingForm,
    setReviewReasonByBookingId,
    setResourceDraft,
    setAttachmentFile,
    setTicketForm,
    setTicketPatchForm,
    setSelectedTicketId,
    setNewComment,
    setEditingCommentId,
    setEditingCommentBody,
    setShowNotifications,
    setNotificationPreference,
    seedContactEmail,
    loadResources,
    loadTickets,
    resetResourceFilters,
    loadBookings,
    refreshAll,
    createBooking,
    updateBooking,
    cancelBooking,
    reviewBooking,
    checkInBooking,
    createResource,
    updateResource,
    deleteResource,
    createTicket,
    updateTicket,
    updateTicketById,
    addComment,
    saveComment,
    deleteComment,
    markNotificationRead,
    markAllNotificationsRead,
    runAction,
  }
}
