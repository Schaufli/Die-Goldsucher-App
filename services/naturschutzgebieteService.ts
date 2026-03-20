const DB_NAME = 'goldsucher-naturschutz';
const DB_VERSION = 1;
const STORE_NAME = 'geojson';
const DATA_KEY = 'naturschutzgebiete';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getCached(): Promise<any | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(DATA_KEY);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

async function setCached(data: any): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(data, DATA_KEY);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // silently fail caching
  }
}

export async function loadNaturschutzgebiete(): Promise<any> {
  const cached = await getCached();
  if (cached) {
    return cached;
  }

  const response = await fetch('/data/naturschutzgebiete.json');
  if (!response.ok) {
    throw new Error('Failed to load Naturschutzgebiete data');
  }
  const data = await response.json();

  await setCached(data);

  return data;
}

const NP_CACHE_KEY = 'nationalparks';

async function getNpCached(): Promise<any | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(NP_CACHE_KEY);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

async function setNpCached(data: any): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(data, NP_CACHE_KEY);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
  }
}

export async function loadNationalparks(): Promise<any> {
  const cached = await getNpCached();
  if (cached) return cached;

  const response = await fetch('/data/nationalparks.json');
  if (!response.ok) throw new Error('Failed to load Nationalparks data');
  const data = await response.json();
  await setNpCached(data);
  return data;
}