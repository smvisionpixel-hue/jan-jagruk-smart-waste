# Jan Jagruk on Replit

## Run

The app runs with:

```sh
npm run dev -- --host 0.0.0.0 --port 5000
```

The Replit workflow is configured as `Start application` on port 5000.

## Current backend foundation

- PostgreSQL schema: `db/schema.sql`
- Server-side report creation and querying: `src/lib/report.server.ts`
- Database pool: `src/lib/db.server.ts`
- Report IDs use the `JJ-REP-YYYY-XXXXXX` format.
- Related-report detection uses the configured 100 metre / 24 hour rule and creates an incident at 10 related reports.
- The seeded demo hotspot is `JJ-INC-2026-DEMO` with 10 reports.
- The report form uses browser geolocation and is explicitly labeled **Browser GPS Demo Tracking**.

## Environment

The Replit PostgreSQL integration supplies `DATABASE_URL` in the runtime environment. No browser code should access database credentials or future AI credentials.

The current import remains a hackathon MVP: authentication/RBAC, object storage, live vehicle telematics, pickup workflows, Gemini features, and database-backed analytics still need to be added before production deployment.