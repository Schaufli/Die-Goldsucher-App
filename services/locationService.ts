import { GoldLocation, CustomLayer } from '../types';
import { db, storage, auth } from './firebase';
import { collection, doc, setDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';

const DB_NAME = 'goldsucher_db';
const STORE_NAME = 'locations';
const LEGACY_STORAGE_KEY = 'goldsucher_locations';
const CUSTOM_LAYERS_KEY = 'goldsucher_custom_layers';

// Fallback color generator for legacy data migration
const stringToColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    return '#' + '00000'.substring(0, 6 - c.length) + c;
};

export const LocationService = {
  // --- Layer Management (LocalStorage) ---
  getCustomLayers: (): CustomLayer[] => {
    try {
        const stored = localStorage.getItem(CUSTOM_LAYERS_KEY);
        if (!stored) return [];
        
        const parsed = JSON.parse(stored);
        
        // Migration check: If array contains strings instead of objects
        if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'string') {
            const migrated: CustomLayer[] = parsed.map((name: string) => ({
                name,
                color: stringToColor(name)
            }));
            // Save immediately to fix storage format
            localStorage.setItem(CUSTOM_LAYERS_KEY, JSON.stringify(migrated));
            return migrated;
        }
        
        return parsed as CustomLayer[];
    } catch (e) {
        return [];
    }
  },

  addCustomLayer: (layer: CustomLayer): CustomLayer[] => {
    const current = LocationService.getCustomLayers();
    if (!current.some(l => l.name === layer.name)) {
        const updated = [...current, layer];
        localStorage.setItem(CUSTOM_LAYERS_KEY, JSON.stringify(updated));
        return updated;
    }
    return current;
  },

  removeCustomLayer: (name: string): CustomLayer[] => {
    const current = LocationService.getCustomLayers();
    const updated = current.filter(l => l.name !== name);
    localStorage.setItem(CUSTOM_LAYERS_KEY, JSON.stringify(updated));
    return updated;
  },

  updateCustomLayer: (oldName: string, layer: CustomLayer): CustomLayer[] => {
    const current = LocationService.getCustomLayers();
    const updated = current.map(l => l.name === oldName ? layer : l);
    localStorage.setItem(CUSTOM_LAYERS_KEY, JSON.stringify(updated));
    return updated;
  },
  
  // --- DB Management ---
  openDB: (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) {
          reject("Your browser doesn't support IndexedDB");
          return;
      }
      const request = indexedDB.open(DB_NAME, 1);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };
    });
  },

  getLocations: async (): Promise<GoldLocation[]> => {
    const db = await LocationService.openDB();
    
    // Legacy Migration
    const legacyData = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacyData) {
      try {
        const parsed = JSON.parse(legacyData);
        if (Array.isArray(parsed) && parsed.length > 0) {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            for (const loc of parsed) {
                if (loc.image && !loc.images) { loc.images = [loc.image]; delete loc.image; }
                if (!loc.images) loc.images = [];
                store.put(loc);
            }
            await new Promise<void>((resolve) => { tx.oncomplete = () => resolve(); });
        }
        localStorage.removeItem(LEGACY_STORAGE_KEY);
      } catch (e) { console.error("Migration failed", e); }
    }

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();
      
      tx.oncomplete = () => {
          db.close();
          resolve(request.result);
      };
      
      tx.onerror = () => {
          db.close();
          reject(tx.error);
      };
    });
  },

  syncToFirebase: async (location: GoldLocation) => {
      try {
          const user = auth.currentUser;
          if (!user) return; // Only sync if logged in

          // 1. Upload images to Storage if they are base64
          // Ensure images is an array
          const images = location.images || [];
          const imageUrls = await Promise.all(images.map(async (img, index) => {
              if (img && typeof img === 'string' && img.startsWith('data:')) {
                  const storageRef = ref(storage, `user_uploads/${user.uid}/locations/${location.id}/image_${index}_${Date.now()}`);
                  await uploadString(storageRef, img, 'data_url');
                  return await getDownloadURL(storageRef);
              }
              return img;
          }));

          // 2. Prepare clean document for Firestore (no undefined values)
          const locationToSync = {
              id: location.id,
              name: location.name || 'Unbenannter Ort',
              classification: location.classification || 'Unbekannt',
              customLayers: location.customLayers || [],
              rating: location.rating || 0,
              images: imageUrls,
              note: location.note || "",
              coordinates: {
                  lat: location.coordinates.lat,
                  lng: location.coordinates.lng
              },
              timestamp: location.timestamp || Date.now()
          };

          // 3. Store in user-specific collection
          await setDoc(doc(db, 'users', user.uid, 'locations', location.id), locationToSync);

          // 4. Update local DB with URLs to avoid re-uploading next time
          const dbLocal = await LocationService.openDB();
          const tx = dbLocal.transaction(STORE_NAME, 'readwrite');
          const store = tx.objectStore(STORE_NAME);
          store.put(locationToSync);
          await new Promise<void>((resolve) => { tx.oncomplete = () => resolve(); });
          dbLocal.close();
      } catch (e) {
          console.error("Firebase sync failed:", e);
      }
  },

  syncFromFirebase: async (): Promise<boolean> => {
      try {
          const user = auth.currentUser;
          if (!user) return false;

          const querySnapshot = await getDocs(collection(db, 'users', user.uid, 'locations'));
          if (querySnapshot.empty) return false;

          const dbLocal = await LocationService.openDB();
          return new Promise((resolve, reject) => {
              const tx = dbLocal.transaction(STORE_NAME, 'readwrite');
              const store = tx.objectStore(STORE_NAME);
              
              querySnapshot.forEach((doc) => {
                  const data = doc.data() as GoldLocation;
                  store.put(data);
              });
              
              tx.oncomplete = () => {
                  dbLocal.close();
                  resolve(true);
              };
              
              tx.onerror = () => {
                  dbLocal.close();
                  reject(tx.error);
              };
          });
      } catch (e) {
          console.error("Error syncing from Firebase:", e);
          return false;
      }
  },

  addLocation: async (location: GoldLocation): Promise<void> => {
    const db = await LocationService.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.add(location);
      
      tx.oncomplete = async () => {
          db.close();
          resolve();
          // Sync to Firebase
          await LocationService.syncToFirebase(location);
      };
      
      tx.onerror = () => {
          db.close();
          reject(tx.error);
      };
    });
  },

  updateLocation: async (location: GoldLocation): Promise<void> => {
    const db = await LocationService.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put(location);
      
      tx.oncomplete = async () => {
          db.close();
          resolve();
          // Sync to Firebase
          await LocationService.syncToFirebase(location);
      };
      
      tx.onerror = () => {
          db.close();
          reject(tx.error);
      };
    });
  },

  syncAllToFirebase: async (): Promise<void> => {
    try {
        const user = auth.currentUser;
        if (!user) return;

        const locations = await LocationService.getLocations();
        for (const loc of locations) {
            await LocationService.syncToFirebase(loc);
        }
    } catch (e) {
        console.error("Sync all failed", e);
    }
  },

  deleteLocation: async (id: string): Promise<void> => {
    const idb = await LocationService.openDB();
    return new Promise((resolve, reject) => {
      const tx = idb.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.delete(id);
      
      tx.oncomplete = () => {
          idb.close();
          resolve();
          // Delete from Firebase
          const user = auth.currentUser;
          if (user) {
            deleteDoc(doc(db, 'users', user.uid, 'locations', id)).catch(console.error);
          }
      };
      
      tx.onerror = () => {
          idb.close();
          reject(tx.error);
      };
    });
  },

  convertFileToBase64: (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
           const canvas = document.createElement('canvas');
           let width = img.width;
           let height = img.height;
           const MAX_SIZE = 1024;
           if (width > height) {
               if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; }
           } else {
               if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; }
           }
           canvas.width = width;
           canvas.height = height;
           const ctx = canvas.getContext('2d');
           if (!ctx) { reject(new Error("Could not get canvas context")); return; }
           ctx.drawImage(img, 0, 0, width, height);
           resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.onerror = () => reject(new Error("Image load failed"));
        img.src = event.target?.result as string;
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  },

  exportData: async (): Promise<void> => {
    try {
        const locations = await LocationService.getLocations();
        const customLayers = LocationService.getCustomLayers();
        
        const data = {
            version: 1,
            timestamp: new Date().toISOString(),
            locations,
            customLayers
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `goldsucher_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Export failed:", error);
        throw new Error("Export fehlgeschlagen");
    }
  },

  importData: async (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const content = e.target?.result as string;
                const data = JSON.parse(content);
                
                // Basic validation
                if (!data.locations || !Array.isArray(data.locations)) {
                    throw new Error("Ungültiges Dateiformat: Keine Orte gefunden");
                }

                // Import Custom Layers
                if (data.customLayers && Array.isArray(data.customLayers)) {
                    const currentLayers = LocationService.getCustomLayers();
                    const newLayers = data.customLayers.filter((l: CustomLayer) => 
                        !currentLayers.some(cl => cl.name === l.name)
                    );
                    if (newLayers.length > 0) {
                        const updated = [...currentLayers, ...newLayers];
                        localStorage.setItem(CUSTOM_LAYERS_KEY, JSON.stringify(updated));
                    }
                }

                // Import Locations (Upsert)
                const db = await LocationService.openDB();
                const tx = db.transaction(STORE_NAME, 'readwrite');
                const store = tx.objectStore(STORE_NAME);

                // We use put to update existing or add new
                for (const loc of data.locations) {
                    store.put(loc);
                }

                tx.oncomplete = () => resolve();
                tx.onerror = () => reject(tx.error);

            } catch (error) {
                console.error("Import failed:", error);
                reject(error instanceof Error ? error : new Error("Import fehlgeschlagen"));
            }
        };
        reader.onerror = () => reject(new Error("Fehler beim Lesen der Datei"));
        reader.readAsText(file);
    });
  }
};