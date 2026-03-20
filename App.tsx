import React, { useState, useEffect, useMemo } from 'react';
import { Map, Plus, Layers, Globe, ClipboardList, X, CheckCircle, NotebookTabs, Settings, User as UserIcon, Mountain, History, LocateFixed, Locate, Menu, TreePine } from 'lucide-react';
import { loadNaturschutzgebiete } from './services/naturschutzgebieteService';
import { MapView } from './components/Map/MapView';
import { NsgProximityInfo } from './components/Map/NsgProximityInfo';
import { computeNsgProximity, NsgProximityResult } from './utils/nsgProximity';
import { LocationWizard } from './components/AddLocation/LocationWizard';
import { Paywall } from './components/UI/Paywall';
import { LocationDrawer } from './components/LocationDetail/LocationDrawer';
import { LayerDrawer } from './components/Map/LayerDrawer';
import { TodoDrawer } from './components/Todo/TodoDrawer';
import { LocationListDrawer } from './components/LocationList/LocationListDrawer';
import { SettingsDrawer } from './components/Settings/SettingsDrawer';
import { AuthDrawer } from './components/Settings/AuthDrawer';
import { useGeoLocation } from './hooks/useGeoLocation';
import { LocationService } from './services/locationService';
import { AuthService } from './services/authService';
import { BillingService } from './services/billingService';
import { TutorialView } from './components/Tutorial/TutorialView';
import { GoldLocation, GeoCoordinates, Classification, PresetLayers, CustomLayer } from './types';
import { CLASSIFICATION_COLORS, DEFAULT_COORDINATES } from './constants';
import { User } from 'firebase/auth';

