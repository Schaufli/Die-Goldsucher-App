import React, { useState, useRef } from 'react';
import { X, Layers, Check, Plus, Pencil, Trash2 } from 'lucide-react';
import { Classification, CustomLayer } from '../../types';

interface LayerDrawerProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  availableLayers: Classification[];
  customLayers: CustomLayer[];
  visibleLayers: Classification[];
  onToggleLayer: (layer: Classification) => void;
  onAddLayer: (layer: CustomLayer) => void;
  onRemoveLayer: (name: string) => void;
  onUpdateLayer: (oldName: string, layer: CustomLayer) => void;
  layerColors: Record<string, string>;
  filterLogic: 'OR' | 'AND';
  onToggleFilterLogic: () => void;
}

const AVAILABLE_COLORS = [
  '#9333EA',
  '#DC2626',
  '#EA580C',
  '#DB2777',
  '#0891B2',
  '#4F46E5',
  '#78350F',
];

export const LayerDrawer: React.FC<LayerDrawerProps> = ({ 
  isOpen, 
  onOpen,
  onClose, 
  availableLayers,
  customLayers,
  visibleLayers, 
  onToggleLayer,
  onAddLayer,
  onRemoveLayer,
  onUpdateLayer,
  layerColors,
  filterLogic,
  onToggleFilterLogic
}) => {
  const [newLayerName, setNewLayerName] = useState('');
  const [selectedColor, setSelectedColor] = useState(AVAILABLE_COLORS[0]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingLayer, setEditingLayer] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState(AVAILABLE_COLORS[0]);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const touchStartX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current !== null) {
      const touchEndX = e.changedTouches[0].clientX;
      if (touchEndX > touchStartX.current + 20) {
        onOpen();
      }
      touchStartX.current = null;
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newLayerName.trim()) {
      onAddLayer({ name: newLayerName.trim(), color: selectedColor });
      setNewLayerName('');
      setSelectedColor(AVAILABLE_COLORS[0]);
      setIsAdding(false);
    }
  };

  const startEdit = (layer: CustomLayer) => {
    setEditingLayer(layer.name);
    setEditName(layer.name);
    setEditColor(layer.color);
    setConfirmDelete(null);
  };

  const cancelEdit = () => {
    setEditingLayer(null);
    setEditName('');
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editName.trim() && editingLayer) {
      onUpdateLayer(editingLayer, { name: editName.trim(), color: editColor });
      setEditingLayer(null);
    }
  };

  const handleDelete = (name: string) => {
    onRemoveLayer(name);
    setConfirmDelete(null);
    setEditingLayer(null);
  };

  const customLayerNames = new Set(customLayers.map(l => l.name));

  return (
    <>
      <div 
        className={`fixed inset-0 z-[1050] transition-opacity duration-300 ${
          isOpen ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
        onClick={onClose}
      />

      <div 
        className={`fixed inset-y-0 left-0 w-4/5 max-w-xs bg-brand-bg/30 backdrop-blur-md border-r border-white/20 shadow-2xl z-[1100] transform transition-transform duration-300 ease-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 bg-brand-accent/60 backdrop-blur-md flex items-center justify-between px-4 shrink-0 shadow-md border-b border-white/10">
          <div className="flex items-center gap-2 text-white font-bold text-lg">
            <Layers className="w-6 h-6 text-brand-gold" />
            <span>Ebenen</span>
          </div>
          <button onClick={onClose} className="text-white p-2 hover:bg-white/10 rounded-full">
            <X size={24} />
          </button>
        </div>

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
              const isCustom = customLayerNames.has(cls);
              const customLayer = customLayers.find(l => l.name === cls);
              const isEditing = editingLayer === cls;

              return (
                <div key={cls}>
                  {isEditing && customLayer ? (
                    <form
                      onSubmit={handleEditSubmit}
                      className="flex flex-col gap-3 bg-white p-4 rounded-xl border-2 border-brand-gold shadow-sm"
                    >
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-brand-textSec uppercase tracking-wider">Name</label>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="p-2 rounded-lg border border-gray-200 bg-white text-black text-sm focus:ring-2 focus:ring-brand-gold outline-none"
                          autoFocus
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-brand-textSec uppercase tracking-wider">Farbe</label>
                        <div className="flex flex-wrap gap-2">
                          {AVAILABLE_COLORS.map(c => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => setEditColor(c)}
                              className={`w-7 h-7 rounded-full border-2 transition-transform ${
                                editColor === c ? 'border-brand-text scale-110 shadow-md' : 'border-transparent hover:scale-105'
                              }`}
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                      </div>

                      {confirmDelete === cls ? (
                        <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                          <p className="text-xs text-red-700 font-semibold mb-2">Ebene wirklich löschen?</p>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setConfirmDelete(null)}
                              className="flex-1 py-1.5 text-xs font-bold bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                            >
                              Abbrechen
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(cls)}
                              className="flex-1 py-1.5 text-xs font-bold bg-red-500 text-white rounded-lg hover:bg-red-600"
                            >
                              Löschen
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setConfirmDelete(cls)}
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Ebene löschen"
                          >
                            <Trash2 size={16} />
                          </button>
                          <div className="flex-1" />
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="py-1.5 px-3 text-xs font-bold text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200"
                          >
                            Abbrechen
                          </button>
                          <button
                            type="submit"
                            disabled={!editName.trim()}
                            className="py-1.5 px-3 text-xs font-bold text-brand-text bg-brand-gold rounded-lg hover:bg-yellow-600 disabled:opacity-50"
                          >
                            Speichern
                          </button>
                        </div>
                      )}
                    </form>
                  ) : (
                    <div className={`flex items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
                      isActive
                        ? 'border-brand-gold bg-white shadow-sm'
                        : 'border-transparent bg-brand-bgAlt opacity-70'
                    }`}>
                      <button
                        className="flex items-center gap-3 flex-1 min-w-0"
                        onClick={() => onToggleLayer(cls)}
                      >
                        <div
                          className="w-4 h-4 flex-shrink-0 rounded-full shadow-sm ring-2 ring-white"
                          style={{ backgroundColor: color }}
                        />
                        <span className={`font-semibold truncate ${isActive ? 'text-brand-text' : 'text-brand-textSec'}`}>
                          {cls}
                        </span>
                      </button>

                      {isCustom && (
                        <button
                          onClick={() => startEdit(customLayer!)}
                          className="p-1.5 text-gray-400 hover:text-brand-accent hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                          title="Ebene bearbeiten"
                        >
                          <Pencil size={14} />
                        </button>
                      )}

                      <div
                        className={`w-6 h-6 flex-shrink-0 rounded-md flex items-center justify-center transition-colors cursor-pointer ${
                          isActive ? 'bg-brand-gold text-white' : 'bg-gray-300'
                        }`}
                        onClick={() => onToggleLayer(cls)}
                      >
                        {isActive && <Check size={16} strokeWidth={3} />}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add Layer Section */}
          <div className="mt-8 border-t border-brand-bgSection pt-6">
            {!isAdding ? (
              <button
                onClick={() => { setIsAdding(true); setEditingLayer(null); }}
                className="flex items-center gap-2 text-brand-gold font-bold hover:text-brand-text transition-colors w-full justify-center p-2 border-2 border-dashed border-brand-bgSection rounded-lg hover:border-brand-gold"
              >
                <Plus size={20} />
                Eigene Ebene hinzufügen
              </button>
            ) : (
              <form onSubmit={handleAddSubmit} className="flex flex-col gap-4 animate-fade-in bg-white p-4 rounded-lg border border-brand-bgSection">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-brand-textSec uppercase tracking-wider">Name</label>
                  <input
                    type="text"
                    value={newLayerName}
                    onChange={(e) => setNewLayerName(e.target.value)}
                    placeholder="z.B. Pauls Claim"
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
