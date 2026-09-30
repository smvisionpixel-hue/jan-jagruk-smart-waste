CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'citizen' CHECK (role IN ('citizen', 'admin', 'driver')),
  eco_points INTEGER NOT NULL DEFAULT 0 CHECK (eco_points >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_code TEXT NOT NULL UNIQUE,
  user_id TEXT NOT NULL REFERENCES profiles(id),
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  landmark TEXT,
  latitude DOUBLE PRECISION NOT NULL CHECK (latitude BETWEEN -90 AND 90),
  longitude DOUBLE PRECISION NOT NULL CHECK (longitude BETWEEN -180 AND 180),
  photo_data_url TEXT,
  status TEXT NOT NULL DEFAULT 'reported',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_code TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  severity TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  report_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'detected',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS incident_reports (
  incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  PRIMARY KEY (incident_id, report_id)
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES profiles(id),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name TEXT NOT NULL,
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'assigned', 'offline')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_code TEXT NOT NULL UNIQUE,
  registration_number TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL,
  capacity_kg INTEGER NOT NULL CHECK (capacity_kg > 0),
  waste_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'assigned', 'en_route', 'collecting', 'full', 'maintenance', 'offline')),
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  last_update TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS incident_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL UNIQUE REFERENCES incidents(id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES vehicles(id),
  driver_id UUID NOT NULL REFERENCES drivers(id),
  assigned_by TEXT NOT NULL,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS reports_user_created_idx ON reports(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS reports_category_created_idx ON reports(category, created_at DESC);
CREATE INDEX IF NOT EXISTS reports_coordinates_idx ON reports(latitude, longitude);
CREATE INDEX IF NOT EXISTS incidents_status_created_idx ON incidents(status, created_at DESC);
CREATE INDEX IF NOT EXISTS incident_assignments_driver_idx ON incident_assignments(driver_id);

INSERT INTO app_settings (key, value)
VALUES ('incident_detection', '{"threshold": 10, "radiusMeters": 100, "windowHours": 24}'::jsonb)
ON CONFLICT (key) DO NOTHING;

INSERT INTO drivers (display_name, phone, status)
SELECT 'Ravi Kumar', '+91 90000 10001', 'available'
WHERE NOT EXISTS (SELECT 1 FROM drivers WHERE display_name = 'Ravi Kumar');

INSERT INTO drivers (display_name, phone, status)
SELECT 'Meena Devi', '+91 90000 10002', 'available'
WHERE NOT EXISTS (SELECT 1 FROM drivers WHERE display_name = 'Meena Devi');

INSERT INTO vehicles (vehicle_code, registration_number, type, capacity_kg, waste_type, status, latitude, longitude)
VALUES
  ('JJ-VAN-01', 'UP78-WM-0101', 'Mini compactor', 1200, 'Mixed Waste', 'available', 26.4512, 80.3294),
  ('JJ-VAN-02', 'UP78-WM-0102', 'Electric tipper', 800, 'Dry Waste', 'available', 26.4652, 80.3487)
ON CONFLICT (vehicle_code) DO NOTHING;