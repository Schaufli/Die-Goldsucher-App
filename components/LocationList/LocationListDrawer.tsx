import React, { useState, useMemo } from 'react';
import { X, MapPin, Calendar, Star, Filter, ArrowUpDown, Search, ArrowUp, ArrowDown, ChevronDown } from 'lucide-react';
import { GoldLocation, Classification, PresetLayers } from '../../types';
import { CLASSIFICATION_COLORS } from '../../constants';

interface LocationListDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  locations: GoldLocation[];
  onSelectLocation: (location: GoldLocation) => void;
  availableLayers: Classification[];
  layerColors: Record<string, string>;
}

type SortField = 'DATE' | 'NAME' | 'RATING';
type SortDirection = 'ASC' | 'DESC';

export const LocationListDrawer: React.FC<LocationListDrawerProps> = ({
  isOpen,
  onClose,
  locations,
  onSelectLocation,
  availableLayers,
  layerColors
}) => {
  const [filterLayer, setFilterLayer] = useState<Classification | 'ALL'>('ALL');
  const [sortField, setSortField] = useState<SortField>('DATE');
  const [sortDirection, setSortDirection] = useState<SortDirection>('DESC');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

  const filteredAndSortedLocations = useMemo(() => {
    let result = [...locations];

    // 1. Filter by Layer
    if (filterLayer !== 'ALL') {
      result = result.filter(loc => loc.classification === filterLayer);
    }

    // 2. Filter by Search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(loc => 
        loc.name.toLowerCase().includes(query) || 
        loc.note?.toLowerCase().includes(query)
      );
    }

    // 3. Sort (and implicit filter for Rating)
    if (sortField === 'RATING') {
      // "dabei werden nur Orte gezeigt die 'goldhöffig' sind"
      result = result.filter(loc => loc.classification === PresetLayers.GOLDHOEFFIG);
      result.sort((a, b) => {
          const diff = (a.rating || 0) - (b.rating || 0);
          return sortDirection === 'ASC' ? diff : -diff;
      });
    } else if (sortField === 'DATE') {
      result.sort((a, b) => {
          const diff = a.timestamp - b.timestamp;
          return sortDirection === 'ASC' ? diff : -diff;
      });
    } else if (sortField === 'NAME') {
      result.sort((a, b) => {
          const diff = a.name.localeCompare(b.name);
          return sortDirection === 'ASC' ? diff : -diff;
      });
    }

    return result;
  }, [locations, filterLayer, sortField, sortDirection, searchQuery]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const toggleSortDirection = () => {
      setSortDirection(prev => prev === 'ASC' ? 'DESC' : 'ASC');
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 z-[1050] transition-opacity duration-300 ${
          isOpen ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer Panel - Slides from Left (Full width on mobile, max-md on desktop) */}
      <div 
        className={`fixed inset-y-0 left-0 w-full max-w-md bg-brand-bg shadow-2xl z-[1100] transform transition-transform duration-300 ease-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="h-16 bg-white flex items-center justify-between px-4 shrink-0 border-b border-gray-200">
          <div className="flex items-center gap-2 text-brand-text font-bold text-xl">
            <span className="text-brand-accent">Meine Fundorte</span>
            <span className="text-sm font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {filteredAndSortedLocations.length}
            </span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100">
            <X size={24} />
          </button>
        </div>

        {/* Controls Section */}
        <div className="p-4 bg-white border-b border-gray-200 flex flex-col gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Suchen..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
            />
          </div>

          {/* Sort Row */}
          <div className="flex items-center gap-3 relative z-20">
             <div className="flex-1 relative">
                <button 
                  onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                  className="w-full flex items-center justify-between bg-gray-50 border border-gray-200 text-brand-text text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-gold font-bold transition-all active:scale-[0.98]"
                >
                  <span className="truncate">
                    {sortField === 'DATE' && 'Datum'}
                    {sortField === 'NAME' && 'Name'}
                    {sortField === 'RATING' && 'Gold-Rating'}
                  </span>
                  <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${isSortDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isSortDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsSortDropdownOpen(false)} />
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden z-20 animate-fade-in">
                      {[
                        { value: 'DATE', label: 'Datum' },
                        { value: 'NAME', label: 'Name' },
                        { value: 'RATING', label: 'Gold-Rating' }
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setSortField(option.value as SortField);
                            setIsSortDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-3 text-sm font-medium border-b border-gray-50 last:border-0 transition-colors ${
                            sortField === option.value 
                              ? 'bg-brand-bgAlt text-brand-gold font-bold' 
                              : 'text-brand-text hover:bg-gray-50'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
             </div>
             
             <button 
                onClick={toggleSortDirection}
                className="bg-gray-50 border border-gray-200 text-brand-text p-3 rounded-xl hover:bg-gray-100 active:scale-95 transition-transform"
                title={sortDirection === 'ASC' ? "Aufsteigend" : "Absteigend"}
             >
                 {sortDirection === 'ASC' ? <ArrowUp size={20} /> : <ArrowDown size={20} />}
             </button>
          </div>

          {/* Filter Chips (Moved below sort) */}
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar pt-1">
            <button
              onClick={() => setFilterLayer('ALL')}
              className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors border ${
                filterLayer === 'ALL' 
                  ? 'bg-brand-accent text-white border-brand-accent' 
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              Alle
            </button>
            {availableLayers.map(layer => (
              <button
                key={layer}
                onClick={() => setFilterLayer(layer)}
                className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors border flex items-center gap-2 ${
                  filterLayer === layer
                    ? 'bg-brand-accent text-white border-brand-accent'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: layerColors[layer] }}
                />
                {layer}
              </button>
            ))}
          </div>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-4 bg-brand-bg">
          <div className="flex flex-col gap-3">
            {filteredAndSortedLocations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400 text-center">
                <MapPin size={48} className="mb-4 opacity-20" />
                <p>Keine Orte gefunden.</p>
                {sortField === 'RATING' && (
                  <p className="text-xs mt-2">Sortierung nach "Gold-Rating" zeigt nur goldhöffige Orte.</p>
                )}
              </div>
            ) : (
              filteredAndSortedLocations.map((loc) => (
                <div 
                  key={loc.id}
                  onClick={() => onSelectLocation(loc)}
                  className="bg-white p-4 rounded-xl shadow-sm border border-transparent hover:border-brand-gold/30 hover:shadow-md transition-all cursor-pointer group flex gap-4"
                >
                  {/* Image Thumbnail */}
                  {loc.images && loc.images.length > 0 && (
                      <div className="w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                          <img src={loc.images[0]} alt={loc.name} className="w-full h-full object-cover" />
                      </div>
                  )}

                  <div className="flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-brand-text text-lg leading-tight group-hover:text-brand-gold transition-colors">
                            {loc.name}
                          </h3>
                          <span className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                            <Calendar size={12} />
                            {formatDate(loc.timestamp)}
                          </span>
                        </div>
                        <div 
                          className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider text-white"
                          style={{ backgroundColor: loc.classification === PresetLayers.GOLDHOEFFIG ? '#CA8A04' : layerColors[loc.classification] }}
                        >
                          {loc.classification}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-0.5 h-7">
                          {loc.rating && (
                            <div className="flex text-brand-gold">
                              {Array.from({length: loc.rating}).map((_, i) => (
                                <Star key={i} size={22} fill="currentColor" className="text-brand-gold" />
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <button 
                          className="text-brand-textSec hover:text-brand-accent bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors"
                          title="Auf Karte zeigen"
                        >
                          <MapPin size={16} />
                        </button>
                      </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
};
