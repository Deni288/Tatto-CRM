# Tattoo CRM — Vodič kroz aplikaciju

Alat za tattoo artiste za upravljanje klijentima, terminima i poslovanjem.

---

## Dashboard

Prva stranica nakon prijave. Prikazuje pregled svega što se događa danas i ovaj mjesec.

**Statistike (gornji red):**
- **Today's Revenue** — ukupni prihod od termina danas
- **Upcoming Appts** — broj zakazanih termina koji još nisu bili
- **New Clients** — novi klijenti dodani ovaj mjesec

**Grafovi:**
- **Revenue — Last 6 Months** — bar chart prihoda po mjesecima
- **By Status** — donut chart termina po statusima (Scheduled / Completed / Cancelled / No-show)

**Today's Appointments** — lista današnjih termina s imenom klijenta, vremenom i statusom. Klik otvara kalendar.

**Quick Actions** — brzi linkovi na Manage Clients, New Consent Form, View Full Schedule.

**Booking Link (header)** — kopira tvoj javni link za booking jednim klikom.

---

## Clients

Lista svih tvojih klijenata s paginacijom (20 po stranici).

**Što možeš raditi:**
- **Dodati klijenta** — ime, prezime, email, telefon, tattoo history, custom polja
- **Pretraživati** — po imenu ili broju telefona (globalna pretraga)
- **Editirati inline** — hover na klijenta → ikona olovke → EditClientModal
- **Soft delete** — klijent se ne briše iz baze, samo se označava kao neaktivan

**Client Details stranica** (`/clients/:id`):
- Podaci o klijentu
- Lista svih njegovih termina
- **Galerija radova** — upload slika direktno na Cloudinary (bypass servera, brže)
- **Consent forme** — pregled potpisanih formi
- **Client Portal link** — možeš poslati klijentu da vidi svoje podatke

---

## Appointments

Kalendar i lista svih termina.

**Statusi termina:**
- `SCHEDULED` — zakazan, čeka se
- `COMPLETED` — obavljen
- `CANCELLED` — otkazan
- `NO_SHOW` — klijent nije došao

**Polja po terminu:**
- Klijent, naslov, opis
- Početak i kraj (datum + vrijeme)
- Cijena i depozit (depositAmount, depositPaid)
- Stripe Payment ID (ako je plaćeno online)

**Deposit tracking** — možeš zabilježiti je li depozit plaćen i koliko.

---

## Booking Requests

Dolazni upiti od potencijalnih klijenata putem javnog booking linka.

**Kako funkcionira:**
1. Dijeliš link `/book/:tvojId` s klijentima (na Instagramu, web stranici itd.)
2. Klijent ispuni formu — ime, email, telefon, ideja, željeni mjesec
3. Upit se pojavljuje u ovoj sekciji
4. Klijent automatski dobiva email potvrdu (Resend)
5. Ti dobivaš email notifikaciju + push notifikaciju u browseru

**Akcije na upit:**
- Approve / Reject
- WhatsApp brza akcija (otvara WhatsApp s brojem klijenta)
- Pretvori u termin

---

## Consent Forms

Digitalni pristanak koji klijent potpisuje prije tattoiranja.

**Što sadrži:**
- Medicinska stanja (alergije, bolesti koje mogu utjecati na tetoviranje)
- Alergije
- Suglasnost s uvjetima
- **Digitalni potpis** — klijent potpisuje prstom/mišem na canvas-u
- Potpis se sprema kao slika

**Kako koristiti:**
- Idi na `/consent/:appointmentId`
- Daj klijentu uređaj da potpiše na licu mjesta
- Forma se veže za termin i klijenta

---

## Profile

Upravljanje tvojim accountom.

**Sekcije:**
- **Update Name** — promjena prikazanog imena
- **Change Password** — stara + nova lozinka
- **Booking Link** — kopiranje tvog javnog linka
- **Push notifikacije** — uključi/isključi obavijesti za nove booking requeste
- **Export podataka** — preuzmi sve klijente ili termine kao CSV datoteku

---

## Billing

Upravljanje pretplatom.

**Planovi:**
- **Miesečno** — €22/mj
- **Godišnje** — €18/mj (€220 godišnje, ušteda 2 mjeseca)

**Statusi:**
- `TRIAL` — 30-dnevni besplatni period, bez kartice
- `ACTIVE` — aktivna pretplata
- `PAST_DUE` — plaćanje nije prošlo, ali još imaš pristup do isteka perioda
- `CANCELLED` — otkazano
- `EXPIRED` — trial ili pretplata istekla

**Stripe Portal** — klik na "Upravljaj pretplatom" otvara Stripe stranicu gdje možeš promijeniti plan, karticu ili otkazati.

---

## Admin Panel

Vidljivo samo ADMIN korisnicima.

**Što možeš:**
- Vidjeti sve registrirane artiste
- Aktivirati / deaktivirati account artista
- Deaktivirani artist ne može se prijaviti

---

## Client Portal

Javna stranica za klijenta — bez prijave, samo s magic linkom.

**Kako funkcionira:**
- Svaki klijent ima jedinstveni UUID token u bazi
- Link izgleda ovako: `/portal/:token`
- Klijent vidi svoje podatke, termine i consent forme
- Stranica je read-only — klijent ne može ništa mijenjati

**Automatski email:** Kad artist zakaže termin klijentu koji ima email adresu, klijent automatski dobiva email s:
- Nazivom, datumom i vremenom termina
- Gumbom koji vodi na njegov portal

**Gdje naći link ručno:** Client Details stranica → kopiraj Portal link → pošalji klijentu

---

## Sigurnost i auth

- Prijava koristi **JWT** (access token 15 min + refresh token 7 dana u httpOnly cookieju)
- Token se automatski obnavlja — ne moraš se prijavljivati svaki dan
- **Email verifikacija** pri registraciji — link vrijedi 24 sata
- Rate limiting na login (5 pokušaja / 15 min) i registraciju (5 / sat)
- Svaki artist vidi **samo svoje** klijente i termine — potpuna izolacija podataka

---

## Tech stack (za referencu)

| Sloj | Tehnologija |
|------|-------------|
| Frontend | React 19, Vite, Tailwind v4, Zustand, React Hook Form |
| Backend | Express 5, Node.js, TypeScript |
| Baza | PostgreSQL (Neon) via Prisma ORM |
| Auth | JWT + bcrypt |
| Email | Resend |
| Plaćanje | Stripe (Checkout + Webhooks + Customer Portal) |
| Slike | Cloudinary |
| Push | Web Push API (VAPID) |
| Hosting | Render (backend) + Vercel (frontend) |
