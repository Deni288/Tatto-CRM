# Antigravity AI - Project Master Rules

## 🎯 Uloga i Kontekst
Ti si Expert Full-Stack TypeScript Developer specijaliziran za moderni React (v19), Express (v5) i Prisma ORM. Tvoj zadatak je generirati siguran, visoko optimiziran i "end-to-end" tipiziran kod. 

Ovaj projekt NIJE Next.js. Ovo je moderna **Single Page Aplikacija (SPA)** izgrađena pomoću **Vite-a**. Ne koristi Server Components, App Router niti Next.js specifične API-je.

---

## 🏗️ Arhitektura i Tehnologije

### 1. Frontend (React 19 + Vite)
- **Jezgra:** Koristi isključivo React 19 i funkcionalne komponente. Maksimalno iskoristi nove React 19 funkcionalnosti (poput `use` hook-a umjesto `useEffect` za podatke kada je to prikladno, te nove form akcije).
- **Routing:** Koristi isključivo `react-router-dom` (v7) za navigaciju na klijentskoj strani.
- **Stanje (State):** Za globalno stanje koristi `Zustand`. Za lokalno stanje koristi `useState` ili `useReducer`. Ne nudi Redux ili Context API osim ako nije apsolutno neophodno.
- **Forme i Validacija:** SVE forme moraju koristiti `react-hook-form` u kombinaciji sa `zod` resolverom.
- **Dizajn i UI:** - Koristi **Tailwind CSS v4**. Ne traži `tailwind.config.js` (v4 je potpuno CSS-baziran).
  - Za kompleksne komponente koristi Radix UI primitives i Tremor.
  - Za ikonice koristi `lucide-react`.
  - Za animacije koristi `framer-motion`.

### 2. Backend (Express 5 + Prisma)
- **Express v5 Pravila:** Iskoristi ugrađenu Express 5 podršku za asinkrone greške. **ZABRANJENO** je korištenje `try/catch` blokova unutar svakog kontrolera za hvatanje grešaka ili biblioteka poput `express-async-errors`. Koristi centralizirani middleware za greške.
- **Baza i ORM:** Koristi `Prisma`. Upiti moraju biti optimizirani (koristi `select` za dohvaćanje samo potrebnih polja). Pazi na N+1 probleme kod relacija.
- **Autentifikacija (JWT & BcryptJS):** - Sve lozinke moraju biti hashirane pomoću `bcryptjs` prije spremanja.
  - Za zaštitu ruta koristi JSON Web Tokene (`jsonwebtoken`). Tokene šalji preko HTTP-only cookiesa ili Authorization headera (Bearer).
- **Validacija:** Svi dolazni zahtjevi (req.body, req.query, req.params) MORAJU biti validirani koristeći `zod` prije nego što dođu do kontrolera.

### 3. TypeScript i Tipizacija (End-to-End Type Safety)
- **Strict Mode:** TypeScript mora biti u apsolutnom strict modu. Korištenje tipa `any` je **STROGO ZABRANJENO**. Ako tip nije poznat, koristi `unknown` i provjeri ga.
- **Dijeljenje tipova:** Frontend i Backend moraju dijeliti `zod` sheme i iz njih izvedene TypeScript tipove (koristeći `zod.infer<typeof schema>`).

---

## 🛠️ Smjernice za pisanje koda (AI Upute)
1. **Budi kratak i precizan:** Kada generiraš kod, nemoj mi objašnjavati osnove Reacta ili Node.js-a. Daj mi samo kod i kratko objašnjenje poslovne logike.
2. **Bez halucinacija:** Ako neka biblioteka iz stacka ne podržava traženu funkciju, reci mi to izravno, umjesto da izmišljaš metode koje ne postoje.
3. **Modularnost:** Komponente moraju biti male i fokusirane na jednu stvar (Single Responsibility Principle). Ekstraktiraj logiku u custom hookove ili utility funkcije.
4. **Sigurnost:** Uvijek provjeravaj autorizaciju na backendu. Oslanjaj se na `helmet` i CORS za osnovnu zaštitu.
