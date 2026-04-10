function FeedbackBanner({ feedback, errorMessage }) {
  if (!feedback && !errorMessage) return null

  return (
    <section className="card" style={{ marginBottom: 16 }}>
      {feedback && <p>{feedback}</p>}
      {errorMessage && <p className="auth-error">{errorMessage}</p>}
    </section>
  )
}

export default FeedbackBanner
