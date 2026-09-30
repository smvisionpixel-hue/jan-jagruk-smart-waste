import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

export type LiveMapPoint = {
  id: string;
  latitude: number;
  longitude: number;
  label: string;
  detail?: string;
  tone?: "primary" | "warning" | "danger";
};

const tones = {
  primary: "#159447",
  warning: "#d99a13",
  danger: "#d64b3c",
};

export function LeafletMap({
  points,
  className = "h-80",
  center = [26.4499, 80.3319],
}: {
  points: LiveMapPoint[];
  className?: string;
  center?: [number, number];
}) {
  const mapElement = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let disposed = false;
    let map: import("leaflet").Map | undefined;

    import("leaflet").then((L) => {
      if (disposed || !mapElement.current) return;
      map = L.map(mapElement.current, { zoomControl: true }).setView(center, 13);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);

      points.forEach((point) => {
        const marker = L.circleMarker([point.latitude, point.longitude], {
          radius: point.tone === "danger" ? 10 : 8,
          color: "#ffffff",
          weight: 2,
          fillColor: tones[point.tone ?? "primary"],
          fillOpacity: 0.9,
        }).addTo(map);
        marker.bindPopup(
          `<strong>${point.label}</strong>${point.detail ? `<br/><span>${point.detail}</span>` : ""}`,
        );
      });

      if (points.length > 1) {
        map.fitBounds(points.map((point) => [point.latitude, point.longitude] as [number, number]), {
          padding: [24, 24],
          maxZoom: 14,
        });
      }
    });

    return () => {
      disposed = true;
      map?.remove();
    };
  }, [center, points]);

  return <div ref={mapElement} className={`overflow-hidden rounded-2xl border ${className}`} />;
}