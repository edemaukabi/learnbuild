# LearnBuild

A full-stack e-learning platform where instructors create and sell courses, and students learn through structured video content. Built with NestJS and Next.js.

---

## Features

**For Students**
- Browse and search the course catalog by category, level, and price
- Enroll in free courses instantly or pay via Paystack for paid ones
- Track lesson progress with a visual completion bar
- Take timestamped notes during lessons
- Leave star ratings and reviews
- Download PDF certificates on course completion

**For Instructors**
- Create courses with a drag-and-drop curriculum builder
- Upload video lessons (stored on Cloudinary)
- Set pricing, requirements, learning outcomes, and tags
- Publish, archive, or draft courses
- View earnings and enrollment stats on an instructor dashboard

**For Admins**
- Platform-wide stats (users, revenue, enrollments, courses)
- User management — search, view, promote/demote roles
- Course moderation — override status, filter by state
- Category management — create and delete categories

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend framework | NestJS 10 + TypeScript |
| Database | PostgreSQL 15 (Prisma ORM) |
| Cache | Redis 7 |
| Auth | Passport.js · JWT · httpOnly cookies |
| Payments | Paystack (provider-agnostic interface) |
| File / video storage | Cloudinary (default) · Cloudflare R2 (configurable) |
| Email | Nodemailer · Gmail SMTP |
| PDF certificates | pdfkit |
| API docs | Swagger UI (`/api/v1/docs` in development) |
| Container | Docker Compose |
| Frontend framework | Next.js 15 · App Router · TypeScript |
| Styling | Tailwind CSS · shadcn/ui |
| Drag-and-drop | @dnd-kit/sortable |
| Frontend hosting | Vercel |
| Backend hosting | VPS (Docker + Nginx) |

---

## Project Structure

```
learnbuild/
├── backend/               # NestJS API
│   ├── src/
│   │   ├── auth/          # JWT auth, refresh tokens, httpOnly cookies
│   │   ├── courses/       # Course CRUD, publish flow, catalog
│   │   ├── sections/      # Section management + reordering
│   │   ├── lessons/       # Lesson CRUD, video URL generation
│   │   ├── enrollments/   # Free enroll + Paystack checkout
│   │   ├── progress/      # Lesson completion tracking
│   │   ├── notes/         # Per-lesson timestamped notes
│   │   ├── reviews/       # Star ratings, aggregated course rating
│   │   ├── certificates/  # PDF generation, signed download URLs
│   │   ├── instructor/    # Video upload, instructor stats
│   │   ├── admin/         # Platform management endpoints
│   │   ├── storage/       # IStorageProvider abstraction (Cloudinary / R2)
│   │   ├── mail/          # Transactional email service
│   │   └── payments/      # IPaymentProvider abstraction (Paystack)
│   ├── prisma/            # Schema + migrations
│   ├── Dockerfile
│   ├── local.yml          # Docker Compose for local dev
│   └── production.yml     # Docker Compose for VPS
│
└── frontend/              # Next.js 15 App Router
    ├── app/
    │   ├── (public)/      # Landing, catalog, course detail
    │   ├── (auth)/        # Login, register
    │   └── (protected)/   # Dashboard, learn room, instructor tools, admin
    └── components/
```

---

## Local Development

### Prerequisites
- Node.js 20+
- Docker Desktop

### Backend

```bash
cd backend
cp .env.example .env
# Fill in: CLOUDINARY_*, SMTP_*, PAYSTACK_SECRET_KEY (see .env.example)

docker compose -f local.yml up --build -d
```

The API will be available at `http://localhost:8005`.  
Swagger UI (dev only): `http://localhost:8005/api/v1/docs`

### Frontend

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

The frontend will be available at `http://localhost:3000`.

### Create an admin account

After registering, promote your account to admin:

```bash
docker exec -it learnbuild-postgres psql -U learnbuild -d learnbuild \
  -c "UPDATE \"User\" SET role = 'ADMIN' WHERE email = 'your@email.com';"
```

---

## Environment Variables

### Backend (`.env`)

| Variable | Description |
|---|---|
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | Postgres credentials |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | JWT signing secrets (min 32 chars) |
| `COOKIE_SECURE` | `false` locally, `true` in production |
| `COOKIE_DOMAIN` | `localhost` locally, `.yourdomain.com` in production |
| `CORS_ORIGIN` | Frontend URL |
| `PAYSTACK_SECRET_KEY` | Paystack API key |
| `PAYSTACK_WEBHOOK_SECRET` | Same as your Paystack secret key |
| `STORAGE_PROVIDER` | `cloudinary` (default) or `r2` |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Cloudinary credentials |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | Gmail SMTP (use an App Password) |
| `ADMIN_EMAIL` | Email address that gets promoted to ADMIN on first register |

### Frontend (`.env.local`)

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8005/api/v1` (local) |

---

## API Endpoints

All routes are prefixed `/api/v1`. Full interactive docs at `/api/v1/docs` in development.

| Group | Base path |
|---|---|
| Auth | `/auth` |
| Courses | `/courses` |
| Sections | `/courses/:courseId/sections` |
| Lessons | `/sections/:sectionId/lessons` |
| Enrollments | `/enrollments` |
| Progress | `/progress` |
| Notes | `/notes` |
| Reviews | `/reviews` |
| Certificates | `/certificates` |
| Instructor | `/instructor` |
| Admin | `/admin` |
| Health | `/health` |

---

## Deployment

**Backend** — VPS with Docker Compose + Nginx  
**Frontend** — Vercel

```bash
# On the VPS
git clone https://github.com/edemaukabi/learnbuild.git
cd learnbuild/backend
cp .env.example .env   # fill in production values
docker compose -f production.yml up -d --build
```

Nginx config template is at `nginx.conf.example`.

---

## License

MIT
