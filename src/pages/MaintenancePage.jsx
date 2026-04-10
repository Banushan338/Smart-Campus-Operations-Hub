function MaintenancePage({
  isAdminUser,
  isStaffUser,
  resources,
  tickets,
  selectedTicket,
  user,
  ticketComments,
  newComment,
  editingCommentId,
  editingCommentBody,
  ticketForm,
  ticketPatchForm,
  onSetAttachmentFile,
  onSetTicketForm,
  onSetTicketPatchForm,
  onSetSelectedTicketId,
  onSetNewComment,
  onSetEditingCommentId,
  onSetEditingCommentBody,
  onCreateTicket,
  onUpdateTicket,
  onAddComment,
  onSaveComment,
  onDeleteComment,
}) {
  return (
    <section>
      <div className="section-head">
        <div>
          <h1>Maintenance & Incident Ticketing</h1>
        </div>
      </div>

      <form className="card" onSubmit={onCreateTicket}>
        <h3>Create ticket</h3>
        <select value={ticketForm.relatedResourceId} onChange={(e) => onSetTicketForm((prev) => ({ ...prev, relatedResourceId: e.target.value }))}>
          <option value="">No specific resource</option>
          {resources.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
        <input placeholder="Location description" value={ticketForm.locationDescription} onChange={(e) => onSetTicketForm((prev) => ({ ...prev, locationDescription: e.target.value }))} />
        <input required placeholder="Category" value={ticketForm.category} onChange={(e) => onSetTicketForm((prev) => ({ ...prev, category: e.target.value }))} />
        <textarea required placeholder="Description" value={ticketForm.description} onChange={(e) => onSetTicketForm((prev) => ({ ...prev, description: e.target.value }))} />
        <select value={ticketForm.priority} onChange={(e) => onSetTicketForm((prev) => ({ ...prev, priority: e.target.value }))}>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="CRITICAL">Critical</option>
        </select>
        <input required type="email" placeholder="Preferred contact email" value={ticketForm.contactEmail} onChange={(e) => onSetTicketForm((prev) => ({ ...prev, contactEmail: e.target.value }))} />
        <input placeholder="Preferred contact phone" value={ticketForm.contactPhone} onChange={(e) => onSetTicketForm((prev) => ({ ...prev, contactPhone: e.target.value }))} />
        <input type="file" accept="image/*" onChange={(e) => onSetAttachmentFile(e.target.files?.[0] || null)} />
        <button className="btn primary" type="submit">Submit ticket</button>
      </form>

      <section className="table-wrap in-content">
        <h2>{isAdminUser ? 'All tickets' : 'My tickets'}</h2>
        <table>
          <thead>
            <tr><th>ID</th><th>Category</th><th>Priority</th><th>Status</th><th>Assigned</th><th>Action</th></tr>
          </thead>
          <tbody>
            {tickets.map((item) => (
              <tr key={item.id}>
                <td>#{item.id}</td>
                <td>{item.category}</td>
                <td>{item.priority}</td>
                <td>{item.status}</td>
                <td>{item.assignedToEmail || '-'}</td>
                <td><button className="btn light btn-compact" onClick={() => onSetSelectedTicketId(item.id)}>Open</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {selectedTicket && (
        <section className="card">
          <h3>Ticket #{selectedTicket.id}</h3>
          <p>{selectedTicket.description}</p>
          {isStaffUser && (
            <form onSubmit={onUpdateTicket}>
              <select value={ticketPatchForm.status} onChange={(e) => onSetTicketPatchForm((prev) => ({ ...prev, status: e.target.value }))}>
                <option value="">No status change</option>
                <option value="OPEN">OPEN</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="RESOLVED">RESOLVED</option>
                <option value="CLOSED">CLOSED</option>
                <option value="REJECTED">REJECTED</option>
              </select>
              {isAdminUser && (
                <input
                  type="number"
                  placeholder="Assign to user ID"
                  value={ticketPatchForm.assignedToUserId}
                  onChange={(e) => onSetTicketPatchForm((prev) => ({ ...prev, assignedToUserId: e.target.value }))}
                />
              )}
              <textarea placeholder="Resolution notes" value={ticketPatchForm.resolutionNotes} onChange={(e) => onSetTicketPatchForm((prev) => ({ ...prev, resolutionNotes: e.target.value }))} />
              <input placeholder="Reject reason (if rejected)" value={ticketPatchForm.rejectedReason} onChange={(e) => onSetTicketPatchForm((prev) => ({ ...prev, rejectedReason: e.target.value }))} />
              <button className="btn primary" type="submit">Update ticket</button>
            </form>
          )}
          <hr />
          <h4>Comments</h4>
          <form onSubmit={onAddComment}>
            <textarea value={newComment} onChange={(e) => onSetNewComment(e.target.value)} placeholder="Write a comment" />
            <button className="btn light" type="submit">Add comment</button>
          </form>
          {ticketComments.map((comment) => (
            <article key={comment.id} className="card" style={{ marginTop: 8 }}>
              <strong>{comment.authorEmail}</strong>
              {editingCommentId === comment.id ? (
                <>
                  <textarea value={editingCommentBody} onChange={(e) => onSetEditingCommentBody(e.target.value)} />
                  <button className="btn light btn-compact" onClick={() => onSaveComment(comment.id)}>Save</button>
                </>
              ) : (
                <p>{comment.body}</p>
              )}
              {user?.id === comment.authorId && (
                <>
                  <button className="btn light btn-compact" onClick={() => { onSetEditingCommentId(comment.id); onSetEditingCommentBody(comment.body) }}>Edit</button>
                  <button className="btn light btn-compact" onClick={() => onDeleteComment(comment.id)}>Delete</button>
                </>
              )}
            </article>
          ))}
        </section>
      )}
    </section>
  )
}

export default MaintenancePage
