# ✈️ SkyFare — Flight Search & Booking (MERN)

A colorful, mobile-first flight booking app built on the **MERN stack** (MongoDB · Express · React · Node) and pinned to **2021–2022 technology versions**. Part of a 12-app full-stack portfolio.

> **Engineering lesson:** *complex multi-field form state* (react-hook-form + dynamic field arrays) and *real external-API integration done safely* — the keyed **Amadeus Self-Service API** is proxied and cached entirely through Express, so the key never touches the browser.

---

## ✨ Features

- **Rich flight search form** — round-trip / one-way, airport **autocomplete**, swap origin↔destination, conditional return date, passenger counts (adults / children / infants), cabin class, direct-only toggle, with validation on the client *and* the server.
- **Live flight results** — proxied Amadeus Flight Offers, sortable by cheapest / fastest / fewest stops, with skeleton **loading**, **empty**, and **error** states on every async view.
- **Multi-step checkout** — a dynamic **passenger form per traveller** (react-hook-form `useFieldArray`), contact details, and a clearly-labelled **mock payment** step.
- **Bookings persisted to MongoDB** — each booking gets a reference like `SKY-7F3A9K`, viewable under **My trips** (with email filter).
- **Runs with zero setup** — if no Amadeus keys are present, the API returns clearly-labelled **sample flights** so the whole flow is explorable out of the box.
- **Accessible + responsive** — semantic HTML, labelled inputs, keyboard-navigable autocomplete, visible focus rings, works mobile → desktop.

---

## 🧱 Tech stack (pinned to 2021–2022)

**Frontend (`client/`)** — Create React App 5
| Package | Version |
|---|---|
| react / react-dom | 17.0.2 |
| react-router-dom | 6.3.x |
| react-hook-form | 7.x |
| axios | 0.27.2 |
| tailwindcss / postcss / autoprefixer | 3.1.x |
| react-toastify | 9.x |
| dayjs | 1.11.x |

**Backend (`server/`)** — Express + Mongoose
| Package | Version |
|---|---|
| express | 4.18.1 |
| mongoose | 6.5.x |
| express-validator | 6.14.x |
| helmet | 6.x |
| express-rate-limit | 6.x |
| node-cache | 5.x |
| cors | 2.8.5 |
| morgan | 1.10.x |
| dotenv | 16.0.x |
| axios | 0.27.2 |

**Runtime:** Node 16.x LTS (Gallium) · npm 8.x — enforced via `"engines": { "node": ">=16 <17" }`.

---

## 📁 Project structure

```
skyfare/
├── client/                 # React (CRA) — Tailwind, sky-blue accent
│   ├── public/
│   └── src/
│       ├── api/            # axios instance + endpoint modules
│       ├── components/     # Button, Card, Input, Select, Badge, Spinner,
│       │                   # EmptyState, ErrorState, AirportAutocomplete,
│       │                   # FlightCard, PassengerFields, Navbar, Footer…
│       ├── pages/          # Search, Results, Checkout, Confirmation, Bookings
│       ├── context/        # SearchContext (multi-step flow state)
│       ├── hooks/          # useDebounce, useUniqueId
│       └── utils/          # date/price/duration formatting
├── server/                 # Express + Mongoose
│   └── src/
│       ├── config/         # db.js (Mongoose connect)
│       ├── models/         # Booking.js
│       ├── routes/         # airport / flight / booking routers
│       ├── controllers/    # request handlers
│       ├── middleware/     # errorHandler.js, notFound.js
│       ├── services/       # amadeusService.js (proxy + cache) + mockData.js
│       ├── utils/          # asyncHandler, apiResponse, ApiError
│       └── server.js
├── package.json            # root — runs both apps with `concurrently`
└── .gitignore
```

---

## 🚀 Getting started

### Prerequisites
- **Node 16.x** and **npm 8.x**
- **MongoDB** — a local instance (`mongodb://localhost:27017`) or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster.
  *(Search works without a DB; bookings need one.)*
