export type Priority = "high" | "medium" | "low";

export type StatusKey =
  | "reported"
  | "related_detected"
  | "incident_created"
  | "pickup_assigned"
  | "in_progress"
  | "resolved";

export const STATUS_FLOW: { key: StatusKey; label: string }[] = [
  { key: "reported", label: "Reported" },
  { key: "related_detected", label: "Related Reports Detected" },
  { key: "incident_created", label: "Incident Created" },
  { key: "pickup_assigned", label: "Pickup Assigned" },
  { key: "in_progress", label: "In Progress" },
  { key: "resolved", label: "Resolved" },
];

export const WASTE_CATEGORIES = [
  "Wet Waste",
  "Dry Waste",
  "Mixed Waste",
  "Plastic Waste",
  "E-Waste",
  "Hazardous Waste",
  "Construction Waste",
  "Roadside Garbage",
  "Overflowing Bin",
  "Missed Collection",
  "Illegal Dumping",
  "Other",
] as const;

export type WasteCategory = (typeof WASTE_CATEGORIES)[number];

export type CitizenReport = {
  id: string;
  category: WasteCategory;
  area: string;
  approxLocation: string;
  lat: number;
  lng: number;
  time: string;
  status: string;
  evidenceTone: string;
};

export type Incident = {
  id: string;
  number: number;
  category: WasteCategory;
  area: string;
  address: string;
  lat: number;
  lng: number;
  relatedReports: number;
  confidence: number;
  priority: Priority;
  status: string;
  stage: StatusKey;
  detectedAt: string;
  reports: CitizenReport[];
};

const evidenceTones = [
  "from-emerald-200 to-emerald-400",
  "from-amber-200 to-amber-400",
  "from-slate-200 to-slate-400",
  "from-lime-200 to-lime-400",
  "from-orange-200 to-orange-400",
];

function makeReports(
  startId: number,
  count: number,
  category: WasteCategory,
  area: string,
  lat: number,
  lng: number,
): CitizenReport[] {
  const spots = [
    "Near bus stop",
    "Opposite market gate",
    "Beside drain corner",
    "Next to tea stall",
    "Behind community bin",
    "Near school wall",
    "Footpath edge",
    "Near auto stand",
    "Beside temple lane",
    "Corner of service road",
    "Near petrol pump",
    "Opposite clinic",
  ];
  const statuses = ["Verified", "Pending Review", "Clustered", "Verified", "Clustered"];
  return Array.from({ length: count }, (_, i) => {
    const hour = 7 + i;
    return {
      id: `#${startId + i}`,
      category,
      area,
      approxLocation: `${spots[i % spots.length]}, ${area}`,
      lat: Number((lat + (i % 5) * 0.0004 - 0.0008).toFixed(4)),
      lng: Number((lng + (i % 4) * 0.0005 - 0.0007).toFixed(4)),
      time: `${String(hour % 24).padStart(2, "0")}:${String((i * 13) % 60).padStart(2, "0")} today`,
      status: statuses[i % statuses.length],
      evidenceTone: evidenceTones[i % evidenceTones.length],
    };
  });
}

export const INCIDENTS: Incident[] = [
  {
    id: "104",
    number: 104,
    category: "Roadside Garbage",
    area: "Main Road",
    address: "Main Road, Kanpur",
    lat: 26.4499,
    lng: 80.3319,
    relatedReports: 10,
    confidence: 92,
    priority: "high",
    status: "Needs Pickup",
    stage: "incident_created",
    detectedAt: "Today, 14:20",
    reports: makeReports(101, 10, "Roadside Garbage", "Main Road", 26.4499, 80.3319),
  },
  {
    id: "118",
    number: 118,
    category: "Illegal Dumping",
    area: "Vijay Nagar",
    address: "Vijay Nagar, Kanpur",
    lat: 26.4831,
    lng: 80.3016,
    relatedReports: 12,
    confidence: 95,
    priority: "high",
    status: "In Progress",
    stage: "in_progress",
    detectedAt: "Today, 11:05",
    reports: makeReports(201, 12, "Illegal Dumping", "Vijay Nagar", 26.4831, 80.3016),
  },
  {
    id: "127",
    number: 127,
    category: "Overflowing Bin",
    area: "Civil Lines",
    address: "Civil Lines, Kanpur",
    lat: 26.4652,
    lng: 80.3487,
    relatedReports: 6,
    confidence: 74,
    priority: "medium",
    status: "Under Review",
    stage: "related_detected",
    detectedAt: "Today, 09:40",
    reports: makeReports(301, 6, "Overflowing Bin", "Civil Lines", 26.4652, 80.3487),
  },
  {
    id: "131",
    number: 131,
    category: "Missed Collection",
    area: "Kakadeo",
    address: "Kakadeo, Kanpur",
    lat: 26.4715,
    lng: 80.2892,
    relatedReports: 8,
    confidence: 81,
    priority: "medium",
    status: "Pickup Assigned",
    stage: "pickup_assigned",
    detectedAt: "Yesterday, 18:15",
    reports: makeReports(401, 8, "Missed Collection", "Kakadeo", 26.4715, 80.2892),
  },
  {
    id: "142",
    number: 142,
    category: "Overflowing Bin",
    area: "Govind Nagar",
    address: "Govind Nagar, Kanpur",
    lat: 26.4402,
    lng: 80.3125,
    relatedReports: 3,
    confidence: 58,
    priority: "low",
    status: "Monitoring",
    stage: "reported",
    detectedAt: "Yesterday, 08:30",
    reports: makeReports(501, 3, "Overflowing Bin", "Govind Nagar", 26.4402, 80.3125),
  },
];

