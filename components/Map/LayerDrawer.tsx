import React, { useState, useRef } from 'react';
import { X, Layers, Check, Plus, ChevronRight } from 'lucide-react';
import { Classification, CustomLayer } from '../../types';

interface LayerDrawerProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  availableLayers: Classification[];
  visibleLayers: Classification[];
  onToggleLayer: (layer: Classification) => void;
  onAddLayer: (layer: CustomLayer) => void;
  layerColors: Record<string, string>;
  filterLogic: 'OR' | 'AND';
  onToggleFilterLogic: () => void;
}

const AVAILABLE_COLORS = [
  '#9333EA', // Purple
  '#DC2626', // Red
  '#EA580C', // Orange
  '#DB2777', // Pink
  '#0891B2', // Cyan
  '#4F46E5', // Indigo
  '#78350F', // Brown
];

export const LayerDrawer: React.FC<LayerDrawerProps> = ({ 
  isOpen, 
  onOpen,
  onClose, 
  availableLayers,
  visibleLayers, 
  onToggleLayer,
  onAddLayer,
  layerColors,
  filterLogic,
  onToggleFilterLogic
}) => {
  const [newLayerName, setNewLayerName] = useState('');
  const [selectedColor, setSelectedColor] = useState(AVAILABLE_COLORS[0]);
  const [isAdding, setIsAdding] = useState(false);
  
  // Touch handling for swipe on handle
  const touchStartX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current !== null) {
      const touchEndX = e.changedTouches[0].clientX;
      if (touchEndX > touchStartX.current + 20) { // Swipe right detected
        onOpen();
      }
      touchStartX.current = null;
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (newLayerName.trim()) {
          onAddLayer({
            name: newLayerName.trim(),
            color: selectedColor
          });
          setNewLayerName('');
          setSelectedColor(AVAILABLE_COLORS[0]);
          setIsAdding(false);
      }
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

      {/* Drawer Panel */}
      <div 
        className={`fixed inset-y-0 left-0 w-4/5 max-w-xs bg-brand-bg/30 backdrop-blur-md border-r border-white/20 shadow-2xl z-[1100] transform transition-transform duration-300 ease-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="h-16 bg-brand-accent/60 backdrop-blur-md flex items-center justify-between px-4 shrink-0 shadow-md border-b border-white/10">
          <div className="flex items-center gap-2 text-white font-bold text-lg">
            <Layers className="w-6 h-6 text-brand-gold" />
            <span>Ebenen</span>
          </div>
          <button onClick={onClose} className="text-white p-2 hover:bg-white/10 rounded-full">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {/* Filter Logic Toggle */}
          <div className="mb-6 flex items-center justify-between bg-white p-3 rounded-xl shadow-sm border border-gray-100">
            <span className="text-sm font-bold text-brand-textSec">Filtermodus</span>
            <div className="flex bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => filterLogic === 'AND' && onToggleFilterLogic()}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                  filterLogic === 'OR' ? 'bg-white text-brand-text shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Oder
              </button>
              <button
                onClick={() => filterLogic === 'OR' && onToggleFilterLogic()}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                  filterLogic === 'AND' ? 'bg-white text-brand-text shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Und
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {availableLayers.map((cls) => {
              const isActive = visibleLayers.includes(cls);
              const color = layerColors[cls] || '#9CA3AF';
              
              return (
                <button
                  key={cls}
                  onClick={() => onToggleLayer(cls)}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 ${
                    isActive 
                      ? 'border-brand-gold bg-white shadow-sm' 
                      : 'border-transparent bg-brand-bgAlt opacity-70'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full shadow-sm ring-2 ring-white"
                      style={{ backgroundColor: color }}
                    />
                    <span className={`font-semibold ${isActive ? 'text-brand-text' : 'text-brand-textSec'}`}>
                      {cls}
                    </span>
                  </div>

                  <div className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${
                    isActive ? 'bg-brand-gold text-white' : 'bg-gray-300'
                  }`}>
                    {isActive && <Check size={16} strokeWidth={3} />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Add Layer Section */}
          <div className="mt-8 border-t border-brand-bgSection pt-6">
              {!isAdding ? (
                  <button 
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-2 text-brand-gold font-bold hover:text-brand-text transition-colors w-full justify-center p-2 border-2 border-dashed border-brand-bgSection rounded-lg hover:border-brand-gold"
                  >
                      <Plus size={20} />
                      Eigene Ebene hinzufügen
                  </button>
              ) : (
                  <form onSubmit={handleAddSubmit} className="flex flex-col gap-4 animate-fade-in bg-white p-4 rounded-lg border border-brand-bgSection">
                      <div className="flex flex-col gap-2">
                          <label className="text-xs font-bold text-brand-textSec uppercase tracking-wider">Name</label>
                          {/* Force dark text and white background for readability */}
                          <input 
                            type="text" 
                            value={newLayerName}
                            onChange={(e) => setNewLayerName(e.target.value)}
                            placeholder="z.B. Silberfund"
                            className="p-3 rounded-lg border border-brand-bgSection bg-white text-black placeholder-gray-400 focus:ring-2 focus:ring-brand-gold outline-none w-full"
                            autoFocus
                          />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-brand-textSec uppercase tracking-wider">Farbe</label>
                        <div className="flex flex-wrap gap-2">
                            {AVAILABLE_COLORS.map(color => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => setSelectedColor(color)}
                                    className={`w-8 h-8 rounded-full border-2 transition-transform ${
                                        selectedColor === color ? 'border-brand-text scale-110 shadow-md' : 'border-transparent hover:scale-105'
                                    }`}
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                        </div>
                      </div>

                      <div className="flex gap-2 mt-2">
                          <button 
                            type="button" 
                            onClick={() => setIsAdding(false)}
                            className="flex-1 py-2 px-3 text-sm font-bold text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200"
                          >
                              Abbrechen
                          </button>
                          <button 
                            type="submit" 
                            disabled={!newLayerName.trim()}
                            className="flex-1 py-2 px-3 text-sm font-bold text-brand-text bg-brand-gold rounded-lg hover:bg-yellow-600 disabled:opacity-50"
                          >
                              Speichern
                          </button>
                      </div>
                  </form>
              )}
          </div>
        </div>
      </div>
    </>
  );
};