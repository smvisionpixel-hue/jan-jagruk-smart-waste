import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getDb } from "./db.server";

const REPORT_RADIUS_METERS = 100;
const REPORT_WINDOW_HOURS = 24;
const DEMO_USER_ID = "demo-citizen";

const reportInput = z.object({
  category: z.string().trim().min(1).max(80),
  description: z.string().trim().min(3).max(2_000),
  severity: z.enum(["low", "medium", "high", "critical"]),
  landmark: z.string().trim().max(160).optional(),
  latitude: z.number().finite().min(-90).max(90),
  longitude: z.number().finite().min(-180).max(180),
  photoDataUrl: z.string().max(2_500_000).optional(),
});

type NearbyReport = {
  id: string;
  report_code: string;
  category: string;
  latitude: number;
  longitude: number;
  created_at: Date;
};

function distanceInMeters(aLat: number, aLng: number, bLat: number, bLng: number) {
  const earthRadius = 6_371_000;
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const dLat = toRadians(bLat - aLat);
  const dLng = toRadians(bLng - aLng);
  const lat1 = toRadians(aLat);
  const lat2 = toRadians(bLat);
  const haversine =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return earthRadius * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

function incidentCode() {
  return `JJ-INC-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

function reportCode() {
  return `JJ-REP-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
}

async function getDetectionConfig(client: { query: (query: string) => Promise<{ rows: Array<{ value: { threshold?: number; radiusMeters?: number; windowHours?: number } }> }> }) {
  const result = await client.query(
    "SELECT value FROM app_settings WHERE key = 'incident_detection'",
  );
  const value = result.rows[0]?.value ?? {};
  return {
    threshold: value.threshold ?? 10,
    radiusMeters: value.radiusMeters ?? REPORT_RADIUS_METERS,
    windowHours: value.windowHours ?? REPORT_WINDOW_HOURS,
  };
}

async function ensureDemoCitizen() {
  const db = getDb();
  await db.query(
    `INSERT INTO profiles (id, display_name, role)
     VALUES ($1, $2, 'citizen')
     ON CONFLICT (id) DO NOTHING`,
    [DEMO_USER_ID, "Aarav Sharma"],
  );
}

export const getCitizenReports = createServerFn({ method: "GET" }).handler(async () => {
  await ensureDemoCitizen();
  const result = await getDb().query(
    `SELECT report_code, category, description, severity, landmark, latitude, longitude, status, created_at,
            photo_data_url IS NOT NULL AS has_photo
     FROM reports
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT 50`,
    [DEMO_USER_ID],
  );
  return { reports: result.rows };
});

export const createWasteReport = createServerFn({ method: "POST" })
  .validator(reportInput)
  .handler(async ({ data }) => {
    await ensureDemoCitizen();
    const db = getDb();
    const client = await db.connect();

    try {
      await client.query("BEGIN");
      const detectionConfig = await getDetectionConfig(client);
      const inserted = await client.query(
        `INSERT INTO reports
          (report_code, user_id, category, description, severity, landmark, latitude, longitude, photo_data_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id, report_code, category, severity, latitude, longitude, created_at`,
        [
          reportCode(),
          DEMO_USER_ID,
          data.category,
          data.description,
          data.severity,
          data.landmark ?? null,
          data.latitude,
          data.longitude,
          data.photoDataUrl ?? null,
        ],
      );
      const report = inserted.rows[0] as {
        id: string;
        report_code: string;
        category: string;
        severity: string;
        latitude: number;
        longitude: number;
        created_at: Date;
      };

      const nearby = await client.query<NearbyReport>(
        `SELECT id, report_code, category, latitude, longitude, created_at
         FROM reports
         WHERE category = $1
           AND created_at >= NOW() - ($2 * INTERVAL '1 hour')
           AND id <> $3`,
        [data.category, detectionConfig.windowHours, report.id],
      );
      const related = nearby.rows.filter(
        (candidate) =>
          distanceInMeters(
            data.latitude,
            data.longitude,
            candidate.latitude,
            candidate.longitude,
          ) <= detectionConfig.radiusMeters,
      );
      const relatedCount = related.length + 1;
      let incident: { incidentCode: string; reportCount: number } | null = null;

      if (relatedCount >= detectionConfig.threshold) {
        const existing = await client.query<{ incident_code: string; report_count: number }>(
          `SELECT i.incident_code, i.report_count
           FROM incidents i
           JOIN incident_reports ir ON ir.incident_id = i.id
           WHERE ir.report_id = ANY($1::uuid[])
           LIMIT 1`,
          [[report.id, ...related.map((item) => item.id)]],
        );

        if (existing.rowCount === 0) {
          const created = await client.query<{ id: string; incident_code: string }>(
            `INSERT INTO incidents
              (incident_code, category, severity, latitude, longitude, report_count, status)
             VALUES ($1, $2, $3, $4, $5, $6, 'reported')
             RETURNING id, incident_code`,
            [
              incidentCode(),
              data.category,
              data.severity,
              data.latitude,
              data.longitude,
              relatedCount,
            ],
          );
          const incidentRow = created.rows[0];
          await client.query(
            `INSERT INTO incident_reports (incident_id, report_id)
             SELECT $1, id
             FROM reports
             WHERE id = ANY($2::uuid[])
             ON CONFLICT DO NOTHING`,
            [incidentRow.id, [report.id, ...related.map((item) => item.id)]],
          );
          await client.query(
            `UPDATE reports SET status = 'incident_created'
             WHERE id = ANY($1::uuid[])`,
            [[report.id, ...related.map((item) => item.id)]],
          );
          await client.query(
            `INSERT INTO notifications (user_id, title, body)
             VALUES ($1, $2, $3)`,
            [
              DEMO_USER_ID,
              "Incident created",
              `${relatedCount} related ${data.category.toLowerCase()} reports were clustered within 100 metres.`,
            ],
          );
          incident = { incidentCode: incidentRow.incident_code, reportCount: relatedCount };
        } else {
          incident = {
            incidentCode: existing.rows[0].incident_code,
            reportCount: existing.rows[0].report_count,
          };
        }
      }

      await client.query(
        `INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, metadata)
         VALUES ($1, 'created', 'report', $2, $3::jsonb)`,
        [
          DEMO_USER_ID,
          report.id,
          JSON.stringify({ relatedCount, radiusMeters: REPORT_RADIUS_METERS }),
        ],
      );
      await client.query("COMMIT");

      return {
        reportCode: report.report_code,
        relatedCount,
        incident,
        rule: {
          radiusMeters: detectionConfig.radiusMeters,
          windowHours: detectionConfig.windowHours,
          threshold: detectionConfig.threshold,
        },
      };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  });
