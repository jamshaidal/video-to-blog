# AI Video Platform

Production-style AI video processing app with:

- Next.js frontend
- Express API
- PostgreSQL + Prisma
- Redis + BullMQ worker queue
- S3-compatible object storage
- OpenAI for transcription and content generation
- FFmpeg for media processing

## Project layout

```text
backend/
  prisma/
  src/
    config/
    controllers/
    middleware/
    queue/
    routes/
    services/
    utils/
    workers/
frontend/
  app/
  components/
  services/
docker-compose.yml
```

## Local infrastructure

Start PostgreSQL, Redis, and MinIO:

```bash
docker compose up -d
```

Services:

- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`
- MinIO API: `http://localhost:9000`
- MinIO Console: `http://localhost:9001`

## Environment setup

Backend:

1. Copy [backend/.env.example](C:/Users/dr.m.asif/ai-video-platform/backend/.env.example) to `backend/.env`
2. Fill in:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `OPENAI_API_KEY`
   - AWS / MinIO values
   - `ENABLE_EMBEDDED_WORKER=true` for a single-process local dev setup

Frontend:

1. Copy [frontend/.env.example](C:/Users/dr.m.asif/ai-video-platform/frontend/.env.example) to `frontend/.env.local`
2. Set `NEXT_PUBLIC_API_BASE_URL=http://localhost:5000`

## Prisma setup

Generate the client:

```bash
cd backend
npx prisma generate
```

Apply the initial migration:

```bash
npx prisma migrate deploy
```

For development you can also use:

```bash
npx prisma migrate dev
```

## Run the app

Backend API:

```bash
cd backend
npm start
```

In local development, `npm start` now also starts the BullMQ worker by default.
Set `ENABLE_EMBEDDED_WORKER=false` if you want to run the worker separately.

Worker:

```bash
cd backend
npm run worker
```

Frontend:

```bash
cd frontend
npm run dev
```

## Deploy with Docker

This repo now includes a self-contained production stack for a single VPS or cloud VM.
It runs:

- Next.js frontend
- Express API
- separate BullMQ worker
- PostgreSQL
- Redis
- MinIO object storage

### 1. Create the production env file

Copy [.env.production.example](C:/Users/dr.m.asif/ai-video-platform/.env.production.example) to `.env.production` and update the values.

Important values:

- `JWT_SECRET`
- `OPENAI_API_KEY`
- `POSTGRES_PASSWORD`
- `MINIO_ROOT_PASSWORD`
- `AWS_SECRET_ACCESS_KEY`
- `NEXT_PUBLIC_API_BASE_URL`
- `AWS_S3_PUBLIC_ENDPOINT`

For a simple server deployment:

- `NEXT_PUBLIC_API_BASE_URL` should be your public API URL such as `http://YOUR_SERVER_IP:5000` or `https://api.example.com`
- `AWS_S3_PUBLIC_ENDPOINT` should be the public MinIO/S3 URL the browser can reach, such as `http://YOUR_SERVER_IP:9000`
- Keep `AWS_S3_ENDPOINT=http://minio:9000` so the backend and worker still talk to the internal container network

### 2. Build and start the production stack

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build
```

The backend container automatically runs `prisma migrate deploy` before starting the API.

### 3. Open the app

- Frontend: `http://YOUR_SERVER_IP:3000`
- API health check: `http://YOUR_SERVER_IP:5000/health`
- MinIO console: `http://YOUR_SERVER_IP:9001`

### 4. Notes

- The frontend build bakes in `NEXT_PUBLIC_*` values, so rebuild the frontend container if you change them later.
- The worker runs as a separate service in production, so `ENABLE_EMBEDDED_WORKER` stays `false`.
- If you put this behind Nginx, Caddy, or Cloudflare, point your domain there and keep the internal container URLs unchanged.
- For a more locked-down production setup, avoid exposing PostgreSQL and Redis publicly unless you actually need direct access.

## Deploy Frontend On Vercel And Backend On Render

This project now also includes a [render.yaml](C:/Users/dr.m.asif/ai-video-platform/render.yaml) blueprint for:

- Render Postgres
- Render Key Value
- Render web service for the API
- Render worker service for BullMQ jobs
- Render-hosted MinIO with a persistent disk for S3-compatible storage

The frontend stays in [frontend](C:/Users/dr.m.asif/ai-video-platform/frontend) and is a standard Next.js app for Vercel.

### 0. Fix the live frontend DNS first

If your root domain still points to an old host, Vercel can look "connected" in the dashboard while the public site still serves the wrong app.

For this project, the intended split is:

