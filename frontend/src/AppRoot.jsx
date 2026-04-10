import { useEffect, useState } from 'react'
import AuthScreen from './components/AuthScreen'
import FeedbackBanner from './components/FeedbackBanner'
import NotificationsPanel from './components/NotificationsPanel'
import Sidebar from './components/Sidebar'
import TopNav from './components/TopNav'
import { useOperationsHub } from './hooks/useOperationsHub'
import { api } from './lib/api'
import AdminPage from './pages/AdminPage'
import BookingsPage from './pages/BookingsPage'
import MaintenancePage from './pages/MaintenancePage'
import NewBookingPage from './pages/NewBookingPage'
import ResourcesPage from './pages/ResourcesPage'

function AppRoot() {
  const [pathname, setPathname] = useState(window.location.pathname)
  const [authState, setAuthState] = useState('loading')
  const [user, setUser] = useState(null)
  const [authMode, setAuthMode] = useState('login')
  const [authForm, setAuthForm] = useState({ displayName: '', email: '', password: '' })
  const [authError, setAuthError] = useState('')
  const [authInfo, setAuthInfo] = useState('')
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false)
  const [activePage, setActivePage] = useState('resources')

  const isAdminRoute = pathname.startsWith('/admin')
  const isTechnicianRoute = pathname.startsWith('/technician')
  const isAdminUser = user?.role === 'ADMIN'
  const isTechnicianUser = user?.role === 'TECHNICIAN'
  const isStaffUser = isAdminUser || isTechnicianUser
  const operations = useOperationsHub({ authState, isAdminUser })

  function getDashboardRouteForRole(role) {
    if (role === 'ADMIN') return '/admin'
    if (role === 'TECHNICIAN') return '/technician'
    return '/'
  }

  useEffect(() => {
    let mounted = true
    api.auth
      .me()
      .then((profile) => {
        if (!mounted) return
        setUser(profile)
        operations.seedContactEmail(profile.email || '')
        setAuthState('authenticated')
        const targetPath = getDashboardRouteForRole(profile.role)
        if (window.location.pathname !== targetPath) {
          window.history.replaceState({}, '', targetPath)
          setPathname(targetPath)
        }
      })
      .catch(() => {
        if (!mounted) return
        setUser(null)
        setAuthState('unauthenticated')
      })
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    function onPopState() {
      setPathname(window.location.pathname)
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  useEffect(() => {
    if (isAdminRoute && !isAdminUser) {
      window.history.replaceState({}, '', '/')
      setPathname('/')
    }
    if (isTechnicianRoute && !isTechnicianUser) {
      window.history.replaceState({}, '', '/')
      setPathname('/')
    }
  }, [isAdminRoute, isAdminUser, isTechnicianRoute, isTechnicianUser])

  function goTo(path) {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path)
      setPathname(path)
    }
  }

  function resetAuthMessages() {
    setAuthError('')
    setAuthInfo('')
  }

  async function logout() {
    try {
      await api.auth.logout()
    } catch {
      // Ignore transient logout issues and still reset local auth state.
    }
    window.history.replaceState({}, '', '/')
    setPathname('/')
    setUser(null)
    setAuthState('unauthenticated')
  }

  async function handleAuthSubmit(event) {
    event.preventDefault()
    resetAuthMessages()
    setIsSubmittingAuth(true)
    try {
      if (authMode === 'register') {
        await api.auth.register({
          displayName: authForm.displayName,
          email: authForm.email,
          password: authForm.password,
        })
      }
      const profile = await api.auth.login({
        email: authForm.email,
        password: authForm.password,
      })
      setUser(profile)
      operations.seedContactEmail(profile.email || '')
      setAuthState('authenticated')
      const targetPath = getDashboardRouteForRole(profile.role)
      window.history.replaceState({}, '', targetPath)
      setPathname(targetPath)
      setAuthForm({ displayName: '', email: '', password: '' })
    } catch (error) {
      setAuthError(error.message || 'Unable to authenticate. Please try again.')
    } finally {
      setIsSubmittingAuth(false)
    }
  }

  function handleForgotPassword() {
    if (!authForm.email) {
      setAuthError('Enter your email first, then click Forgot password.')
      setAuthInfo('')
      return
    }
    setAuthError('')
    setAuthInfo(`Password reset link will be sent to ${authForm.email} after backend reset flow is enabled.`)
  }

  if (authState === 'loading') {
    return (
      <div className="auth-shell">
        <div className="auth-card loading-card">
          <div className="auth-spinner" />
          <h1>Connecting to Smart Campus</h1>
          <p>Verifying your secure session...</p>
        </div>
      </div>
    )
  }

  if (authState === 'unauthenticated') {
    return (
      <AuthScreen
        authMode={authMode}
        authForm={authForm}
        authError={authError}
        authInfo={authInfo}
        isSubmittingAuth={isSubmittingAuth}
        onSubmit={handleAuthSubmit}
        onSetAuthForm={setAuthForm}
        onToggleMode={(mode) => {
          setAuthMode(mode)
          resetAuthMessages()
        }}
        onForgotPassword={handleForgotPassword}
        loginUrl={api.auth.loginUrl()}
      />
    )
  }

  return (
    <div className="portal">
      <div className="bg-orb orb-a" />
      <div className="bg-orb orb-b" />
      <div className="bg-orb orb-c" />

      <TopNav
        user={user}
        onLogout={logout}
        unreadCount={operations.unreadCount}
        onOpenNotifications={() => operations.setShowNotifications((prev) => !prev)}
      />

      <div className="workspace">
        <Sidebar
          isAdminRoute={isAdminRoute}
          isTechnicianRoute={isTechnicianRoute}
          isAdminUser={isAdminUser}
          isTechnicianUser={isTechnicianUser}
          activePage={activePage}
          user={user}
          onNavigatePage={(page) => {
            goTo('/')
            setActivePage(page)
          }}
          onGoAdmin={() => goTo('/admin')}
          onGoTechnician={() => goTo('/technician')}
        />

        <main className="content-area">
          {operations.showNotifications && (
            <NotificationsPanel
              notifications={operations.notifications}
              notificationPreferences={operations.notificationPreferences}
              onSetNotificationPreference={operations.setNotificationPreference}
              onMarkAllRead={operations.markAllNotificationsRead}
              onMarkRead={operations.markNotificationRead}
            />
          )}

          <FeedbackBanner feedback={operations.feedback} errorMessage={operations.errorMessage} />

          {!isAdminRoute && activePage === 'resources' && (
            <ResourcesPage
              loading={operations.loading}
              resources={operations.resources}
              resourceType={operations.resourceType}
              resourceStatus={operations.resourceStatus}
              resourceLocation={operations.resourceLocation}
              minCapacity={operations.minCapacity}
              onSetResourceType={operations.setResourceType}
              onSetResourceStatus={operations.setResourceStatus}
              onSetResourceLocation={operations.setResourceLocation}
              onSetMinCapacity={operations.setMinCapacity}
              onSelectResource={operations.setSelectedResourceId}
              onBookResource={(resourceId) => {
                operations.setSelectedResourceId(resourceId)
                setActivePage('new-booking')
              }}
              onRefresh={() => operations.runAction(operations.loadResources, '')}
              onApplyFilters={() => operations.runAction(operations.loadResources, '')}
              onResetFilters={() => operations.runAction(operations.resetResourceFilters, 'Filters reset.')}
            />
          )}

          {!isAdminRoute && activePage === 'new-booking' && (
            <NewBookingPage
              resources={operations.resources}
              selectedResourceId={operations.selectedResourceId}
              bookingForm={operations.bookingForm}
              loading={operations.loading}
              onSetBookingForm={operations.setBookingForm}
              onCreateBooking={(e) =>
                operations.createBooking(e, () => {
                  setActivePage('bookings')
                })
              }
              onBack={() => setActivePage('resources')}
            />
          )}

          {!isAdminRoute && activePage === 'bookings' && (
            <BookingsPage
              bookingsMine={operations.bookingsMine}
              loading={operations.loading}
              onCancelBooking={operations.cancelBooking}
              onRefresh={() => operations.runAction(operations.loadBookings, '')}
              onUpdateBooking={operations.updateBooking}
            />
          )}

          {isAdminRoute && isAdminUser && (
            <AdminPage
              resources={operations.resources}
              resourceDraft={operations.resourceDraft}
              tickets={operations.tickets}
              bookingsAll={operations.bookingsAll}
              reviewReasonByBookingId={operations.reviewReasonByBookingId}
              onSetResourceDraft={operations.setResourceDraft}
              onCreateResource={operations.createResource}
              onUpdateResource={operations.updateResource}
              onDeleteResource={operations.deleteResource}
              onSetReviewReasonByBookingId={operations.setReviewReasonByBookingId}
              onReviewBooking={operations.reviewBooking}
              onCheckInBooking={operations.checkInBooking}
              onUpdateTicketById={operations.updateTicketById}
              onRefresh={() => operations.runAction(operations.refreshAll, '')}
            />
          )}

          {isTechnicianRoute && isTechnicianUser && (
            <MaintenancePage
              isAdminUser={isAdminUser}
              isStaffUser={isStaffUser}
              resources={operations.resources}
              tickets={operations.tickets}
              selectedTicket={operations.selectedTicket}
              user={user}
              ticketComments={operations.ticketComments}
              newComment={operations.newComment}
              editingCommentId={operations.editingCommentId}
              editingCommentBody={operations.editingCommentBody}
              ticketForm={operations.ticketForm}
              ticketPatchForm={operations.ticketPatchForm}
              onSetAttachmentFile={operations.setAttachmentFile}
              onSetTicketForm={operations.setTicketForm}
              onSetTicketPatchForm={operations.setTicketPatchForm}
              onSetSelectedTicketId={operations.setSelectedTicketId}
              onSetNewComment={operations.setNewComment}
              onSetEditingCommentId={operations.setEditingCommentId}
              onSetEditingCommentBody={operations.setEditingCommentBody}
              onCreateTicket={operations.createTicket}
              onUpdateTicket={operations.updateTicket}
              onAddComment={operations.addComment}
              onSaveComment={operations.saveComment}
              onDeleteComment={operations.deleteComment}
            />
          )}

          {!isAdminRoute && !isTechnicianRoute && activePage === 'maintenance' && (
            <MaintenancePage
              isAdminUser={isAdminUser}
              isStaffUser={isStaffUser}
              resources={operations.resources}
              tickets={operations.tickets}
              selectedTicket={operations.selectedTicket}
              user={user}
              ticketComments={operations.ticketComments}
              newComment={operations.newComment}
              editingCommentId={operations.editingCommentId}
              editingCommentBody={operations.editingCommentBody}
              ticketForm={operations.ticketForm}
              ticketPatchForm={operations.ticketPatchForm}
              onSetAttachmentFile={operations.setAttachmentFile}
              onSetTicketForm={operations.setTicketForm}
              onSetTicketPatchForm={operations.setTicketPatchForm}
              onSetSelectedTicketId={operations.setSelectedTicketId}
              onSetNewComment={operations.setNewComment}
              onSetEditingCommentId={operations.setEditingCommentId}
              onSetEditingCommentBody={operations.setEditingCommentBody}
              onCreateTicket={operations.createTicket}
              onUpdateTicket={operations.updateTicket}
              onAddComment={operations.addComment}
              onSaveComment={operations.saveComment}
              onDeleteComment={operations.deleteComment}
            />
          )}
        </main>
      </div>
    </div>
  )
}

export default AppRoot
