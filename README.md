<<<<<<< HEAD
# Smart Campus Frontend

Modern React dashboard for the Smart Campus Operations Hub assignment.

## Features

- Google OAuth login entry (redirects to backend OAuth endpoint).
- Role-aware dashboard for `USER`, `ADMIN`, and `TECHNICIAN`.
- Modules: Resources, Bookings, Tickets, Comments, Attachments, Notifications.
- High-level design system with animated gradients, glass cards, and responsive layout.

## Run

```bash
npm install
npm run dev
```

## Environment

Set backend URL in a `.env` file:

```bash
VITE_API_BASE_URL=http://localhost:8080
```

## Backend expectations

- Backend running with CORS allowing frontend origin.
- OAuth2 Google configured in backend.
- Session cookies enabled (`credentials: include` is used in API calls).
=======
# Smart-Campus-Operations-Hub
A university is modernizing its day-to-day operations. The university needs a single web platform to  manage facility and asset bookings (rooms, labs, equipment) and maintenance/incident handling  (fault reports, technician updates, resolutions). The platform must support a clear workflow, role-  based access, and strong auditability.
>>>>>>> 43204f60bfac68fbee2f740d79296f822b95ea17
