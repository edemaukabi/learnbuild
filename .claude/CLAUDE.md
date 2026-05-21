# CLAUDE.md — LearnBuild

> Part of the **aipowered** workspace.
> Workspace patterns, commands, and knowledge base: `../.claude/`

---

## Project Overview

LearnBuild is a full-stack E-Learning LMS platform for instructors to create and sell courses and for students to learn through recorded and live content. Role-based access: Platform Admin (Edema), Instructor, Student, Guest.

**Status:** In development
**Live URL:** TBD — learnbuild.edemaukabi.dev (Vercel) + learnbuild-api.edemaukabi.dev (VPS)
**Stack:** NestJS 10 + Next.js 15 + TypeScript + PostgreSQL + Redis
**Repo:** TBD (GitHub)

---

## Stack

### Backend
| Layer | Technology |
|---|---|
| Framework | NestJS 10 (Node.js + TypeScript) |
| ORM | Prisma |
| Database | PostgreSQL 15 |
| Cache / Queue broker | Redis |
| Background jobs | BullMQ |
| Real-time | Socket.io (NestJS Gateway) |
| Auth | Passport.js + JWT strategy + httpOnly cookies |
| Admin panel | AdminJS + Prisma adapter |
| Email | Nodemailer + Gmail App Password |
| Payments | Paystack (abstracted — provider-agnostic interface) |
| File storage | Cloudflare R2 (S3-compatible) |
| Video hosting | Bunny.net Stream (HLS, CDN, signed URLs) |
| PDF generation | pdfkit (certificates) |
| Container | Docker Compose |

### Frontend
| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Icons | lucide-react |
| Dark mode | next-themes (key: `lb-theme`) |
| Drag-and-drop | @dnd-kit/sortable (course builder) |
| File upload UI | react-dropzone |
| HTTP client | Axios (withCredentials: true — httpOnly cookies) |
| Hosting | Vercel |

---

## Roles

| Role | Description |
|---|---|
| Platform Admin | Edema — full access, user management, platform config, revenue dashboard |
| Instructor | Create/manage courses, view analytics, receive payouts |
| Student | Browse catalog, enroll, learn, earn certificates |
| Guest | Browse public catalog and course detail pages (read-only) |

---

## Architecture Decisions

### Auth — httpOnly JWT cookies
- Access token: 15 min lifetime
- Refresh token: 7 days, rotation on use, blacklist on logout
- Cookies: `access_token` + `refresh_token` (httpOnly, Secure in prod, SameSite=Lax)
- Frontend: Axios with `withCredentials: true` — no token in localStorage, no Authorization header
- Never store tokens in localStorage — this is an LMS with real users and payment data

### Payments — agnostic provider pattern
- Payment logic lives behind `IPaymentProvider` interface — swap provider by changing one line in `PaymentModule`
- Active provider: **Paystack** (`PaystackProvider`)
- To add a new provider: implement `IPaymentProvider`, register in `PaymentModule`
- Enrollment for PAID courses: backend generates reference → calls `initiatePayment()` → returns `checkoutUrl` → webhook `charge.success` triggers enrollment
- Enrollment for FREE courses: direct `POST /courses/:id/enroll` — no payment provider involved
- Webhook signature: HMAC-SHA512 of raw body with `PAYSTACK_WEBHOOK_SECRET`, compared against `x-paystack-signature` header
- Raw body required: `NestFactory.create(AppModule, { rawBody: true })` in `main.ts`
- NEVER create enrollment on frontend callback — only inside webhook handler

### Bunny.net Stream — signed URLs
- All video playback URLs must be signed (short-lived expiry)
- Never expose the Bunny API key to the frontend
- The backend generates signed URLs and returns them; frontend uses the signed URL directly in the HLS player

### Cloudflare R2 — S3-compatible storage
- Use `@aws-sdk/client-s3` with R2 endpoint override
- Bucket: `learnbuild-assets`
- All file upload/download URLs are pre-signed (15 min expiry for downloads)

