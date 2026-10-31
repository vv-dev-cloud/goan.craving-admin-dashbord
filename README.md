# Goan Craving Admin Dashboard

Admin dashboard built with **Node.js, Express, EJS, CSS, JavaScript, and MongoDB/Mongoose**.

## Features in this starter
- Admin sign-in using environment-configured credentials and an Express session.
- Overview page with KPI cards, revenue chart, status bars, and recent-order sample data.
- Date-range selector and CSV export UI.
- Employee creation with generated employee ID and one-time temporary password.
- Employee list and activate/deactivate status control.
- Responsive sidebar, create dropdown, and popup modal interactions.

> The overview metrics and order rows are sample placeholders. Connect the existing Goan Craving order/customer/payment collections and their schemas before using these figures for business reporting. The employee model and employee management endpoints use MongoDB.

## Run locally
1. Install Node.js 20 or later and MongoDB (local or Atlas).
2. Copy `.env.example` to `.env`.
3. Set `MONGODB_URI`, a long random `SESSION_SECRET`, `ADMIN_EMAIL`, and a strong `ADMIN_PASSWORD`.
4. Install and start:
   ```bash
   npm install
   npm run dev
   ```
5. Open `http://localhost:3000/admin/login`.

## Deploy
Set the same environment variables in your hosting service (for example, Render), then use:
- Build command: `npm install`
- Start command: `npm start`

Use HTTPS in production. Never commit `.env` or share the temporary employee password in a public channel.

## Important integration work still required
- Wire analytics to the live order, payment, and customer collections; define the revenue calculation and date/time zone.
- Add employee authentication to the existing Order Management Dashboard, including password change on first login, active-status checks, role permissions, session expiry, and audit/activity tracking.
- Add CSRF protection and production security review before exposing admin write actions.
- Configure MongoDB access and environment secrets on the deployment host.
