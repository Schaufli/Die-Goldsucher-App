import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import { LocateFixed, Locate } from 'lucide-react';
import { GeoCoordinates, GoldLocation, Classification, PresetLayers } from '../../types';
import { DEFAULT_COORDINATES } from '../../constants';

// --- Default Icon for User Location ---
const userLocationIcon = L.divIcon({
  className: 'user-location-marker',
  html: `
    <div style="
      width: 16px; 
      height: 16px; 
      background-color: #3b82f6; 
      border: 3px solid white; 
      border-radius: 50%; 
      box-shadow: 0 0 8px rgba(0,0,0,0.5);
      position: relative;
    ">
      <div style="
        position: absolute;
        top: -3px;
        left: -3px;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background-color: #3b82f6;
        animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        opacity: 0.5;
      "></div>
    </div>
  `,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
  popupAnchor: [0, -10]
});

// --- Dynamic Custom Icon Generator ---
const getMarkerColor = (classification: Classification, layerColors: Record<string, string>, rating: number = 0) => {
    // If it's the specific "Goldhöffig" layer, we keep the gradient logic
    if (classification === PresetLayers.GOLDHOEFFIG) {
        switch (rating) {
            case 1: return '#FEF9C3'; 
            case 2: return '#FDE047'; 
            case 3: return '#FACC15'; 
            case 4: return '#EAB308'; 
            case 5: return '#CA8A04'; 
            default: return '#EAB308';
        }
    }
    
    // For everything else (Presets or Custom), use the mapped color
    return layerColors[classification] || '#9CA3AF';
};

