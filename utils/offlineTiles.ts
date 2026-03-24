type TileCoord = { z: number; x: number; y: number };

function latLngToTile(lat: number, lng: number, zoom: number): { x: number; y: number } {
  const n = Math.pow(2, zoom);
  const x = Math.floor(((lng + 180) / 360) * n);
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n);
  return { x: Math.max(0, Math.min(n - 1, x)), y: Math.max(0, Math.min(n - 1, y)) };
}

export function getTilesForBounds(
  bounds: { north: number; south: number; east: number; west: number },
  minZoom: number,
  maxZoom: number
): TileCoord[] {
  const tiles: TileCoord[] = [];
  for (let z = minZoom; z <= maxZoom; z++) {
    const topLeft = latLngToTile(bounds.north, bounds.west, z);
    const bottomRight = latLngToTile(bounds.south, bounds.east, z);
    for (let x = topLeft.x; x <= bottomRight.x; x++) {
      for (let y = topLeft.y; y <= bottomRight.y; y++) {
        tiles.push({ z, x, y });
      }
    }
  }
  return tiles;
}

const TILE_URLS: Record<string, (t: TileCoord) => string> = {
  satellite: (t) => `https://mt${t.x % 4}.google.com/vt/lyrs=y&hl=de&x=${t.x}&y=${t.y}&z=${t.z}`,
  terrain: (t) => {
    const s = ['a', 'b', 'c'][t.x % 3];
    return `https://${s}.tile.opentopomap.org/${t.z}/${t.x}/${t.y}.png`;
  },
  hillshade_osm: (t) => {
    const s = ['a', 'b', 'c'][t.x % 3];
    return `https://${s}.tile.openstreetmap.org/${t.z}/${t.x}/${t.y}.png`;
  },
  hillshade_esri: (t) => `https://server.arcgisonline.com/ArcGIS/rest/services/World_Hillshade/MapServer/tile/${t.z}/${t.y}/${t.x}`,
};

export async function downloadTilesForArea(
  bounds: { north: number; south: number; east: number; west: number },
  currentZoom: number,
  mapType: string,
  onProgress: (done: number, total: number) => void
): Promise<{ downloaded: number; failed: number }> {
  const minZ = Math.max(1, currentZoom - 2);
  const maxZ = Math.min(currentZoom + 1, mapType === 'terrain' ? 17 : 20);
  const tiles = getTilesForBounds(bounds, minZ, maxZ);

  const urlGenerators: ((t: TileCoord) => string)[] = [];
  if (mapType === 'satellite') {
    urlGenerators.push(TILE_URLS.satellite);
  } else if (mapType === 'terrain') {
    urlGenerators.push(TILE_URLS.terrain);
  } else {
    urlGenerators.push(TILE_URLS.hillshade_osm);
    urlGenerators.push(TILE_URLS.hillshade_esri);
  }

  const allUrls: string[] = [];
  for (const gen of urlGenerators) {
    for (const tile of tiles) {
      allUrls.push(gen(tile));
    }
  }

  let downloaded = 0;
  let failed = 0;
  const batchSize = 6;

  for (let i = 0; i < allUrls.length; i += batchSize) {
    const batch = allUrls.slice(i, i + batchSize);
    const results = await Promise.allSettled(
      batch.map(url => fetch(url, { mode: 'no-cors' }))
    );
    results.forEach(r => {
      if (r.status === 'fulfilled') downloaded++;
      else failed++;
    });
    onProgress(downloaded + failed, allUrls.length);
  }

  return { downloaded, failed };
}