- `fuvideo.site` -> Vercel frontend
- `www.fuvideo.site` -> Vercel frontend alias
- `api.fuvideo.site` -> Render API

In Namecheap Advanced DNS:

- delete the old apex `A` record if it still points to the previous host
- set the apex frontend record to the exact Vercel target shown in your project domain settings
- if you need a generic fallback, Vercel's current docs use `A @ -> 76.76.21.21`
- add the `www` record exactly as Vercel shows for your domain
- remove conflicting `AAAA`, wildcard `*`, redirect, or duplicate `A` / `CNAME` records for `@` and `www`

Before moving on, make sure:

- `https://fuvideo.site` loads the Vercel frontend
- `https://www.fuvideo.site` resolves to the same frontend

### 1. Put the project in a GitHub repo

Vercel and Render both deploy cleanly from GitHub. The simplest setup is one repository rooted at this project so both platforms can read the same codebase.

### 2. Create the Render backend stack

In Render:

1. Create a new Blueprint and point it at your repo.
2. Use [render.yaml](C:/Users/dr.m.asif/ai-video-platform/render.yaml).
3. When Render prompts for secret values, set:
   - `OPENAI_API_KEY`
   - `SMTP_HOST`
   - `SMTP_USER`
   - `SMTP_PASS`

After the Blueprint deploys, Render will give you:

- one public URL for `ai-video-api`
- one public URL for `ai-video-minio`

The API service automatically runs `prisma migrate deploy` on startup.
The MinIO bucket is created automatically on first use.
The API service is preconfigured for `CORS_ORIGIN=https://fuvideo.site`.

### 3. Create the Vercel frontend project

Create a Vercel project from the same GitHub repo, but set the Root Directory to:

```text
frontend
```

Set these production environment variables in Vercel:

- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_WHATSAPP_NUMBER`

Set `NEXT_PUBLIC_API_BASE_URL` to your final Render API domain:

```text
https://api.fuvideo.site
```

If the backend is not ready yet, you can temporarily point it to the default Render URL and update it later.

### 4. Add the backend custom domain

The blueprint now requests `api.fuvideo.site` on the Render API service. In Render:

1. Open `ai-video-api`
2. Go to Settings -> Custom Domains
3. Confirm `api.fuvideo.site` is present
4. Copy the DNS target Render asks for

Then in Namecheap Advanced DNS:

- add the exact record Render requests for `api`
- this is usually a `CNAME api -> <service>.onrender.com`, but always use Render's shown value exactly
- remove any conflicting existing `api` record before adding the new one

When Render verifies the domain, confirm:

```text
https://api.fuvideo.site/health
```

returns the healthy JSON response.

### 5. Connect your Namescheap domain

Recommended split:

- `fuvideo.site` -> Vercel frontend
- `www.fuvideo.site` -> Vercel frontend
- `api.fuvideo.site` -> Render API

You can also add a storage subdomain if you want cleaner media URLs later, such as:

- `files.fuvideo.site` -> Render MinIO

### 6. Redeploy the frontend after the API domain is ready

Once `api.fuvideo.site` is verified in Render:

- update Vercel production env `NEXT_PUBLIC_API_BASE_URL=https://api.fuvideo.site`
- trigger a production redeploy
- verify signup, login, upload, job polling, and downloads

## Core API

- `POST /auth/signup`
- `POST /auth/login`
- `POST /upload`
- `GET /jobs`
- `GET /jobs/:id`
- `GET /download/:id`

All job and upload routes require a JWT bearer token.

## Processing pipeline

1. Authenticated user uploads video
2. API stores source file in S3-compatible storage
3. API creates a `Job` row in Postgres
4. API enqueues the job in BullMQ
5. Worker downloads the source video
6. Worker extracts audio with FFmpeg
7. Worker transcribes with OpenAI
8. Worker generates transcript cleanup, blog, YouTube description, and captions
9. Worker stores outputs in storage and persists a `Result` row
10. Frontend polls job status and shows results/downloads

## Current production-readiness status

Implemented:

- Prisma/PostgreSQL schema and migration
- JWT auth with bcrypt password hashing
- BullMQ queue with retries and exponential backoff
- Separate worker process
- S3-compatible storage abstraction
- Upload validation and rate limiting
- Structured Winston request and worker logging
- Frontend auth, upload flow, job history, and result detail pages

Still recommended before real production launch:

- real secrets management
- HTTPS and deployment hardening
- background progress events via Redis pub/sub or SSE
- unit/integration tests
- webhook or email notifications
- subtitle `.srt` generation
- role-based admin tooling