- *(Optional)* free **Amadeus** test credentials from [developers.amadeus.com](https://developers.amadeus.com). Without them, SkyFare runs in mock mode.

### 1. Install
```bash
# from the project root
npm run install:all
# (equivalent to: npm install && npm install --prefix server && npm install --prefix client)
```

### 2. Configure environment
```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```
Then open `server/.env` and (optionally) paste your Amadeus credentials.

### 3. Run both apps with one command
```bash
npm run dev
```
- API → http://localhost:5000
- Web → http://localhost:3000

The server logs whether it started in **LIVE** (real Amadeus) or **MOCK** mode.

---

## 🔐 Environment variables

**`server/.env`**
```
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
MONGO_URI=mongodb://localhost:27017/skyfare
JWT_SECRET=change_me
AMADEUS_CLIENT_ID=          # leave blank for mock mode
AMADEUS_CLIENT_SECRET=      # leave blank for mock mode
AMADEUS_BASE_URL=https://test.api.amadeus.com
```

**`client/.env`** — only `REACT_APP_*` is exposed to the browser; **no secrets here.**
```
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 🧠 The engineering lesson, in detail

**1. Never expose a third-party key to the browser.** The Amadeus `client_id`/`client_secret` live only in `server/.env`. React talks exclusively to our own `/api/*` routes; the Express `services/amadeusService.js` is the only thing that talks to Amadeus.

**2. OAuth2 token caching.** Amadeus uses client-credentials OAuth. We exchange the secret for a short-lived access token, cache it in memory until ~30s before expiry, and reuse it across requests instead of re-authenticating every call.

**3. Cache to respect the free-tier rate limit.** Search responses are cached with `node-cache` — airports for 24h (they rarely change), flight offers for 5min. Re-typing or re-searching is absorbed by the cache rather than hammering the upstream API. Our own routes are additionally protected by `express-rate-limit`.

**4. One response shape everywhere.** Every endpoint returns `{ success, data, message }` (or `{ success: false, message, errors }`), funnelled through an `asyncHandler` + centralized `errorHandler`, so the React `api/` layer unwraps every response identically.

**5. Complex form state.** The search form mixes async autocompletes (via `Controller`), conditional fields, and cross-field validation; checkout uses `useFieldArray` to render one validated sub-form per passenger.

---

## 🛰️ API reference

| Method | Route | Description |
|---|---|---|
| `GET` | `/api/health` | Health + current mode (`live`/`mock`) |
| `GET` | `/api/airports/search?keyword=lon` | Airport/city autocomplete (cached 24h) |
| `GET` | `/api/flights/search?origin=DUB&destination=JFK&departureDate=YYYY-MM-DD&adults=1…` | Flight offers (cached 5min) |
| `POST` | `/api/bookings` | Create a booking |
| `GET` | `/api/bookings?email=…` | List bookings (optional email filter) |
| `GET` | `/api/bookings/:reference` | Fetch one booking |

---

## 🧪 Available scripts

**Root**
- `npm run dev` — run client + server together (`concurrently`)
- `npm run server` / `npm run client` — run one side
- `npm run install:all` — install all three `package.json`s

**Server** (`cd server`) — `npm run dev` (nodemon) · `npm start` · `npm run lint`
**Client** (`cd client`) — `npm start` · `npm run build`

---

## 📸 Screenshots

| Search | Results | Checkout |
|---|---|---|
| _add screenshot_ | _add screenshot_ | _add screenshot_ |

| Confirmation | My trips |
|---|---|
| _add screenshot_ | _add screenshot_ |

---

## ⚠️ Notes
- **Demo only** — no real flights are booked and no real payments are processed. The payment step never sends full card data to the server (only cardholder name + last 4 digits are stored).
- For production you'd move the JWT/token into an `httpOnly` cookie and add real payment + ticketing integrations.

---

*Built as app #2 of a 12-project MERN portfolio. Accent color: **sky blue**.*
