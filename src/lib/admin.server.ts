import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getDb } from "./db.server";

const ADMIN_ID = "demo-admin";

const statusSchema = z.enum(["reported", "assigned", "in_progress", "resolved"]);

async function ensureAdminSeed() {
  const db = getDb();
  await db.query(
    `INSERT INTO profiles (id, display_name, role)
     VALUES ($1, 'Jan Jagruk Operations', 'admin')
     ON CONFLICT (id) DO NOTHING`,
    [ADMIN_ID],
  );
}

export const getAdminStats = createServerFn({ method: "GET" }).handler(async () => {
  await ensureAdminSeed();
  const db = getDb();
  const result = await db.query(`
    SELECT
      (SELECT COUNT(*)::int FROM reports) AS total_reports,
      (SELECT COUNT(*)::int FROM incidents WHERE status <> 'resolved') AS active_incidents,
      (SELECT COUNT(*)::int FROM incidents WHERE status = 'resolved') AS resolved_incidents,
      (SELECT COUNT(*)::int FROM incidents WHERE report_count >= 3) AS hotspots,
      (SELECT COUNT(*)::int FROM vehicles WHERE status <> 'offline') AS vehicles_online
  `);
  return result.rows[0];
});

export const getAdminIncidents = createServerFn({ method: "GET" }).handler(async () => {
  await ensureAdminSeed();
  const result = await getDb().query(`
    SELECT
      i.id,
      i.incident_code,
      i.category,
      i.severity,
      i.latitude,
      i.longitude,
      i.report_count,
      i.status,
      i.created_at,
      v.vehicle_code,
      d.display_name AS driver_name
    FROM incidents i
    LEFT JOIN incident_assignments ia ON ia.incident_id = i.id
    LEFT JOIN vehicles v ON v.id = ia.vehicle_id
    LEFT JOIN drivers d ON d.id = ia.driver_id
    ORDER BY i.created_at DESC
  `);
  return { incidents: result.rows };
});

export const getAdminIncident = createServerFn({ method: "GET" })
  .validator(z.object({ incidentCode: z.string().trim().min(1).max(80) }))
  .handler(async ({ data }) => {
    await ensureAdminSeed();
    const result = await getDb().query(
      `SELECT
        i.id, i.incident_code, i.category, i.severity, i.latitude, i.longitude,
        i.report_count, i.status, i.created_at,
        v.vehicle_code, v.registration_number, d.display_name AS driver_name,
        d.phone AS driver_phone
       FROM incidents i
       LEFT JOIN incident_assignments ia ON ia.incident_id = i.id
       LEFT JOIN vehicles v ON v.id = ia.vehicle_id
       LEFT JOIN drivers d ON d.id = ia.driver_id
       WHERE i.incident_code = $1`,
      [data.incidentCode],
    );
    const incident = result.rows[0];
    if (!incident) throw new Error("Incident not found.");

    const reports = await getDb().query(
      `SELECT r.report_code, r.category, r.severity, r.latitude, r.longitude, r.status, r.created_at,
              r.landmark, r.photo_data_url IS NOT NULL AS has_photo
       FROM incident_reports ir
       JOIN reports r ON r.id = ir.report_id
       JOIN incidents i ON i.id = ir.incident_id
       WHERE i.incident_code = $1
       ORDER BY r.created_at ASC`,
      [data.incidentCode],
    );
    return { incident, reports: reports.rows };
  });

export const updateIncidentStatus = createServerFn({ method: "POST" })
  .validator(z.object({ incidentCode: z.string().trim().min(1).max(80), status: statusSchema }))
  .handler(async ({ data }) => {
    await ensureAdminSeed();
    const result = await getDb().query(
      `UPDATE incidents
       SET status = $1
       WHERE incident_code = $2
       RETURNING incident_code, status`,
      [data.status, data.incidentCode],
    );
    if (result.rowCount === 0) throw new Error("Incident not found.");
    await getDb().query(
      `INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, metadata)
       SELECT $1, 'status_changed', 'incident', id, $2::jsonb
       FROM incidents WHERE incident_code = $3`,
      [ADMIN_ID, JSON.stringify({ status: data.status }), data.incidentCode],
    );
    return result.rows[0];
  });

export const getAssignmentOptions = createServerFn({ method: "GET" }).handler(async () => {
  await ensureAdminSeed();
  const [vehicles, drivers] = await Promise.all([
    getDb().query(
      `SELECT vehicle_code, registration_number, type, capacity_kg, waste_type, status
       FROM vehicles WHERE status IN ('available', 'assigned') ORDER BY vehicle_code`,
    ),
    getDb().query(
      `SELECT id, display_name, phone, status
       FROM drivers WHERE status IN ('available', 'assigned') ORDER BY display_name`,
    ),
  ]);
  return { vehicles: vehicles.rows, drivers: drivers.rows };
});

export const assignIncident = createServerFn({ method: "POST" })
  .validator(
    z.object({
      incidentCode: z.string().trim().min(1).max(80),
      vehicleCode: z.string().trim().min(1).max(80),
      driverId: z.string().uuid(),
    }),
  )
  .handler(async ({ data }) => {
    await ensureAdminSeed();
    const db = getDb();
    const client = await db.connect();
    try {
      await client.query("BEGIN");
      const incident = await client.query<{ id: string }>(
        `SELECT id FROM incidents WHERE incident_code = $1 FOR UPDATE`,
        [data.incidentCode],
      );
      const vehicle = await client.query<{ id: string }>(
        `SELECT id FROM vehicles WHERE vehicle_code = $1 FOR UPDATE`,
        [data.vehicleCode],
      );
      if (incident.rowCount === 0 || vehicle.rowCount === 0) throw new Error("Incident or vehicle not found.");

      await client.query(
        `INSERT INTO incident_assignments (incident_id, vehicle_id, driver_id, assigned_by)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (incident_id) DO UPDATE
         SET vehicle_id = EXCLUDED.vehicle_id, driver_id = EXCLUDED.driver_id,
             assigned_by = EXCLUDED.assigned_by, assigned_at = NOW()`,
        [incident.rows[0].id, vehicle.rows[0].id, data.driverId, ADMIN_ID],
      );
      await client.query(`UPDATE incidents SET status = 'assigned' WHERE id = $1`, [incident.rows[0].id]);
      await client.query(`UPDATE vehicles SET status = 'assigned', last_update = NOW() WHERE id = $1`, [
        vehicle.rows[0].id,
      ]);
      await client.query(`UPDATE drivers SET status = 'assigned' WHERE id = $1`, [data.driverId]);
      await client.query("COMMIT");
      return { incidentCode: data.incidentCode, status: "assigned" };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  });