### Docker volumes — CRITICAL
All Docker volume names MUST be prefixed `learnbuild-` to avoid cross-project data collisions on the shared VPS.
- `learnbuild-postgres-data`
- `learnbuild-redis-data`
- `learnbuild-uploads` (if any local mount)

NEVER run `docker compose down -v` — it deletes all volumes and data.

### VPS Port
Backend runs on **port 8005** on the Contabo VPS.
Nginx subdomain: `learnbuild-api.edemaukabi.dev` → `localhost:8005`

---

## Design System

Based on uploaded prototype files. Dark/light mode with CSS custom properties.

### Color Tokens
```css
/* Dark mode (default) */
--bg: #070D14;
--surface: #0F1923;
--card: #1A2535;
--card-2: #1F2C40;
--card-3: #243349;
--border: rgba(255, 255, 255, 0.08);
--border-2: rgba(255, 255, 255, 0.12);
--border-strong: rgba(255, 255, 255, 0.18);
--fg: #F0F6FF;
--fg-2: #94A3B8;
--fg-3: #64748B;
--fg-4: #475569;
--sky: #0EA5E9;
--sky-2: #38BDF8;
--sky-soft: rgba(14, 165, 233, 0.12);
--sky-edge: rgba(14, 165, 233, 0.34);
--teal: #0D9488;
--teal-2: #14B8A6;
--teal-soft: rgba(13, 148, 136, 0.14);
--teal-edge: rgba(13, 148, 136, 0.36);
--amber: #FCD34D;
--amber-2: #FBBF24;
--amber-soft: rgba(252, 211, 77, 0.10);
--amber-edge: rgba(252, 211, 77, 0.36);
--rose: #F43F5E;
--violet: #A78BFA;
--chrome-bg: rgba(7, 13, 20, 0.78);

/* Light mode — [data-theme="light"] */
--bg: #F4F7FB;
--surface: #FFFFFF;
--card: #FFFFFF;
--card-2: #F1F5F9;
--card-3: #E2E8F0;
--border: rgba(15, 23, 42, 0.08);
--border-2: rgba(15, 23, 42, 0.12);
--border-strong: rgba(15, 23, 42, 0.18);
--fg: #0B1426;
--fg-2: #475569;
--fg-3: #64748B;
--fg-4: #94A3B8;
--sky-soft: rgba(14, 165, 233, 0.10);
--sky-edge: rgba(14, 165, 233, 0.30);
--teal-soft: rgba(13, 148, 136, 0.10);
--teal-edge: rgba(13, 148, 136, 0.32);
--amber-soft: rgba(252, 211, 77, 0.22);
--amber-edge: rgba(217, 162, 10, 0.42);
--chrome-bg: rgba(255, 255, 255, 0.82);
```

### Typography
- Sans: `"Geist", "Inter", ui-sans-serif`
- Mono: `"Geist Mono", "JetBrains Mono", ui-monospace`
- Load from Google Fonts (Geist + Geist Mono + Inter)

### Radii
```
--r-xs: 6px  --r-sm: 8px  --r-md: 10px  --r-lg: 12px
--r-xl: 14px  --r-2xl: 18px  --r-pill: 999px
```

### Transitions
```
--t-fast: 120ms cubic-bezier(0.2, 0.7, 0.2, 1)
--t:      180ms cubic-bezier(0.2, 0.7, 0.2, 1)
--t-slow: 320ms cubic-bezier(0.16, 1, 0.3, 1)
```

### Brand Mark
- 28×28px, border-radius 8px
- Gradient: `linear-gradient(135deg, #0EA5E9 0%, #0D9488 100%)`
- Inner: white border, border-top-right and border-bottom-left radius = 0 (L-shape bookmark)

### Theme Storage
- localStorage key: `lb-theme`
- Values: `"dark"` | `"light"`
- Pre-paint script reads this on `<html data-theme>` before JS hydrates

