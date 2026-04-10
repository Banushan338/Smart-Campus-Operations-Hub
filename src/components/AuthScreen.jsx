function AuthScreen({
  authMode,
  authForm,
  authError,
  authInfo,
  isSubmittingAuth,
  onSubmit,
  onSetAuthForm,
  onToggleMode,
  onForgotPassword,
  loginUrl,
}) {
  return (
    <div className="auth-shell">
      <section className="auth-card auth-card-premium">
        <aside className="auth-showcase">
          <p className="eyebrow">UNIVERSITY OPERATIONS SUITE</p>
          <h1>SmartCampus Core</h1>
          <p className="auth-subtitle">
            One connected platform to manage campus resources, scheduling, and support operations with confidence.
          </p>
          <div className="auth-badges">
            <span>Facility Booking</span>
            <span>Maintenance Tickets</span>
            <span>Role-Based Access</span>
          </div>
          <div className="auth-mini-stats">
            <article>
              <strong>24/7</strong>
              <p>Service visibility</p>
            </article>
            <article>
              <strong>100+</strong>
              <p>Managed spaces</p>
            </article>
            <article>
              <strong>Secure</strong>
              <p>Session-based login</p>
            </article>
          </div>
        </aside>

        <div className="auth-form-pane">
          <h2>{authMode === 'register' ? 'Create your account' : 'Welcome back'}</h2>
          <p className="auth-pane-sub">
            {authMode === 'register'
              ? 'Register to start managing campus operations.'
              : 'Sign in to continue to your dashboard.'}
          </p>

          <form className="auth-form" onSubmit={onSubmit}>
            {authMode === 'register' && (
              <label>
                Full Name
                <input
                  value={authForm.displayName}
                  onChange={(e) => onSetAuthForm((prev) => ({ ...prev, displayName: e.target.value }))}
                  placeholder="e.g. Alex Johnson"
                  required
                />
              </label>
            )}
            <label>
              Email
              <input
                type="email"
                value={authForm.email}
                onChange={(e) => onSetAuthForm((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="name@university.edu"
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={authForm.password}
                onChange={(e) => onSetAuthForm((prev) => ({ ...prev, password: e.target.value }))}
                placeholder="Enter your password"
                required
                minLength={8}
              />
            </label>
            {authMode === 'login' && (
              <button type="button" className="auth-text-link" onClick={onForgotPassword}>
                Forgot password?
              </button>
            )}
            {authError && <p className="auth-error">{authError}</p>}
            {authInfo && <p className="auth-info">{authInfo}</p>}
            <button className="btn primary auth-login-btn" type="submit" disabled={isSubmittingAuth}>
              {isSubmittingAuth ? 'Please wait...' : authMode === 'register' ? 'Create account' : 'Login'}
            </button>
          </form>

          {authMode === 'login' ? (
            <p className="auth-switch-text">
              If you don't have an account,{' '}
              <button type="button" className="auth-text-link inline" onClick={() => onToggleMode('register')}>
                register here
              </button>
            </p>
          ) : (
            <p className="auth-switch-text">
              Already have an account?{' '}
              <button type="button" className="auth-text-link inline" onClick={() => onToggleMode('login')}>
                Login here
              </button>
            </p>
          )}

          <div className="auth-divider"><span>OR</span></div>
          <button className="btn secondary auth-login-btn" onClick={() => { window.location.href = loginUrl }}>
            <span className="google-btn">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.5 3.9-5.5 3.9-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.8 1.4l2.6-2.5C17 3.5 14.8 2.6 12 2.6A9.4 9.4 0 0 0 2.6 12 9.4 9.4 0 0 0 12 21.4c5.4 0 8.9-3.8 8.9-9.1 0-.6-.1-1.1-.2-1.6H12z" />
              </svg>
              Continue with Google
            </span>
          </button>
          <p className="auth-note">
            Your institution account is required. Access level is assigned automatically by your registered role.
          </p>
        </div>
      </section>
    </div>
  )
}

export default AuthScreen