export default function App() {
  const [view, setView] = useState<'map' | 'add'>('map');
  const { coordinates, loading: geoLoading, error: geoError } = useGeoLocation();
  
  const [locations, setLocations] = useState<GoldLocation[]>([]);
  const [manualCoordinates, setManualCoordinates] = useState<GeoCoordinates | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<GoldLocation | null>(null);
  const [flyToCoordinates, setFlyToCoordinates] = useState<GeoCoordinates | null>(null);

  // --- Auth State ---
  const [user, setUser] = useState<User | null>(null);
  const [isAuthDrawerOpen, setIsAuthDrawerOpen] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  // --- First-launch Tutorial ---
  const [showFirstTimeTutorial, setShowFirstTimeTutorial] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem('goldsucher_tutorial_seen');
    if (!seen) {
      const t = setTimeout(() => setShowFirstTimeTutorial(true), 600);
      return () => clearTimeout(t);
    }
  }, []);

  const handleFirstTimeTutorialClose = () => {
    localStorage.setItem('goldsucher_tutorial_seen', '1');
    setShowFirstTimeTutorial(false);
  };

  // --- Layer Management State ---
  const [isLayerDrawerOpen, setIsLayerDrawerOpen] = useState(false);
  
  // --- Todo Drawer State ---
  const [isTodoDrawerOpen, setIsTodoDrawerOpen] = useState(false);

  // --- Location List Drawer State ---
  const [isLocationListOpen, setIsLocationListOpen] = useState(false);

  // --- Settings Drawer State ---
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // --- FAB & Add Location State ---
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [pendingClassification, setPendingClassification] = useState<Classification | null>(null);

  // Custom Layers State (Objects with Name & Color)
  const [customLayers, setCustomLayers] = useState<CustomLayer[]>([]);
  
  const availableLayers = useMemo(() => [
      PresetLayers.INTERESSANT,
      PresetLayers.NICHT_GOLDHOEFFIG,
      PresetLayers.GOLDHOEFFIG,
      ...customLayers.map(l => l.name)
  ], [customLayers]);

  // Create a map of "LayerName -> Color" for the whole app to use
  const layerColors = useMemo(() => {
      const colors: Record<string, string> = { ...CLASSIFICATION_COLORS };
      customLayers.forEach(l => {
          colors[l.name] = l.color;
      });
      return colors;
  }, [customLayers]);

  const [visibleLayers, setVisibleLayers] = useState<Classification[]>([]);
  const [filterLogic, setFilterLogic] = useState<'OR' | 'AND'>('OR');

  // Initialize visible layers once availableLayers is stable (or initially)
  useEffect(() => {
     if (visibleLayers.length === 0) {
         const storedLayers = LocationService.getCustomLayers();
         setVisibleLayers([
             PresetLayers.INTERESSANT,
             PresetLayers.NICHT_GOLDHOEFFIG,
             PresetLayers.GOLDHOEFFIG,
             ...storedLayers.map(l => l.name)
         ]);
     }
  }, []);

  const [mapType, setMapType] = useState<'satellite' | 'terrain' | 'hillshade'>('satellite');
  const [isFollowingUser, setIsFollowingUser] = useState(false);
  const [isLeftMenuOpen, setIsLeftMenuOpen] = useState(false);
  const [isRightMenuOpen, setIsRightMenuOpen] = useState(false);

  const [showNaturschutzgebiete, setShowNaturschutzgebiete] = useState(false);
  const [naturschutzgebieteData, setNaturschutzgebieteData] = useState<any>(null);
  const [naturschutzLoading, setNaturschutzLoading] = useState(false);

  const [nsgProximity, setNsgProximity] = useState<NsgProximityResult | null>(null);
  const [nsgLoading, setNsgLoading] = useState(false);

  // Helper for dynamic app title
  const getAppTitle = (currentUser: User | null) => {
      if (!currentUser || !currentUser.displayName) return "Die Goldsucher App";
      const name = currentUser.displayName;
      // German grammar: if name ends in s, ß, x, or z, append an apostrophe, otherwise append 's
      const endsWithSibilant = /[sßxz]$/i.test(name);
      const possessive = endsWithSibilant ? `${name}'` : `${name}s`;
      return `${possessive} Goldkarte`;
  };

  // Auth Listener
  useEffect(() => {
      const unsubscribe = AuthService.subscribeToAuth(async (currentUser) => {
          setUser(currentUser);
          if (currentUser) {
              // Check trial/subscription status
              const hasAccess = await BillingService.checkSubscriptionStatus(currentUser.uid);
              
              if (!hasAccess) {
                  setShowPaywall(true);
              } else {
                  setShowPaywall(false);
                  // Trigger sync when user logs in and has access
                  await LocationService.syncAllToFirebase(); // Push local to cloud
                  const hasUpdates = await LocationService.syncFromFirebase(); // Pull cloud to local
                  if (hasUpdates) {
                      const updatedData = await LocationService.getLocations();
                      setLocations(updatedData);
                  }
              }
          } else {
              setShowPaywall(false);
          }
      });
      return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isFollowingUser) {
      setNsgProximity(null);
      setNsgLoading(false);
      return;
    }

    const locationForNsg = coordinates || DEFAULT_COORDINATES;
    let cancelled = false;

    const compute = async () => {
      let data = naturschutzgebieteData;
      if (!data) {
        setNsgLoading(true);
        try {
          data = await loadNaturschutzgebiete();
          if (!cancelled) setNaturschutzgebieteData(data);
        } catch (e) {
          console.error('Failed to load NSG data for proximity check', e);
          if (!cancelled) setNsgLoading(false);
          return;
        }
      }
      if (!cancelled) {
        const result = computeNsgProximity(locationForNsg, data);
        setNsgProximity(result);
        setNsgLoading(false);
      }
    };

    compute();

    return () => { cancelled = true; };
  }, [isFollowingUser, coordinates, naturschutzgebieteData]);

  const handleToggleNaturschutzgebiete = async () => {
    const newVal = !showNaturschutzgebiete;
    setShowNaturschutzgebiete(newVal);
    if (newVal && !naturschutzgebieteData) {
      setNaturschutzLoading(true);
      try {
        const data = await loadNaturschutzgebiete();
        setNaturschutzgebieteData(data);
      } catch (e) {
        console.error('Failed to load Naturschutzgebiete', e);
      } finally {
        setNaturschutzLoading(false);
      }
    }
  };

  // Load data on startup
  useEffect(() => {
    const loadData = async () => {
        try {
            // 1. Load local data immediately
            const localData = await LocationService.getLocations();
            setLocations(localData);
            
            // Load custom layers
            const loadedLayers = LocationService.getCustomLayers();
            setCustomLayers(loadedLayers);

            // 2. Background Sync from Firebase (if user is already logged in or persisted)
            if (AuthService.getCurrentUser()) {
                const hasUpdates = await LocationService.syncFromFirebase();
                if (hasUpdates) {
                    const updatedData = await LocationService.getLocations();
                    setLocations(updatedData);
                }
            }
        } catch (e) {
            console.error("Failed to load data", e);
        }
    };
    loadData();
  }, []);

  const filteredLocations = useMemo(() => {
    if (visibleLayers.length === 0) return [];
    return locations.filter(loc => {
        if (filterLogic === 'OR') {
            if (visibleLayers.includes(loc.classification)) return true;
            if (loc.customLayers && loc.customLayers.some(layer => visibleLayers.includes(layer))) return true;
            return false;
        } else {
            // AND logic: Location must match ALL selected layers
            return visibleLayers.every(layer => 
                loc.classification === layer || (loc.customLayers && loc.customLayers.includes(layer))
            );
        }
    });
  }, [locations, visibleLayers, filterLogic]);

  const toggleLayer = (layer: Classification) => {
    setVisibleLayers(prev => {
      if (prev.includes(layer)) return prev.filter(l => l !== layer);
      return [...prev, layer];
    });
  };

  const handleAddCustomLayer = (layer: CustomLayer) => {
      const updated = LocationService.addCustomLayer(layer);
      setCustomLayers(updated);
      // Automatically make new layer visible
      setVisibleLayers(prev => [...prev, layer.name]);
  };

  const handleAddLocation = async (newLocation: GoldLocation) => {
    try {
        await LocationService.addLocation(newLocation);
        setLocations(prev => [...prev, newLocation]);
        
        if (!visibleLayers.includes(newLocation.classification)) {
            setVisibleLayers(prev => [...prev, newLocation.classification]);
        }

        setView('map');
        setManualCoordinates(null);
        setPendingClassification(null);
    } catch (e) {
        alert("Fehler beim Speichern des Ortes.");
    }
  };

  const handleUpdateLocation = async (updatedLocation: GoldLocation) => {
      try {
          await LocationService.updateLocation(updatedLocation);
          setLocations(prev => prev.map(loc => loc.id === updatedLocation.id ? updatedLocation : loc));
          setSelectedLocation(updatedLocation); 
      } catch (e) {
          alert("Fehler beim Aktualisieren.");
      }
  };

  const handleDeleteLocation = async (id: string) => {
      try {
          await LocationService.deleteLocation(id);
          setLocations(prev => prev.filter(loc => loc.id !== id));
          setSelectedLocation(null);
      } catch (e) {
          alert("Fehler beim Löschen des Ortes.");
      }
  };

  const handleFabClick = () => {
    if (pendingClassification) {
        // If in selection mode, cancel it
        setPendingClassification(null);
    } else {
        setIsFabOpen(!isFabOpen);
        setIsLeftMenuOpen(false);
        setIsRightMenuOpen(false);
    }
  };

  const handleLeftMenuClick = () => {
    setIsLeftMenuOpen(!isLeftMenuOpen);
    setIsFabOpen(false);
    setIsRightMenuOpen(false);
  };

  const handleRightMenuClick = () => {
    setIsRightMenuOpen(!isRightMenuOpen);
    setIsFabOpen(false);
    setIsLeftMenuOpen(false);
  };

  const handleFabOptionClick = (classification: Classification) => {
      setPendingClassification(classification);
      setIsFabOpen(false);
  };

  const handleLocationListSelect = (loc: GoldLocation) => {
      setIsLocationListOpen(false);
      setSelectedLocation(loc);
      setFlyToCoordinates({ ...loc.coordinates });
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-brand-bg overflow-hidden">
      {showPaywall && (
        <Paywall onSubscribeSuccess={() => setShowPaywall(false)} />
      )}

      {showFirstTimeTutorial && (
        <div className="fixed inset-0 z-[2000] flex flex-col bg-brand-bg animate-fade-in">
          {/* Header */}
          <div className="h-16 bg-brand-accent flex items-center justify-between px-4 shrink-0 shadow-md">
            <div className="flex items-center gap-2 text-white font-bold text-lg">
              <Map className="w-6 h-6 text-brand-gold" />
              <span>Tutorial</span>
            </div>
            <button
              onClick={handleFirstTimeTutorialClose}
              className="text-white p-2 hover:bg-white/10 rounded-full transition-colors"
              aria-label="Tutorial überspringen"
            >
              <X size={24} />
            </button>
          </div>
          {/* Tutorial content */}
          <div className="flex-1 overflow-hidden flex flex-col p-4">
            <TutorialView onClose={handleFirstTimeTutorialClose} />
          </div>
        </div>
      )}
      
      <header className="bg-brand-accent flex items-center justify-between px-4 py-2 shadow-md z-50 shrink-0 min-h-[64px]">
        <div className="w-10 flex items-center justify-center">
            <button 
                onClick={() => setIsSettingsOpen(true)}
                className="text-white p-2 hover:bg-white/10 rounded-full transition-colors"
                aria-label="Einstellungen"
            >
                <Settings size={24} />
            </button>
        </div>
        <div className="flex flex-col items-center justify-center">
            <h1 className="text-white text-lg font-bold tracking-wide flex items-center gap-2">
              <Map className="w-5 h-5 text-brand-gold" />
              <span>{getAppTitle(user)}</span>
            </h1>
            <p className="text-[10px] text-gray-300 font-medium mt-0.5 text-center leading-tight">
              {pendingClassification 
                ? `Kategorie gewählt: ${pendingClassification}` 
                : "Tippe auf + oder die Karte um einen Ort hinzuzufügen"}
            </p>
        </div>
        <div className="w-10 flex items-center justify-center">
             <button 
                onClick={() => setIsAuthDrawerOpen(true)}
                className="text-white p-2 hover:bg-white/10 rounded-full transition-colors relative"
                aria-label="Profil"
            >
                {user ? (
                    user.photoURL ? (
                        <img src={user.photoURL} alt="Profil" className="w-6 h-6 rounded-full border border-brand-gold" />
                    ) : (
                        <div className="w-6 h-6 rounded-full bg-brand-gold flex items-center justify-center text-brand-text font-bold text-xs">
                            {user.email?.charAt(0).toUpperCase()}
                        </div>
                    )
                ) : (
                    <UserIcon size={24} />
                )}
            </button>
        </div>
      </header>
      <main className="flex-1 relative overflow-hidden w-full flex flex-col">
        <MapView 
            userLocation={coordinates} 
            locations={filteredLocations} 
            geoLoading={geoLoading}
            geoError={geoError}
            onLocationSelect={(coords) => {
                if (!selectedLocation && !isLayerDrawerOpen && !isTodoDrawerOpen && !isLocationListOpen && !isSettingsOpen && !isAuthDrawerOpen) {
                    setManualCoordinates(coords);
                    setView('add');
                }
            }}
            onMarkerClick={(loc) => {
                setSelectedLocation(loc);
                setFlyToCoordinates({ ...loc.coordinates });
            }}
            onMapInteraction={() => {
                setFlyToCoordinates(null);
            }}
            mapType={mapType}
            layerColors={layerColors}
            flyToCoordinates={flyToCoordinates}
            isFollowingUser={isFollowingUser}
            setIsFollowingUser={setIsFollowingUser}
            showNaturschutzgebiete={showNaturschutzgebiete}
            naturschutzgebieteData={naturschutzgebieteData}
        />
        
        {/* Selection Mode Banner */}
        {pendingClassification && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[800] bg-brand-accent text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3 animate-fade-in">
                <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: layerColors[pendingClassification] || '#fff' }}
                />
                <span className="font-bold text-sm">Tippe auf die Karte</span>
                <button 
                    onClick={() => setPendingClassification(null)}
                    className="ml-2 bg-white/20 rounded-full p-1 hover:bg-white/30"
                >
                    <X size={14} />
                </button>
            </div>
        )}
        
        <LayerDrawer 
            isOpen={isLayerDrawerOpen} 
            onOpen={() => setIsLayerDrawerOpen(true)}
            onClose={() => setIsLayerDrawerOpen(false)}
            availableLayers={availableLayers}
            visibleLayers={visibleLayers}
            onToggleLayer={toggleLayer}
            onAddLayer={handleAddCustomLayer}
            layerColors={layerColors}
            filterLogic={filterLogic}
            onToggleFilterLogic={() => setFilterLogic(prev => prev === 'OR' ? 'AND' : 'OR')}
        />

        <TodoDrawer 
            isOpen={isTodoDrawerOpen} 
            onClose={() => setIsTodoDrawerOpen(false)} 
        />

        <LocationListDrawer
            isOpen={isLocationListOpen}
            onClose={() => setIsLocationListOpen(false)}
            locations={locations}
            onSelectLocation={handleLocationListSelect}
            availableLayers={availableLayers}
            layerColors={layerColors}
        />

        <AuthDrawer 
            isOpen={isAuthDrawerOpen}
            onClose={() => setIsAuthDrawerOpen(false)}
            user={user}
        />

        {selectedLocation && (
            <div 
                className="absolute inset-0 z-[900]" 
                onClick={() => {
                    setSelectedLocation(null);
                    setFlyToCoordinates(null);
                }}
            />
        )}
        
        <LocationDrawer 
            location={selectedLocation} 
            onClose={() => {
                setSelectedLocation(null);
                setFlyToCoordinates(null);
            }} 
            onUpdate={handleUpdateLocation}
            onDelete={handleDeleteLocation}
            layerColors={layerColors}
            availableLayers={availableLayers}
        />

        {view === 'add' && (
          <div className="absolute inset-0 z-[1000]">
            <LocationWizard 
              currentLocation={manualCoordinates || coordinates} 
              availableLayers={availableLayers}
              initialClassification={pendingClassification}
              onSave={handleAddLocation} 
              onCancel={() => {
                  setView('map');
                  setManualCoordinates(null);
                  setPendingClassification(null);
              }} 
            />
          </div>
        )}
      </main>

      <NsgProximityInfo result={nsgProximity} visible={isFollowingUser && !selectedLocation && !isLayerDrawerOpen && !isTodoDrawerOpen && !isLocationListOpen && !isSettingsOpen && !isAuthDrawerOpen && view === 'map'} loading={nsgLoading} />

      <SettingsDrawer 
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          onOpenProfile={() => setIsAuthDrawerOpen(true)}
      />

      {view === 'map' && !selectedLocation && !isLayerDrawerOpen && !isTodoDrawerOpen && !isLocationListOpen && !isSettingsOpen && !isAuthDrawerOpen && (
        <>
            {/* Follow User Toggle - Top Right */}
            <button
                onClick={(e) => { e.stopPropagation(); setIsFollowingUser(!isFollowingUser); }}
                className={`fixed top-20 right-4 p-3 rounded-full shadow-lg transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center border border-gray-200 ${
                    isFollowingUser ? 'bg-brand-gold text-brand-text' : 'bg-white text-brand-textSec'
                }`}
                style={{ zIndex: 9999 }}
                aria-label={isFollowingUser ? "Standort folgen beenden" : "Meinem Standort folgen"}
            >
                {isFollowingUser ? <LocateFixed size={24} /> : <Locate size={24} />}
            </button>

            {/* Left Menu - Bottom Left */}
            <div className="absolute bottom-8 left-6 z-40 flex flex-col items-center gap-3">
                {isLeftMenuOpen && (
                    <div className="flex flex-col gap-3 animate-slide-up mb-2">
                        <button
                            onClick={() => { setIsLocationListOpen(true); setIsLeftMenuOpen(false); }}
                            className="bg-white text-brand-text p-3 rounded-full shadow-lg border border-gray-200 flex items-center gap-2 hover:bg-gray-50 active:scale-95 transition-all"
                            aria-label="Fundort-Liste"
                        >
                            <NotebookTabs className="w-6 h-6 text-brand-textSec" />
                            <span className="font-bold text-sm pr-2">Orte</span>
                        </button>
                        <button
                            onClick={() => { setIsLayerDrawerOpen(true); setIsLeftMenuOpen(false); }}
                            className="bg-white text-brand-text p-3 rounded-full shadow-lg border border-gray-200 flex items-center gap-2 hover:bg-gray-50 active:scale-95 transition-all"
                            aria-label="Ebenen-Menü"
                        >
                            <Layers className="w-6 h-6 text-brand-textSec" />
                            <span className="font-bold text-sm pr-2">Ebenen</span>
                        </button>
                        <button
                            onClick={() => { setIsTodoDrawerOpen(true); setIsLeftMenuOpen(false); }}
                            className="bg-white text-brand-text p-3 rounded-full shadow-lg border border-gray-200 flex items-center gap-2 hover:bg-gray-50 active:scale-95 transition-all"
                            aria-label="Aufgabenliste"
                        >
                            <ClipboardList className="w-6 h-6 text-brand-textSec" />
                            <span className="font-bold text-sm pr-2">To-Do</span>
                        </button>
                    </div>
                )}
                <button
                    onClick={handleLeftMenuClick}
                    className={`p-3 rounded-full shadow-lg transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center border border-gray-200 ${isLeftMenuOpen ? 'bg-brand-accent text-white' : 'bg-white text-brand-textSec'}`}
                    aria-label="Menü öffnen"
                >
                    {isLeftMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Right Menu - Bottom Right */}
            <div className="absolute bottom-8 right-6 z-40 flex flex-col items-center gap-3">
                {isRightMenuOpen && (
                    <div className="flex flex-col gap-3 animate-slide-up mb-2">
                        <button
                            onClick={() => { setMapType('satellite'); setIsRightMenuOpen(false); }}
                            className={`p-3 rounded-full shadow-lg border border-gray-200 flex items-center gap-2 hover:bg-gray-50 active:scale-95 transition-all ${mapType === 'satellite' ? 'bg-brand-gold text-brand-text' : 'bg-white text-brand-textSec'}`}
                        >
                            <Globe className="w-6 h-6" />
                            <span className="font-bold text-sm pr-2">Satellit</span>
                        </button>
                        <button
                            onClick={() => { setMapType('terrain'); setIsRightMenuOpen(false); }}
                            className={`p-3 rounded-full shadow-lg border border-gray-200 flex items-center gap-2 hover:bg-gray-50 active:scale-95 transition-all ${mapType === 'terrain' ? 'bg-brand-gold text-brand-text' : 'bg-white text-brand-textSec'}`}
                        >
                            <Mountain className="w-6 h-6" />
                            <span className="font-bold text-sm pr-2">Gelände</span>
                        </button>
                        <button
                            onClick={() => { setMapType('hillshade'); setIsRightMenuOpen(false); }}
                            className={`p-3 rounded-full shadow-lg border border-gray-200 flex items-center gap-2 hover:bg-gray-50 active:scale-95 transition-all ${mapType === 'hillshade' ? 'bg-brand-gold text-brand-text' : 'bg-white text-brand-textSec'}`}
                        >
                            <Layers className="w-6 h-6" />
                            <span className="font-bold text-sm pr-2">Standard</span>
                        </button>
                        <div className="w-full h-px bg-gray-300 my-1"></div>
                        <button
                            onClick={() => { handleToggleNaturschutzgebiete(); setIsRightMenuOpen(false); }}
                            className={`p-3 rounded-full shadow-lg border border-gray-200 flex items-center gap-2 hover:bg-gray-50 active:scale-95 transition-all ${showNaturschutzgebiete ? 'bg-green-600 text-white' : 'bg-white text-brand-textSec'}`}
                        >
                            <TreePine className="w-6 h-6" />
                            <span className="font-bold text-sm pr-2 whitespace-nowrap">{naturschutzLoading ? 'Laden...' : 'Naturschutz'}</span>
                        </button>
                    </div>
                )}
                <button
                    onClick={handleRightMenuClick}
                    className={`p-3 rounded-full shadow-lg transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center border border-gray-200 ${isRightMenuOpen ? 'bg-brand-accent text-white' : 'bg-white text-brand-textSec'}`}
                    aria-label="Kartenmenü öffnen"
                >
                    {isRightMenuOpen ? <X size={24} /> : <Layers size={24} />}
                </button>
            </div>

            {/* FAB Menu Items */}
            {isFabOpen && (
                <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-40 flex flex-col gap-3 items-center animate-slide-up">
                    {[PresetLayers.GOLDHOEFFIG, PresetLayers.INTERESSANT, PresetLayers.NICHT_GOLDHOEFFIG].map((layer) => (
                        <button
                            key={layer}
                            onClick={() => handleFabOptionClick(layer)}
                            className="bg-white text-brand-text px-4 py-2 rounded-full shadow-lg border border-gray-200 font-bold text-sm flex items-center gap-2 hover:bg-gray-50 active:scale-95 transition-all whitespace-nowrap"
                        >
                            <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: layerColors[layer] }}
                            />
                            {layer}
                        </button>
                    ))}
                </div>
            )}

            {/* Add Location FAB - Bottom Center */}
            <button
                onClick={handleFabClick}
                className={`absolute bottom-8 left-1/2 -translate-x-1/2 z-40 text-brand-text p-4 rounded-full shadow-lg transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center ${
                    pendingClassification ? 'bg-red-500 text-white' : 'bg-brand-gold hover:bg-yellow-600'
                }`}
                aria-label={pendingClassification ? "Abbrechen" : "Ort hinzufügen"}
            >
                {pendingClassification || isFabOpen ? <X className="w-8 h-8" /> : <Plus className="w-8 h-8" />}
            </button>
        </>
      )}
    </div>
  );
}