export const HERO_INCIDENT = INCIDENTS[0];

export const PLATFORM_STATS = {
  totalReports: 128,
  detectedIncidents: 24,
  activeHotspots: 8,
  reportsClustered: 76,
};

export const CITIZEN_STATS = {
  ecoScore: 820,
  reportsSubmitted: 8,
  nearbyIssues: 3,
  resolvedReports: 6,
};

export type Hotspot = {
  id: string;
  area: string;
  reports: number;
  priority: Priority;
  category: WasteCategory;
  status: string;
  incidentId: string;
  /** percentage positions on the simulated map canvas */
  x: number;
  y: number;
};

export const HOTSPOTS: Hotspot[] = [
  {
    id: "h1",
    area: "Main Road",
    reports: 10,
    priority: "high",
    category: "Roadside Garbage",
    status: "Needs Pickup",
    incidentId: "104",
    x: 46,
    y: 52,
  },
  {
    id: "h2",
    area: "Vijay Nagar",
    reports: 12,
    priority: "high",
    category: "Illegal Dumping",
    status: "In Progress",
    incidentId: "118",
    x: 24,
    y: 27,
  },
  {
    id: "h3",
    area: "Civil Lines",
    reports: 6,
    priority: "medium",
    category: "Overflowing Bin",
    status: "Under Review",
    incidentId: "127",
    x: 72,
    y: 38,
  },
  {
    id: "h4",
    area: "Kakadeo",
    reports: 8,
    priority: "medium",
    category: "Missed Collection",
    status: "Pickup Assigned",
    incidentId: "131",
    x: 33,
    y: 70,
  },
  {
    id: "h5",
    area: "Govind Nagar",
    reports: 3,
    priority: "low",
    category: "Overflowing Bin",
    status: "Monitoring",
    incidentId: "142",
    x: 66,
    y: 78,
  },
];

export const MY_REPORTS: CitizenReport[] = [
  ...makeReports(101, 3, "Roadside Garbage", "Main Road", 26.4499, 80.3319),
  ...makeReports(301, 2, "Overflowing Bin", "Civil Lines", 26.4652, 80.3487),
  ...makeReports(401, 3, "Missed Collection", "Kakadeo", 26.4715, 80.2892),
];

export const CATEGORY_BREAKDOWN = [
  { category: "Roadside Garbage", reports: 48 },
  { category: "Overflowing Bin", reports: 34 },
  { category: "Missed Collection", reports: 27 },
  { category: "Illegal Dumping", reports: 19 },
];

export const WEEKLY_TREND = [
  { day: "Mon", reports: 12, incidents: 2 },
  { day: "Tue", reports: 18, incidents: 3 },
  { day: "Wed", reports: 15, incidents: 2 },
  { day: "Thu", reports: 24, incidents: 5 },
  { day: "Fri", reports: 21, incidents: 4 },
  { day: "Sat", reports: 26, incidents: 6 },
  { day: "Sun", reports: 12, incidents: 2 },
];

export const PICKUP_QUEUE = [
  {
    id: "PK-2041",
    incident: "#118",
    area: "Vijay Nagar",
    crew: "Crew A",
    eta: "Today 16:00",
    state: "In Progress",
  },
  {
    id: "PK-2042",
    incident: "#131",
    area: "Kakadeo",
    crew: "Crew C",
    eta: "Today 17:30",
    state: "Assigned",
  },
  {
    id: "PK-2043",
    incident: "#104",
    area: "Main Road",
    crew: "Unassigned",
    eta: "—",
    state: "Awaiting Assignment",
  },
  {
    id: "PK-2038",
    incident: "#096",
    area: "Swaroop Nagar",
    crew: "Crew B",
    eta: "Completed",
    state: "Resolved",
  },
];

export const POINTS_AUDIT = [
  {
    user: "Aarav Sharma",
    action: "Segregation verified",
    points: 20,
    time: "Today 12:40",
    state: "Approved",
  },
  {
    user: "Neha Verma",
    action: "Waste report verified",
    points: 15,
    time: "Today 11:12",
    state: "Approved",
  },
  {
    user: "Rohit Yadav",
    action: "Duplicate report",
    points: -5,
    time: "Today 10:05",
    state: "Adjusted",
  },
  {
    user: "Simran Kaur",
    action: "Segregation verified",
    points: 20,
    time: "Yesterday 19:22",
    state: "Approved",
  },
  {
    user: "Imran Ali",
    action: "Hotspot confirmation",
    points: 10,
    time: "Yesterday 16:48",
    state: "Pending",
  },
];

export const priorityLabel: Record<Priority, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};
