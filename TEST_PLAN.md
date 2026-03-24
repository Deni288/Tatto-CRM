# TattoCRM — Testni plan prije promocije

## 1. Registracija i autentifikacija
- [ ] Registracija novog accounta → provjeri dolazi li verification mail
- [ ] Verifikacija emaila → radi li link
- [ ] Login s ispravnim podacima
- [ ] Login s pogrešnom lozinkom → prikazuje li grešku
- [ ] Logout → vraća li na landing page
- [ ] Osvježi stranicu dok si ulogiran → ostaje li session

## 2. Klijenti
- [ ] Dodaj novog klijenta
- [ ] Uredi podatke klijenta
- [ ] Dodaj sliku u galeriju klijenta
- [ ] Obriši klijenta (soft delete)
- [ ] Globalna pretraga po imenu i broju telefona

## 3. Termini
- [ ] Kreiraj novi termin za klijenta
- [ ] Provjeri dolazi li confirmation email klijentu
- [ ] Uredi termin
- [ ] Promijeni status (Scheduled → Completed)
- [ ] Obriši termin

## 4. Booking requests
- [ ] Otvori javni booking link (tattoocrm.app/book/...)
- [ ] Pošalji upit kao klijent → provjeri dolazi li email artistu
- [ ] Approve upit
- [ ] Reject upit
- [ ] Convert to Client → provjeri duplicate detection
- [ ] WhatsApp akcija → otvara li WhatsApp s ispravnim brojem

## 5. Consent forme
- [ ] Kreiraj consent formu za klijenta
- [ ] Potpisi prstom na mobitelu
- [ ] Spremi i provjeri je li sačuvano

## 6. Mobilno (obavezno!)
- [ ] Sve gore navedeno testiraj na mobitelu u portrait modu
- [ ] Provjeri Sign Out button vidljivost
- [ ] Navigacija između stranica

## 7. Billing
- [ ] Provjeri što se događa kad trial istekne
- [ ] Stripe checkout → koristi testnu karticu: 4242 4242 4242 4242
