import { GeoCoordinates } from '../types';

export interface NsgProximityResult {
  insideNSG: boolean;
  distanceMeters: number;
  bearingDegrees: number;
  nsgName: string | null;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function toDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function calcBearing(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLng = toRad(lng2 - lng1);
  const y = Math.sin(dLng) * Math.cos(toRad(lat2));
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLng);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

function pointInRing(point: [number, number], ring: [number, number][]): boolean {
  const [px, py] = point;
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    const intersect =
      yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

type Ring = [number, number][];

interface GeoPolygon {
  outer: Ring;
  holes: Ring[];
}

function pointInPolygon(point: [number, number], poly: GeoPolygon): boolean {
  if (!pointInRing(point, poly.outer)) return false;
  for (const hole of poly.holes) {
    if (pointInRing(point, hole)) return false;
  }
  return true;
}

function rawRingToCoords(ring: number[][]): Ring {
  return ring.map(([lng, lat]) => [lng, lat] as [number, number]);
}

function getStructuredPolygons(geometry: any): GeoPolygon[] {
  const result: GeoPolygon[] = [];
  if (geometry.type === 'Polygon') {
    const rings: Ring[] = geometry.coordinates.map(rawRingToCoords);
    if (rings.length === 0) return result;
    result.push({ outer: rings[0], holes: rings.slice(1) });
  } else if (geometry.type === 'MultiPolygon') {
    for (const polyCoords of geometry.coordinates) {
      const rings: Ring[] = polyCoords.map(rawRingToCoords);
      if (rings.length === 0) continue;
      result.push({ outer: rings[0], holes: rings.slice(1) });
    }
  }
  return result;
}

function distanceToSegment(
  px: number, py: number,
  ax: number, ay: number,
  bx: number, by: number
): { dist: number; lat: number; lng: number } {
  const dx = bx - ax;
  const dy = by - ay;
  const lenSq = dx * dx + dy * dy;
  let t = lenSq === 0 ? 0 : ((px - ax) * dx + (py - ay) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  const closestLng = ax + t * dx;
  const closestLat = ay + t * dy;
  const dist = haversineDistance(py, px, closestLat, closestLng);
  return { dist, lat: closestLat, lng: closestLng };
}

function closestPointOnRing(
  userLng: number,
  userLat: number,
  ring: Ring
): { dist: number; lat: number; lng: number } {
  let best = { dist: Infinity, lat: 0, lng: 0 };
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [ax, ay] = ring[j];
    const [bx, by] = ring[i];
    const candidate = distanceToSegment(userLng, userLat, ax, ay, bx, by);
    if (candidate.dist < best.dist) best = candidate;
  }
  return best;
}

export function computeNsgProximity(
  userLocation: GeoCoordinates,
  geojsonData: any
): NsgProximityResult {
  const { lat, lng } = userLocation;
  const point: [number, number] = [lng, lat];

  if (!geojsonData || !geojsonData.features) {
    return { insideNSG: false, distanceMeters: Infinity, bearingDegrees: 0, nsgName: null };
  }

  let closestDist = Infinity;
  let closestBearing = 0;
  let closestName: string | null = null;

  for (const feature of geojsonData.features) {
    const name: string | null = feature.properties?.name || null;
    const polygons = getStructuredPolygons(feature.geometry);

    for (const poly of polygons) {
      if (pointInPolygon(point, poly)) {
        return { insideNSG: true, distanceMeters: 0, bearingDegrees: 0, nsgName: name };
      }
    }

    for (const poly of polygons) {
      const allRings = [poly.outer, ...poly.holes];
      for (const ring of allRings) {
        const candidate = closestPointOnRing(lng, lat, ring);
        if (candidate.dist < closestDist) {
          closestDist = candidate.dist;
          closestBearing = calcBearing(lat, lng, candidate.lat, candidate.lng);
          closestName = name;
        }
      }
    }
  }

  return {
    insideNSG: false,
    distanceMeters: closestDist,
    bearingDegrees: closestBearing,
    nsgName: closestName,
  };
}
