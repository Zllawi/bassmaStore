# Modern Shop (SPA E‑Commerce)

Single‑Page Application for a modern e‑commerce storefront with a Node.js/Express backend. Built with React + Vite, TailwindCSS, React Query, and clean modular server design using TypeScript and Mongoose. Auth via JWT (access/refresh) with RBAC. Images upload locally in development behind a storage abstraction. Firestore is pluggable via ENV (MongoDB is default).

## Stack
- Frontend: React + Vite, react-router-dom, @tanstack/react-query, TailwindCSS, Framer Motion
- Backend: Node.js + Express + TypeScript, Mongoose, Zod, JWT
- DB: MongoDB Atlas (default). Optional Firestore via `DB_VENDOR=firebase` (interface ready)

## Monorepo
- apps/client – SPA frontend
- apps/server – API server

## Quick Start

1) Install deps

```
npm install
```

2) Configure env

- Copy `.env.example` to `apps/server/.env` and adjust values (MongoDB URI, JWT secrets, etc.)
- Optionally create `apps/client/.env` for dev overrides (e.g. `VITE_API_BASE=http://localhost:8080/api/v1`).

3) Seed dev data (optional but recommended)

```
npm run seed --workspace @shop/server
```

4) Run dev (concurrent server + client)

```
npm run dev
```

- Client dev: http://localhost:5173
- Server dev: http://localhost:8080

## API Base
`/api/v1`

### Routes
- Auth: `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/forgot`, `POST /auth/reset`
- Products: `GET /products`, `GET /products/:id`, `POST /products`, `PATCH /products/:id`, `DELETE /products/:id`
- Orders: `POST /orders`, `GET /orders/me`, `GET /orders/:id`, `PATCH /orders/:id/status`
- Users: `GET /users` (admin), `PATCH /users/:id` (admin)

## RBAC
- Roles: `admin`, `user`
- Admin routes protected with `requireRole('admin')`

## Non‑functional
- SPA only, responsive UI, ARIA attributes
- Perf: code-splitting + lazy routes
- Security: Helmet, CORS, rate-limit, input validation via Zod

## Uploads (Dev/Prod)
- Development: local uploads under `apps/server/uploads/` via Multer.
- Production/ephemeral hosting: set `UPLOADS_PROVIDER=cloudinary` and Cloudinary credentials. The server switches to memory storage and streams files to Cloudinary, returning permanent HTTPS URLs.

Env (see `apps/server/.env.example`):
- `UPLOADS_PROVIDER=cloudinary`
- Either `CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>` or set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
- Optional: `CLOUDINARY_FOLDER` (defaults to `shop-uploads`).

## Firestore Toggle
- Set `DB_VENDOR=firebase` and provide FIREBASE_* envs to use the Firestore data layer. MongoDB via Mongoose remains the default and fully implemented path.

## Scripts
- Root: `npm run dev` – runs both apps
- Server: `dev`, `build`, `start`, `seed`
- Client: `dev`, `build`, `preview`

## Seed Data
- 12 products
- Admin: `admin@shop.test / Admin@123`

## Notes
- This codebase is intentionally modular for extensibility: payments gateway interface, integrations layer (SMS/Email/Webhooks) hooks, storage adapters.
- On free instances (no persistent disk, possible cold starts):
  - Use MongoDB Atlas (set `DB_VENDOR=mongodb` and `MONGODB_URI`).
  - Use Cloudinary for uploads (`UPLOADS_PROVIDER=cloudinary`).
  - Cookies: in production the refresh token uses `Secure` and `SameSite=None` to work with cross-origin frontends.

## Deployment (Render single service)
- Root directory: repository root
- Build command: `yarn install && yarn build`
- Start command: `yarn workspace @shop/server start`
- Environment variables:
  - `NODE_ENV=production`
  - `NODE_VERSION=20`
  - `CORS_ORIGIN=https://your-frontend-domain`
  - `DB_VENDOR=mongodb` and `MONGODB_URI=<atlas-connection-string>`
  - `UPLOADS_PROVIDER=cloudinary` plus `CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>` (or the individual keys)
  - `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`
- Deploy flow:
  1. `yarn build` runs both server and client; the SPA is output to `apps/client/dist`.
  2. Express serves `/api/v1/*` and static assets from that dist folder. Any non-API path falls back to `index.html` so client routing works.
  3. Health check endpoint: `GET /api/v1/health`.
