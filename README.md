# Unified Community App (MERN)

This project merges the **admin dashboard UI**, **social feed**, and **event platform** ideas into a single app, with a **clean JWT auth (Option C)**.

## Features (implemented)
- JWT auth (register/login)
- Roles: `user`, `community_admin`, `super_admin`
- Create community (starts as `pending`)
- Super admin approves/rejects communities
- Request to join community (membership is `pending`)
- Community admins (and super admin) approve/reject members
- Community-scoped posts (create + like)
- Community-scoped events (create + RSVP + volunteer)

## Monorepo structure
- `server/` Express + MongoDB API
- `client/` React (Vite) + MUI admin dashboard UI

---

## 1) Server setup

```bash
cd server
cp .env.example .env
npm install
npm run dev
```

### Seed a Super Admin
```bash
cd server
npm run seed
```

## 2) Client setup

```bash
cd client
cp .env.example .env
npm install
npm run dev
```

Open the client at the Vite URL shown in your terminal.

---

## Default .env values
See `server/.env.example` and `client/.env.example`.
