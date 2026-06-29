# BrightCab / Vazraa Mobility

BrightCab is a cab booking and fleet-management application with separate
interfaces for admins, super admins, customers, and drivers. The repository
contains a React frontend, a Node/Express development server, and a Spring Boot
backend for the full production-style API.

## Features

- Admin dashboard for drivers, customers, rides, payments, complaints, reports,
  notifications, WhatsApp bot tools, and live tracking.
- Super admin dashboard for admins, roles, cities, pricing, promotions,
  analytics, audit logs, security monitoring, and platform settings.
- Customer app for booking rides, tracking rides, wallet, activity,
  notifications, and profile management.
- Driver app for rides, earnings, notifications, profile, and active ride flow.
- Spring Boot REST API with MongoDB persistence, JWT authentication, WebSocket
  support, onboarding workflows, pricing, safety, tracking, and WhatsApp
  integration.
- Express/Vite dev server with selected local API routes and proxying to the
  Spring Boot backend.

## Tech Stack

- Frontend: React 19, TypeScript, Vite, Tailwind CSS, React Router
- UI and charts: Lucide React, Framer Motion, Recharts, Leaflet
- Node server: Express, Vite middleware, Mongoose
- Java backend: Spring Boot 3.2, Spring Security, Spring Data MongoDB, JWT,
  WebSocket
- Database: MongoDB

## Project Structure

```text
.
├── src/                    # React frontend
│   ├── pages/              # Admin, super admin, customer, and driver pages
│   ├── components/         # Shared layouts, maps, dashboards, and UI helpers
│   ├── contexts/           # Auth and theme providers
│   └── lib/                # API client and utilities
├── backend/                # Spring Boot backend API
│   └── src/main/java/com/cabgo/
├── server.ts               # Express + Vite dev server
├── package.json            # Node scripts and frontend dependencies
└── vite.config.ts          # Vite configuration
```

## Prerequisites

- Node.js 20 or newer
- npm
- Java 17
- Maven
- MongoDB, either local or Atlas

## Environment Variables

Copy the example file and update it with your values:

```bash
cp .env.example .env
```

Root `.env`:

```env
MONGODB_URI=mongodb://localhost:27017/cabgo_admin
```

The Spring Boot backend also reads these optional variables:

```env
MONGODB_DATABASE=cabgo_admin
JWT_SECRET=replace-with-a-long-secure-secret
JWT_EXPIRATION=86400000
JWT_REFRESH_EXPIRATION=604800000
CORS_ORIGINS=http://localhost:4000,http://localhost:5173
AISENSY_API_KEY=
AISENSY_CAMPAIGN_NAME=
AISENSY_USER_NAME=
AISENSY_WHATSAPP_NUMBER=
AISENSY_WEBHOOK_URL=
AISENSY_MESSAGE_API_URL=
GOOGLE_MAPS_API_KEY=
GEMINI_API_KEY=
```

## Run Locally

Install Node dependencies:

```bash
npm install
```

Start the React app with the Express/Vite server:

```bash
npm run dev
```

Open:

```text
http://localhost:4000
```

The Express server exposes `/api/health`, local dashboard helper routes, and
proxies other `/api/*` requests to the Spring Boot backend at
`http://localhost:8080`.

## Run the Spring Boot Backend

In a second terminal:

```bash
cd backend
mvn spring-boot:run
```

The backend starts on:

```text
http://localhost:8080/api
```

Health endpoint:

```text
http://localhost:8080/api/actuator/health
```

## Seeded Test Accounts

When the Spring Boot backend starts with an empty MongoDB database, it seeds
default data.

Admin:

```text
Email: admin@vazraamobility.com
Password: Admin@123
```

Super admin:

```text
Email: superadmin@vazraamobility.com
Password: SuperAdmin@123
```

Driver:

```text
Phone: 9876543210
Password: Driver@123
OTP: 123456
```

## Main Routes

```text
/login                    Admin and super admin login
/admin                    Admin dashboard
/admin/onboarding         Driver onboarding
/super-admin              Super admin dashboard
/customer/login           Customer login
/customer                 Customer dashboard
/customer/book            Book a ride
/driver/login             Driver login
/driver                   Driver dashboard
/driver/active-ride       Active ride screen
```

## Scripts

```bash
npm run dev       # Start Express + Vite dev server
npm run build     # Build frontend assets
npm run preview   # Preview the Vite production build
npm run lint      # Type-check the TypeScript project
npm run clean     # Remove dist
```

## Production Build

Build the frontend:

```bash
npm run build
```

Run the Node server in production mode after building:

```bash
NODE_ENV=production npm run dev
```

The server will serve files from `dist/`.

## Notes

- The app can run without `MONGODB_URI`, but database-backed features will fall
  back to mock or disconnected states.
- For complete API behavior, run both the Node dev server and the Spring Boot
  backend.
- Do not commit real API keys or production secrets.
