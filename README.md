# FindAid — Emergency Aid Sharing Platform

FindAid is a full-stack web application that connects people who need emergency medical aid with those who can lend it. Users can post listings for items like blood, oxygen cylinders, wheelchairs, medicines, and medical equipment — and others can request to borrow them.

---

## Tech Stack

| Layer      | Technology                                      |
|------------|-------------------------------------------------|
| Framework  | Next.js 16 (App Router)                         |
| Language   | TypeScript                                      |
| Database   | MongoDB + Mongoose                              |
| Auth       | Custom JWT (jose) + NextAuth.js                 |
| Styling    | Tailwind CSS v4 + Shadcn/ui                     |
| Icons      | Lucide React                                    |
| Toasts     | Sonner                                          |

---

## Features

- **Browse listings** — filter by category, city, blood group, urgency
- **Post aid** — create listings with full location and availability details
- **Borrow requests** — send requests with urgency level, message, and contact info
- **Request lifecycle** — pending → approved → active → returned state machine
- **Auth** — JWT-based login with cookie + localStorage, protected routes
- **Dashboard** — manage your listings and track borrow requests
- **Responsive** — works on mobile and desktop

---

## Project Structure

```
findaid/
├── app/
│   ├── (auth)/
│   │   ├── login/          # /login
│   │   └── register/       # /register
│   ├── listings/
│   │   ├── page.tsx         # /listings — browse
│   │   ├── new/             # /listings/new — post aid
│   │   └── [id]/            # /listings/:id — detail
│   ├── dashboard/
│   │   ├── page.tsx         # /dashboard — overview
│   │   ├── my-listings/     # /dashboard/my-listings
│   │   └── requests/        # /dashboard/requests
│   └── api/
│       ├── auth/
│       │   ├── login/       # POST — custom JWT login
│       │   ├── register/    # POST — register
│       │   └── [...nextauth]/ # NextAuth handler
│       ├── listings/
│       │   ├── route.ts     # GET /api/listings, POST /api/listings
│       │   ├── mine/        # GET /api/listings/mine
│       │   └── [id]/        # GET, PATCH, DELETE /api/listings/:id
│       └── requests/
│           ├── route.ts     # GET, POST /api/requests
│           └── [id]/        # GET, PATCH /api/requests/:id
├── components/
│   ├── layout/
│   │   └── Navbar.tsx
│   ├── listing/
│   │   └── ListingCard.tsx
│   └── request/
│       └── BorrowModal.tsx
├── context/
│   └── AuthContext.tsx      # Global auth state
├── hooks/
│   └── useAuth.ts           # Re-exports from AuthContext
├── lib/
│   ├── connectDB.ts         # Mongoose connection
│   ├── auth.ts              # NextAuth options
│   ├── models.ts            # Register all models
│   └── utils.ts             # cn, apiSuccess, apiError, getPagination
├── models/
│   ├── User.ts
│   ├── Listing.ts
│   └── BorrowRequest.ts
├── types/
│   ├── index.ts             # Shared TypeScript types
│   └── next-auth.d.ts       # NextAuth type extensions
└── proxy.ts             # Auth proxy — cookies, bearer, page protection
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (or local MongoDB)

### Installation

```bash
# Clone the repository
git clone https://github.com/Yash-Khandelwal2004/FindAid.git
cd findaid

# Install dependencies
npm install
```

### Environment Variables

Create a `.env.local` file in the root:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/findaid
NEXTAUTH_SECRET=your-long-random-secret-key
NEXTAUTH_URL=http://localhost:3000
```

> Generate a secure secret with: `openssl rand -base64 32`

### Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

---

## API Reference

### Auth

| Method | Endpoint              | Description          | Auth     |
|--------|-----------------------|----------------------|----------|
| POST   | `/api/auth/register`  | Register new user    | Public   |
| POST   | `/api/auth/login`     | Login, returns JWT   | Public   |

### Listings

| Method | Endpoint                  | Description               | Auth       |
|--------|---------------------------|---------------------------|------------|
| GET    | `/api/listings`           | Browse listings (filters) | Public     |
| POST   | `/api/listings`           | Create listing            | Required   |
| GET    | `/api/listings/mine`      | My listings               | Required   |
| GET    | `/api/listings/:id`       | Single listing            | Public     |
| PATCH  | `/api/listings/:id`       | Update listing            | Owner only |
| DELETE | `/api/listings/:id`       | Delete listing            | Owner only |

### Requests

| Method | Endpoint              | Description           | Auth            |
|--------|-----------------------|-----------------------|-----------------|
| POST   | `/api/requests`       | Submit borrow request | Required        |
| GET    | `/api/requests`       | My requests           | Required        |
| GET    | `/api/requests/:id`   | Single request        | Owner/Requester |
| PATCH  | `/api/requests/:id`   | Update request status | Owner/Requester |

---

## Borrow Request State Machine

```
pending
  ├── approved  (owner)
  ├── rejected  (owner)
  └── cancelled (requester)

approved
  ├── active    (owner — item handed over)
  └── cancelled (requester)

active
  └── returned  (owner — item returned)

returned  ← terminal
rejected  ← terminal
cancelled ← terminal
```

---

## Aid Categories

| Category   | Notes                                  |
|------------|----------------------------------------|
| Blood      | Requires blood group (A+, B-, etc.)    |
| Oxygen     | Cylinders, concentrators               |
| Wheelchair | Manual or electric                     |
| Medicine   | Prescription or OTC                    |
| Equipment  | BP monitors, nebulizers, etc.          |
| Other      | Anything else                          |

---

## Authentication Flow

1. User registers at `/register`
2. User logs in at `/login` → server returns JWT
3. JWT stored in `localStorage` + `auth-token` cookie
4. Cookie read by `proxy.ts` for page protection
5. Bearer token sent in `Authorization` header for API calls
6. Proxy injects `x-user-id` header into protected API routes

---

## Deployment

### Vercel (recommended)

```bash
npm run build   # verify build passes locally first
```

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy

### Environment Variables on Vercel

| Key              | Value                          |
|------------------|--------------------------------|
| `MONGODB_URI`    | Your MongoDB Atlas connection  |
| `NEXTAUTH_SECRET`| Random secret string           |
| `NEXTAUTH_URL`   | Your production URL            |

---

## License

MIT
