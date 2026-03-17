# Tattoo CRM - Claude Context

## Project Overview
Modern SPA for tattoo artists to manage clients, appointments, and business workflow.

## Tech Stack

### Frontend
- React 19 (Vite) — pure SPA, NO Next.js, NO Server Components
- Routing: react-router-dom v7
- State: Zustand (global), useState/useReducer (local)
- Forms: react-hook-form + Zod resolver
- Styling: Tailwind CSS v4 (CSS-only config, no tailwind.config.js)
- UI: Radix UI, Tremor, Lucide React, Framer Motion

### Backend
- Express 5 — native async error handling
- Database: PostgreSQL via Prisma ORM
- Auth: JWT (Cookies + Header), BcryptJS
- Security: Helmet, CORS
- Validation: Zod (shared schemas with frontend for E2E type safety)

## Core Entities
- **User** — Artists/Admins, JWT auth
- **Client** — Profiles, tattoo history, custom fields
- **Appointment** — Scheduling, status (Scheduled/Completed/Cancelled/No-show), deposits
- **BookingRequest** — Public inquiries for new tattoos
- **ConsentForm** — Digital consent with medical history and signatures
- **ClientGallery** — Visual work history per client

## Critical Rules — ALWAYS FOLLOW
1. **TypeScript strict** — No `any`. Ever. Use shared Zod schemas for E2E types.
2. **No try/catch in controllers** — Express 5 handles errors via centralized middleware.
3. **Prisma queries** — Always use `select` to fetch only necessary fields.
4. **Modular components** — Small, focused, Single Responsibility Principle.
5. **No Next.js patterns** — No App Router, no Server Components, no SSR logic.

## Active Features
- Dashboard (appointments + statistics)
- Client Management (CRUD, gallery, history)
- Appointment System (calendar, deposit tracking)
- Booking Dashboard (incoming requests, WhatsApp actions)
- Global Search (by name or phone)
- Auth (Login/Register)
