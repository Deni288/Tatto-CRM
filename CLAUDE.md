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
6. **Data isolation** — Every Prisma query on Client/Appointment MUST filter by `artistId`.
7. **Zod at boundaries** — Every `req.body`, `req.params`, `req.query` = `safeParse` before use.
8. **No fallback secrets** — `process.env.JWT_SECRET` must throw if undefined, never `|| 'secret'`.

## Agent System — Specijalizirani asistenti

Ovi agenti se nalaze u `.claude/agents/` i prilagođeni su za TattoCRM stack.

| Agent | Uloga | Kada aktivirati |
|-------|-------|-----------------|
| **security-reviewer** | Zaštitar — OWASP, JWT, Prisma data exposure | Nakon izmjene auth, ruta, javnih endpointa |
| **architect** | Senior mentor — dizajn featurea, struktura koda | Planiranje novog featurea, arhitekturne odluke |
| **code-reviewer** | Pregled koda — TypeScript, React 19, Express 5 | Nakon pisanja/izmjene bilo kojeg filea |

### Pravilo proaktivne aktivacije
- Pišeš novi controller → **code-reviewer** + **security-reviewer**
- Planiraš novi feature → **architect** prvo
- Mijenjaš auth ili middleware → **security-reviewer** obvezno
- Komponenta raste > 200 linija → **architect**

## TypeScript & Zod Pravila

### TypeScript
- `any` je zabranjen — koristi `unknown` + type guard ili Zod `.parse()`
- Async funkcije moraju imati eksplicitni povratni tip (`Promise<ResponseType>`)
- `interface` za proširive objekte, `type` za unije i alias
- Castanje `as Type` samo nakon Zod validacije — nikad blind cast

### Zod
- Sheme žive u `backend/src/schemas/` — jedna datoteka po entitetu
- Frontend i backend dijele iste sheme gdje je moguće
- Uvijek koristi `.safeParse()` u controllerima (ne `.parse()` — nema throw)
- Sheme su `strict()` po defaultu — nepoznata polja se odbacuju

### Prisma
- Svaki upit mora imati `select` — nikad `findUnique/findMany` bez selecta
- `findMany` uvijek ima `where: { artistId }` — data isolation je obavezan
- Ne vraćaj `passwordHash` nikad u API responsu

## Active Features
- Dashboard (appointments + statistics)
- Client Management (CRUD, gallery, history)
- Appointment System (calendar, deposit tracking)
- Booking Dashboard (incoming requests, WhatsApp actions)
- Global Search (by name or phone)
- Auth (Login/Register)