const createCustomIcon = (classification: Classification, layerColors: Record<string, string>, rating?: number) => {
    const color = getMarkerColor(classification, layerColors, rating);
    
    let innerContent = `<circle cx="12" cy="10" r="3" fill="rgba(0,0,0,0.15)"></circle>`;
    
    if (classification === PresetLayers.NICHT_GOLDHOEFFIG) {
        // X Icon (centered at 12,10)
        innerContent = `<path d="M15 7L9 13M9 7l6 6" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />`;
    } else if (classification === PresetLayers.GOLDHOEFFIG) {
        // Check Icon (centered at 12,10)
        innerContent = `<path d="M9 10l2 2 4-4" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />`;
    }

    const svgString = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0px 2px 2px rgba(0,0,0,0.4));">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        ${innerContent}
      </svg>
    `;
    return L.divIcon({
        className: 'custom-div-icon',
        html: svgString,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -38]
    });
};

interface MapViewProps {
  userLocation: GeoCoordinates | null;
  locations: GoldLocation[];
  geoLoading: boolean;
  geoError: string | null;
  onLocationSelect: (coords: GeoCoordinates) => void;
  onMarkerClick: (location: GoldLocation) => void;
  onMapInteraction?: () => void;
  mapType: 'satellite' | 'terrain' | 'hillshade';
  layerColors: Record<string, string>;
  flyToCoordinates?: GeoCoordinates | null;
  isFollowingUser: boolean;
  setIsFollowingUser: (val: boolean) => void;
  naturschutzgebieteData?: any;
  showNaturschutzgebiete: boolean;
}

const GeoJSONAny = GeoJSON as any;

const naturschutzStyle = {
  fillColor: '#22c55e',
  fillOpacity: 0.25,
  color: '#16a34a',
  weight: 2,
  opacity: 0.7,
};

function onEachNaturschutzFeature(feature: any, layer: any) {
  if (feature.properties?.name) {
    layer.bindPopup(
      `<div style="font-size:13px;font-weight:bold;color:#166534;">🌿 ${feature.properties.name}</div>
       <div style="font-size:11px;color:#666;margin-top:4px;">
         ${feature.properties.bl ? `Bundesland: ${feature.properties.bl}` : ''}
         ${feature.properties.flaeche ? `<br/>Fläche: ${feature.properties.flaeche} ha` : ''}
         ${feature.properties.jahr ? `<br/>Schutz seit: ${feature.properties.jahr}` : ''}
       </div>`,
      { maxWidth: 250 }
    );
  }
}

const RecenterMap = ({ coords, isFollowing }: { coords: GeoCoordinates, isFollowing: boolean }) => {
  const map = useMap();
  useEffect(() => { 
    if (isFollowing) {
      map.flyTo([coords.lat, coords.lng], map.getZoom() || 15, {
        animate: true,
        duration: 1
      }); 
    }
  }, [coords, map, isFollowing]);
  return null;
};

const FlyToLocation = ({ coords }: { coords: GeoCoordinates | null }) => {
    const map = useMap();
    useEffect(() => {
        if (coords) {
            const targetZoom = 16;
            const latLng = L.latLng(coords.lat, coords.lng);
            
            // Project to pixel coordinates at target zoom
            const point = map.project(latLng, targetZoom);
            
            // Calculate offset: Shift center downwards so marker appears higher
            // We want marker at ~25% from top of screen (to be visible above drawer)
            // Map center is at 50%
            // So we need to shift the center point down by 25% of screen height
            const containerHeight = map.getSize().y;
            const offset = containerHeight * 0.25;
            
            const targetPoint = point.add([0, offset]);
            const targetLatLng = map.unproject(targetPoint, targetZoom);
            
            map.flyTo(targetLatLng, targetZoom, { animate: true, duration: 1.0 });
        }
    }, [coords, map]);
    return null;
};

const LocationSelector = ({ onSelect, onInteraction }: { onSelect: (c: GeoCoordinates) => void, onInteraction: () => void }) => {
    useMapEvents({ 
        click(e) { onSelect({ lat: e.latlng.lat, lng: e.latlng.lng }); },
        dragstart() { onInteraction(); },
        zoomstart() { onInteraction(); }
    });
    return null;
};

const MapContainerAny = MapContainer as any;
const TileLayerAny = TileLayer as any;
const MarkerAny = Marker as any;
const PopupAny = Popup as any;

export const MapView: React.FC<MapViewProps> = ({ 
    userLocation, locations, geoLoading, onLocationSelect, onMarkerClick, onMapInteraction, mapType, layerColors, flyToCoordinates, isFollowingUser, setIsFollowingUser, naturschutzgebieteData, showNaturschutzgebiete
}) => {
  const center = userLocation || DEFAULT_COORDINATES;
  const initialZoom = userLocation ? 13 : 6;

  // Automatically start following if userLocation becomes available for the first time
  useEffect(() => {
    if (userLocation && !isFollowingUser) {
        // We don't force it here, but we could. 
        // Let's just let the user decide or do it once.
    }
  }, [userLocation]);

  if (geoLoading && !userLocation) {
      return <div className="h-full w-full flex items-center justify-center bg-brand-bg"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-gold"></div></div>;
  }

  return (
    <MapContainerAny 
      center={[center.lat, center.lng]} 
      zoom={initialZoom} 
      className="h-full w-full z-0"
      zoomControl={false}
      attributionControl={false}
    >
      {mapType === 'terrain' ? (
        <TileLayerAny 
            attribution='Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>' 
            url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png" 
            maxZoom={17}
        />
      ) : mapType === 'hillshade' ? (
        <>
          <TileLayerAny 
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' 
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
          />
          <TileLayerAny 
              attribution='Hillshading: &copy; ESRI' 
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Hillshade/MapServer/tile/{z}/{y}/{x}" 
              opacity={0.6}
          />
        </>
      ) : (
        <TileLayerAny attribution='&copy; Google Maps' url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" maxZoom={20} />
      )}
      
      {showNaturschutzgebiete && naturschutzgebieteData && (
        <GeoJSONAny
          key="naturschutzgebiete"
          data={naturschutzgebieteData}
          style={naturschutzStyle}
          onEachFeature={onEachNaturschutzFeature}
        />
      )}

      <LocationSelector 
        onSelect={onLocationSelect} 
        onInteraction={() => {
            setIsFollowingUser(false);
            if (onMapInteraction) onMapInteraction();
        }} 
      />
      
      {userLocation && !flyToCoordinates && (
        <RecenterMap coords={userLocation} isFollowing={isFollowingUser} />
      )}
 
      <FlyToLocation coords={flyToCoordinates} />

      {userLocation && (
        <MarkerAny 
            position={[userLocation.lat, userLocation.lng]} 
            icon={userLocationIcon}
            zIndexOffset={1000}
        >
            <PopupAny className="custom-popup" maxWidth={200}>
                <div className="text-center font-bold text-sm text-white">
                    Dein aktueller Standort
                </div>
            </PopupAny>
        </MarkerAny>
      )}

      {locations.map((loc) => (
        <MarkerAny 
            key={loc.id} 
            position={[loc.coordinates.lat, loc.coordinates.lng]}
            icon={createCustomIcon(loc.classification, layerColors, loc.rating)}
        >
          <PopupAny className="custom-popup" maxWidth={300} minWidth={200}>
            <div className="flex items-start gap-3 cursor-pointer" onClick={() => onMarkerClick(loc)}>
              {loc.images && loc.images.length > 0 && (
                  <img src={loc.images[0]} alt={loc.name} className="w-16 h-16 rounded-md object-cover border border-white/20 shrink-0 bg-gray-800" />
              )}
              <div className="flex flex-col">
                <h3 className="font-bold text-sm text-white leading-tight mb-1 pr-4">{loc.name}</h3>
                <div 
                   className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded w-fit text-white mb-1"
                   style={{ backgroundColor: loc.classification === PresetLayers.GOLDHOEFFIG ? '#CA8A04' : layerColors[loc.classification] || '#9CA3AF' }}
                >
                  {loc.classification}
                </div>
                {loc.rating && (
                  <div className="flex text-brand-gold text-xs">{Array.from({length: loc.rating}).map((_, i) => <span key={i}>★</span>)}</div>
                )}
                <span className="text-[10px] text-gray-300 mt-1 italic">Details &rarr;</span>
              </div>
            </div>
          </PopupAny>
        </MarkerAny>
      ))}
    </MapContainerAny>
  );
};
