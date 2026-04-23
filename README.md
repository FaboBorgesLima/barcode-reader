# Barcode Scanner

This project is a mainly a solution for a problem at my university (UTFPR), the control of materials in the labs are done using spreadsheets and manual reading of barcodes, which is very error-prone and inefficient. The app allows users to scan barcodes and export the data as CSV (compatible with almost any spreadsheet software), while the backend provides a secure API for managing rooms and barcodes.

A full-stack barcode scanning system composed of:

- **Backend** — NestJS REST API (TypeScript, Prisma ORM, PostgreSQL, Redis)
- **Android app** — Native Kotlin app (`BarCodeScannerAndSheetExport`) that scans barcodes and exports data to Google Sheets
- **Infrastructure** — Kubernetes manifests (Traefik ingress, CloudNativePG) + Docker Compose for local development

**Production URL:** `https://scanner.titanforgesystems.com.br`

---

## Repository layout

```
.
├── backend/                    # NestJS API
│   ├── prisma/                 # Schema + migrations
│   └── src/
│       ├── infra/              # Adapters (Prisma, Redis, JWT, SMTP)
│       ├── interface/http/     # Controllers & DTOs
│       ├── model/              # Domain entities
│       ├── module/             # NestJS modules
│       ├── repository/         # Repository interfaces
│       └── service/            # Domain services
├── BarCodeScannerAndSheetExport/  # Android app
├── kubernetes/                 # K8s manifests
└── docker-compose.yaml         # Local dev stack
```

---

## Local development

### Prerequisites

- Docker & Docker Compose
- Node.js 24 (for running backend outside Docker)
- Android Studio (for the Android app)

### Start the full stack

```bash
cp backend/.env.example backend/.env   # fill in values (see env vars below)
docker compose up
```

The API will be available at `http://localhost:3000/api`.  
Swagger docs: `http://localhost:3000/api/docs`.

### Run backend standalone

```bash
cd backend
npm install
npx prisma migrate dev
npm run start:dev
```

### Run tests

```bash
cd backend
npm test
```

---

## Environment variables

| Variable         | Required           | Default     | Description                              |
| ---------------- | ------------------ | ----------- | ---------------------------------------- |
| `DATABASE_URL`   | ✅                 | —           | PostgreSQL connection string             |
| `REDIS_URL`      | ✅                 | —           | Redis connection string                  |
| `JWT_SECRET`     | ✅                 | —           | Secret key for signing JWTs              |
| `JWT_EXPIRES_IN` | ❌                 | `7d`        | JWT expiry (e.g. `7d`, `24h`)            |
| `AUTH_STRATEGY`  | ✅                 | —           | `nodemailer` (prod) or `mock` (dev/test) |
| `SMTP_HOST`      | ✅ (if nodemailer) | —           | SMTP server hostname                     |
| `SMTP_PORT`      | ❌                 | `587`       | SMTP server port                         |
| `SMTP_SECURE`    | ❌                 | `false`     | `true` for port 465 TLS                  |
| `SMTP_USER`      | ✅ (if nodemailer) | —           | SMTP username / email address            |
| `SMTP_PASS`      | ✅ (if nodemailer) | —           | SMTP password                            |
| `SMTP_FROM`      | ❌                 | `SMTP_USER` | From address shown in sent emails        |
| `PORT`           | ❌                 | `3000`      | HTTP port the API listens on             |

---

## API overview

| Method       | Path                 | Auth | Description                              |
| ------------ | -------------------- | ---- | ---------------------------------------- |
| `POST`       | `/api/auth/initiate` | —    | Send OTP to email (rate-limited: 5/hour) |
| `POST`       | `/api/auth/login`    | —    | Exchange OTP for JWT                     |
| `POST`       | `/api/auth/register` | —    | Register + exchange OTP for JWT          |
| `POST`       | `/api/auth/logout`   | JWT  | Revoke current token                     |
| `GET/POST/…` | `/api/rooms`         | JWT  | Manage scan rooms                        |
| `GET/POST/…` | `/api/barcodes`      | JWT  | Manage barcodes inside a room            |

Full interactive docs are at `/api/docs` (Swagger UI).

---

## Authentication flow

```
App                       API                      Email
 │── POST /auth/initiate ──▶│                          │
 │                          │── OTP email ────────────▶│
 │◀─ 204 No Content ────────│                          │
 │                          │                          │
 │── POST /auth/login ──────▶│ (email + 6-digit code)  │
 │◀─ { token } ─────────────│                          │
```

OTPs expire after **10 minutes**. The `initiate` endpoint is rate-limited to **5 requests per email per hour** to prevent abuse.

---

## Android app

The Android app (`BarCodeScannerAndSheetExport`) talks to the backend over HTTPS.

**`local.properties`** controls the API URL during builds:

```properties
api.base.url=https://scanner.titanforgesystems.com.br/api/
```

For the emulator during local dev use `http://10.0.2.2:3000/api/` (default when the key is absent).

Build a debug APK:

```bash
cd BarCodeScannerAndSheetExport
./gradlew assembleDebug
```

---

## Deployment

### CI/CD (GitHub Actions)

| Workflow | Trigger           | What it does                                                   |
| -------- | ----------------- | -------------------------------------------------------------- |
| `ci.yml` | push/PR to `main` | npm audit, ESLint, Jest tests, Android build                   |
| `cd.yml` | push tag `v*.*.*` | Runs CI → builds & pushes Docker image → deploys to Kubernetes |

Deployment pushes a new image tag and runs `prisma migrate deploy` inside the running pod.

### Kubernetes

Manifests are in `kubernetes/`. The stack uses:

- **CloudNativePG** for PostgreSQL (`database.yaml`)
- **Redis** in-cluster deployment (`redis.yaml`)
- **Traefik** IngressRoute with Let's Encrypt TLS (`ingress.yaml`)

Apply manually (first-time or out-of-band):

```bash
kubectl apply -f kubernetes/database.yaml
kubectl apply -f kubernetes/redis.yaml
kubectl apply -f kubernetes/service.yaml
kubectl apply -f kubernetes/ingress.yaml
kubectl apply -f kubernetes/deployment.yaml
```

Create secrets from the example file:

```bash
cp kubernetes/secrets-example.yaml kubernetes/secrets.yaml
# edit secrets.yaml with real values
kubectl apply -f kubernetes/secrets.yaml
```

> `secrets.yaml` is git-ignored — never commit real secrets.

---

## GitHub Actions secrets required

Set these in **Settings → Secrets and variables → Actions** on the repository:

| Secret               | Description                                   |
| -------------------- | --------------------------------------------- |
| `DOCKERHUB_USERNAME` | DockerHub username                            |
| `DOCKERHUB_TOKEN`    | DockerHub access token                        |
| `KUBE_CONFIG`        | Full kubeconfig file content (base64 is fine) |
| `DATABASE_URL`       | PostgreSQL connection string                  |
| `REDIS_URL`          | Redis connection string                       |
| `JWT_SECRET`         | Long random string for JWT signing            |
| `JWT_EXPIRES_IN`     | Token lifetime (e.g. `7d`)                    |
| `AUTH_STRATEGY`      | `nodemailer`                                  |
| `SMTP_HOST`          | SMTP hostname                                 |
| `SMTP_PORT`          | SMTP port (e.g. `587`)                        |
| `SMTP_SECURE`        | `false` / `true`                              |
| `SMTP_USER`          | SMTP login                                    |
| `SMTP_PASS`          | SMTP password                                 |
| `SMTP_FROM`          | From address for OTP emails                   |