### Pages Designed
1. **Landing** — Hero, logo cloud, featured courses, how it works, testimonials, CTA
2. **Catalog** — Filters sidebar (260px), course grid (9 cards), pagination
3. **Course detail** — Hero, curriculum accordion, instructor bio, sticky enroll sidebar (380px)
4. **Learn** — 56px topbar, collapsible lesson tree (300px), video player, side panel (360px: Notes/Q&A/Announce)
5. **Dashboard** — 4 stat cards + sparklines, continue learning, certificates, weekly goal, activity feed, recommendations, events
6. **Course builder** — 5-step rail, lesson tree (340px DnD), lesson editor (video/text/quiz type toggle)

---

## Local Development

### Backend
```bash
cd backend
cp .env.example .env
# Fill in values
docker compose -f local.yml up --build
```

### Frontend
```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev   # http://localhost:3000
```

---

## Environment Variables

### Backend (`.env`)
| Variable | Local | Production |
|---|---|---|
| `NODE_ENV` | `development` | `production` |
| `PORT` | `8005` | `8005` |
| `DATABASE_URL` | `postgresql://...` | production Postgres |
| `REDIS_URL` | `redis://redis:6379` | production Redis |
| `JWT_ACCESS_SECRET` | any string | 64-char random |
| `JWT_REFRESH_SECRET` | any string | 64-char random |
| `COOKIE_SECURE` | `false` | `true` |
| `COOKIE_DOMAIN` | `localhost` | `.edemaukabi.dev` |
| `CORS_ORIGIN` | `http://localhost:3000` | `https://learnbuild.edemaukabi.dev` |
| `PAYSTACK_SECRET_KEY` | `sk_test_...` | `sk_live_...` |
| `PAYSTACK_WEBHOOK_SECRET` | Paystack webhook secret | production secret |
| `BUNNY_API_KEY` | Bunny API key | same |
| `BUNNY_LIBRARY_ID` | Bunny video library ID | same |
| `BUNNY_CDN_HOSTNAME` | `vz-xxx.b-cdn.net` | same |
| `R2_ACCOUNT_ID` | Cloudflare account ID | same |
| `R2_ACCESS_KEY_ID` | R2 access key | same |
| `R2_SECRET_ACCESS_KEY` | R2 secret | same |
| `R2_BUCKET` | `learnbuild-assets` | same |
| `SMTP_HOST` | `smtp.gmail.com` | same |
| `SMTP_PORT` | `587` | same |
| `SMTP_USER` | Gmail address | same |
| `SMTP_PASS` | Gmail App Password | same |
| `ADMIN_EMAIL` | `edemaukabi@gmail.com` | same |

### Frontend (`.env.local`)
| Variable | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8005/api/v1` (local) |
| `NEXT_PUBLIC_API_URL` | `https://learnbuild-api.edemaukabi.dev/api/v1` (production) |

---

## Known Issues / Gotchas

- **Paystack webhook raw body**: Use `NestFactory.create(AppModule, { rawBody: true })` in `main.ts`. Access raw body via `@RawBody()` decorator in the webhook controller. Verify with HMAC-SHA512 against `x-paystack-signature` header.
- **Bunny signed URLs**: Generate on the backend, never expose the signing key. Signed URLs expire — keep expiry > video segment length.
- **Docker volume prefix**: All volumes must start with `learnbuild-`. Never use `down -v`.
- **BullMQ + Redis**: Queues must be drained gracefully on shutdown — use `app.enableShutdownHooks()`.
- **AdminJS**: Runs on a separate route, e.g. `/admin`. Protect with session auth separate from JWT cookies.

---

## Deploy Runbook

See workspace: `../.claude/knowledge/deployment/portfolio-vps.md` (adapt for port 8005).

Project-specific:
- VPS port: **8005**
- Backend subdomain: `learnbuild-api.edemaukabi.dev`
- Frontend: Vercel — `learnbuild.edemaukabi.dev`
- Docker Compose production file: `backend/production.yml`
- All volumes prefixed `learnbuild-`
