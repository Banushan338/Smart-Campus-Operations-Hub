function BookingRequestsTable({ rows, title, inContent = false }) {
  return (
    <section className={inContent ? 'table-wrap in-content' : 'table-wrap'}>
      {title && <h2>{title}</h2>}
      <table>
        <thead>
          <tr>
            <th>Requestor</th>
            <th>Resource</th>
            <th>Schedule</th>
            <th>Status</th>
            <th>Admin Decision & Reason</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>
                <strong>{row.requester}</strong>
                <span>{row.role}</span>
              </td>
              <td>{row.resource}</td>
              <td>{row.schedule}</td>
              <td>
                <span className={`pill ${row.status.toLowerCase()}`}>{row.status}</span>
              </td>
              <td>{row.note || <input placeholder="Add a note..." />}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}

export default BookingRequestsTable
