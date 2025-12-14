# Nonito - E-commerce Store

En vacker e-handelssida för handgjorda produkter för föräldrar och barn. Byggd med Next.js och Stripe.

## 🚀 Snabbstart

### Förutsättningar
- Node.js 18+ 
- npm eller yarn
- Stripe-konto

### Installation

1. **Klona projektet och installera beroenden:**
```bash
cd frontend
npm install
```

2. **Konfigurera miljövariabler:**
```bash
cp .env.example .env.local
```

Uppdatera `.env.local` med dina Stripe-nycklar:
```
STRIPE_SECRET_KEY=sk_live_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

3. **Starta utvecklingsservern:**
```bash
npm run dev
```

4. **Öppna** [http://localhost:3000](http://localhost:3000)

## 📁 Projektstruktur

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes (Stripe checkout)
│   ├── bekraftelse/       # Order confirmation page
│   ├── produkter/         # Products pages
│   └── ...
├── components/            # React components
├── context/               # React context (Cart)
├── data/                  # Product data
├── public/               # Static assets
│   └── images/           # Product & fabric images
├── styles/               # Global CSS
└── types/                # TypeScript types
```

## 🎨 Funktioner

- **Responsiv design** med rosa accent-färger
- **Produktkatalog** med tygval
- **Varukorg** med lokal lagring
- **Stripe Checkout** för säker betalning
- **Svenska** som standardspråk
- **Netlify-redo** deployment

## 🔧 Anpassa produktbilder

Byt ut placeholder-bilder i `/public/images/fabrics/`:

### Yttertyger
- `Blomster.jpg`
- `Joel.jpg` (Noel)
- `Olivia.jpg`
- `anki-placeholder.jpg` → `Anki.jpg`
- `Jennifer.jpg`
- `Bernie.jpg`
- `Sonia.jpg`

### Innertyger
- `inner-cloud-placeholder.jpg` → `inner-cloud.jpg`
- `inner-sand-placeholder.jpg` → `inner-sand.jpg`
- `inner-fika-placeholder.jpg` → `inner-fika.jpg`
- `inner-rose-placeholder.jpg` → `inner-rose.jpg`
- `inner-mint-placeholder.jpg` → `inner-mint.jpg`

## 🚢 Deployment till Netlify

1. Pusha koden till GitHub
2. Anslut till Netlify
3. Lägg till miljövariabler i Netlify Dashboard:
   - `STRIPE_SECRET_KEY`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `NEXT_PUBLIC_SITE_URL` (din Netlify-URL)

4. Deploya!

## 💳 Stripe-integration

Checkout-flödet skickar metadata med kundens val:
- Produktnamn
- Valt yttertyg
- Valt innertyg (om tillämpligt)
- Antal

Detta syns i Stripe Dashboard under varje order.

## 📝 Licens

Privat projekt för Nonito.
