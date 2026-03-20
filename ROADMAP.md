# TattoCRM — Roadmap

**Stack:** React 19 (Vite) + Express 5 + PostgreSQL (Prisma) + JWT + Zod + Zustand + Tailwind v4
**Deploy:** Render (backend) + Vercel (frontend) + Neon (PostgreSQL)
**Zadnji update:** 2026-03-19

---

## ✅ Napravljeno

### Sigurnost
- JWT fallback `|| 'secret'` uklonjen — server ne boota bez `JWT_SECRET`
- Centralna env validacija pri startu (`config/env.ts`)
- Rate limiting na login + public booking endpoint
- `PrivateRoute` + `AdminRoute` guard u React routeru
- `requireAdmin` middleware (403 za non-ADMIN)
- `isActive` check pri loginu — deaktivirani artist ne može dobiti token
- Trust proxy za Render (rate limiter radi ispravno)
- **Refresh token** — access token 15min, httpOnly cookie 7 dana, Axios interceptor auto-refresh na 401

### Baza podataka
- Svi Prisma upiti filtrirani po `artistId` (data isolation)
- `select` na svim upitima — nikad ne vraćamo `passwordHash`
- Soft delete na Appointment i Client (`isActive` boolean)
- Prisma migracije verzioniran

### Frontend / UX
- Per-artist javni booking link: `/book/:artistId`
- Copy Booking Link gumb na Profile stranici
- Profile stranica: update imena, promjena lozinke, booking link
- Admin panel: lista artista, aktiviraj/deaktiviraj account
- Paginacija na listi klijenata (20 po stranici, Prev/Next)
- Optimistički update u svim Zustand store mutacijama (rollback na grešku)
- Registration flow → redirect na `/profile` odmah nakon registracije

### Email (Resend)
- Klijentu: potvrda booking requesta
- Artistu: alert o novom booking requestu
- Fire-and-forget — ne blokira API response

### Arhitektura
- Shared Zod sheme — `packages/shared/` npm workspace, single source of truth
- Svi inline Zod schemas izvučeni iz komponenti
- npm workspaces monorepo (backend + frontend + packages/shared)
- Vercel SPA routing fix (`vercel.json` rewrite)
- Render + Vercel konfigurirani za monorepo build

---

## 🚧 U planu

### 🔴 Visoki prioritet (treba prije prvog klijenta)
Sve ovo je već napravljeno — aplikacija je production-ready za prvog klijenta.

### 🟡 Srednji prioritet — ✅ SVE ZAVRŠENO (2026-03-19)

**Gallery — Cloudinary direktan upload** ✅
**Dashboard grafovi — Tremor Charts (revenue bar + donut)** ✅
**Consent form — Canvas signature pad** ✅

### 🟢 Niski prioritet (nice to have)

**Stripe billing**
- Trial period (30 dana besplatno)
- Stripe Checkout za mjesečnu/godišnju pretplatu
- Webhook za aktivaciju/deaktivaciju artista
- Admin vidi billing status svakog artista

**Push notifikacije**
- Browser push notifikacije za novi booking request
- Web Push API + service worker

**Mobilna aplikacija**
- React Native (Expo) — dijeli logiku sa webom
- Ili: PWA (Progressive Web App) — brže, isti codebase

**Klijentski portal**
- Klijent dobije link gdje vidi sve svoje termine i galeriju
- Bez logina (magic link ili token u URL-u)

**Višejezičnost (i18n)**
- Booking forma na jeziku artista / klijenta
- `react-i18next`

**Automatizirani podsjetnici**
- Email / SMS klijentu 24h prije termina
- Cron job (node-cron ili Render cron job)

**Analytics**
- Koliko je booking linkova posjećeno
- Koji artisti imaju najviše konverzija
- Simple vlastiti analytics (bez Google Analytics)

**Backup i export**
- CSV export klijenata i termina
- Automatski DB backup

---

## Arhitekturne napomene

| Tema | Status |
|------|--------|
| SaaS multi-tenant model | ✅ Svaki artist `/book/:artistId` |
| Admin panel | ✅ `/admin`, samo `role: 'ADMIN'` |
| Shared Zod sheme | ✅ `packages/shared/` workspace |
| Logging (winston/pino) | ⚠️ Još uvijek `console.log` logger |
| Test suite | ❌ Nema testova |
| CI/CD pipeline | ⚠️ Auto-deploy na push, nema test gatekeeping |

---

## Redoslijed za sljedeće sesije

1. **Stripe billing** — Monetizacija (sljedeće)
2. **Push notifikacije** — Web Push API + service worker
3. **Klijentski portal** — Magic link, klijent vidi termine i galeriju
4. **CSV export** — Backup klijenata i termina
