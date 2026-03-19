import React, { useState, useEffect } from 'react';
import { X, Camera, ChevronRight, Edit2, Save, Trash2, Copy, Navigation, Check } from 'lucide-react';
import { GoldLocation, PresetLayers, Classification } from '../../types';
import { LocationService } from '../../services/locationService';
import { Button } from '../UI/Button';

interface LocationDrawerProps {
  location: GoldLocation | null;
  onClose: () => void;
  onUpdate: (updated: GoldLocation) => void;
  onDelete: (id: string) => void;
  layerColors: Record<string, string>;
  availableLayers: Classification[];
}

export const LocationDrawer: React.FC<LocationDrawerProps> = ({ location, onClose, onUpdate, onDelete, layerColors, availableLayers }) => {
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [editName, setEditName] = useState('');
  const [editClassification, setEditClassification] = useState<Classification | null>(null);
  const [editCustomLayers, setEditCustomLayers] = useState<string[]>([]);
  const [editRating, setEditRating] = useState<number>(1);

  // Sync state when location opens/changes
  useEffect(() => {
    if (location) {
        setNoteText(location.note || '');
        setIsEditingNote(false);
        setShowDeleteConfirm(false);
        setCopied(false);
        setIsEditingDetails(false);
        setEditName(location.name);
        setEditClassification(location.classification);
        setEditCustomLayers(location.customLayers || []);
        setEditRating(location.rating || 1);
    }
  }, [location]);

  if (!location) return null;

  const needsRating = (cls: Classification | null) => {
      return cls === PresetLayers.GOLDHOEFFIG;
  };

  const handleSaveDetails = () => {
      if (!editName.trim() || !editClassification) return;
      onUpdate({
          ...location,
          name: editName,
          classification: editClassification,
          customLayers: editCustomLayers,
          rating: needsRating(editClassification) ? editRating : undefined
      });
      setIsEditingDetails(false);
  };

  const copyCoordinates = (e: React.MouseEvent) => {
    e.stopPropagation();
    const coords = `${location.coordinates.lat},${location.coordinates.lng}`;
    navigator.clipboard.writeText(coords);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
      onDelete(location.id);
      setShowDeleteConfirm(false);
  };

  const handleAddPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const base64 = await LocationService.convertFileToBase64(e.target.files[0]);
        const updatedLocation = {
            ...location,
            images: [...location.images, base64]
        };
        onUpdate(updatedLocation);
      } catch (err) {
        alert('Fehler beim Laden des Bildes.');
      }
    }
  };

  const handleSaveNote = () => {
      onUpdate({
          ...location,
          note: noteText
      });
      setIsEditingNote(false);
  };

  const imagesToShow = location.images.slice(0, 4);
  const totalImages = location.images.length;
  const hasMoreImages = totalImages > 4;

  const badgeColor = location.classification === PresetLayers.GOLDHOEFFIG 
      ? '#CA8A04' // Keep deep gold for the gold rating
      : (layerColors[location.classification] || '#6B7280');

  return (
    <div className="absolute bottom-0 left-0 right-0 h-[60vh] bg-brand-bg rounded-t-3xl shadow-[0_-5px_20px_rgba(0,0,0,0.2)] z-[1000] flex flex-col animate-slide-up transform transition-transform">
      {showDeleteConfirm && (
        <div className="absolute inset-0 z-[1100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 rounded-t-3xl">
            <div className="bg-white rounded-xl p-6 shadow-xl w-full max-w-sm animate-fade-in">
                <h3 className="text-lg font-bold text-brand-text mb-2">Ort löschen?</h3>
                <p className="text-brand-textSec mb-6">Möchtest du "{location.name}" wirklich unwiderruflich löschen?</p>
                <div className="flex gap-3">
                    <Button variant="ghost" onClick={() => setShowDeleteConfirm(false)} className="flex-1">Abbrechen</Button>
                    <Button variant="danger" onClick={confirmDelete} className="flex-1">Löschen</Button>
                </div>
            </div>
        </div>
      )}
      <div className="w-full flex justify-center pt-3 pb-1 cursor-pointer" onClick={onClose}>
        <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 pt-2 pb-12">
        {isEditingDetails ? (
            <div className="mb-6 animate-fade-in bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex flex-col gap-4">
                    <div>
                        <label className="text-xs font-bold text-brand-textSec uppercase mb-1 block">Name</label>
                        <input 
                            type="text" 
                            value={editName} 
                            onChange={e => setEditName(e.target.value)} 
                            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-gold outline-none text-brand-text font-medium"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-brand-textSec uppercase mb-2 block">Kategorie (Pflichtfeld)</label>
                        <div className="flex flex-wrap gap-2">
                            {[PresetLayers.GOLDHOEFFIG, PresetLayers.INTERESSANT, PresetLayers.NICHT_GOLDHOEFFIG].map(layer => (
                                <button
                                    key={layer}
                                    onClick={() => setEditClassification(layer)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors border ${
                                        editClassification === layer 
                                        ? 'bg-brand-gold text-white border-brand-gold shadow-sm' 
                                        : 'bg-white text-brand-textSec border-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    {layer}
                                </button>
                            ))}
                        </div>
                    </div>
                    {availableLayers.filter(l => l !== PresetLayers.GOLDHOEFFIG && l !== PresetLayers.INTERESSANT && l !== PresetLayers.NICHT_GOLDHOEFFIG).length > 0 && (
                        <div>
                            <label className="text-xs font-bold text-brand-textSec uppercase mb-2 block">Zusätzliche Ebenen</label>
                            <div className="flex flex-wrap gap-2">
                                {availableLayers.filter(l => l !== PresetLayers.GOLDHOEFFIG && l !== PresetLayers.INTERESSANT && l !== PresetLayers.NICHT_GOLDHOEFFIG).map(layer => {
                                    const isSelected = editCustomLayers.includes(layer);
                                    return (
                                        <button
                                            key={layer}
                                            onClick={() => {
                                                if (isSelected) {
                                                    setEditCustomLayers(prev => prev.filter(l => l !== layer));
                                                } else {
                                                    setEditCustomLayers(prev => [...prev, layer]);
                                                }
                                            }}
                                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors border flex items-center gap-1 ${
                                                isSelected 
                                                ? 'bg-brand-bgAlt text-brand-text border-brand-gold shadow-sm' 
                                                : 'bg-white text-brand-textSec border-gray-300 hover:bg-gray-50'
                                            }`}
                                        >
                                            {layer}
                                            {isSelected && <Check size={14} className="text-brand-gold" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                    {needsRating(editClassification) && (
                        <div>
                            <label className="text-xs font-bold text-brand-textSec uppercase mb-2 block">
                                {editClassification === PresetLayers.GOLDHOEFFIG ? 'Goldbewertung' : 'Bewertung'}
                            </label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map(val => (
                                    <button
                                        key={val}
                                        onClick={() => setEditRating(val)}
                                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-transform ${
                                            editRating === val ? 'bg-brand-gold text-white scale-110 shadow-md' : 'bg-gray-100 text-gray-400 border border-gray-200'
                                        }`}
                                    >
                                        {val}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    <div className="flex justify-end gap-2 mt-2">
                        <Button variant="ghost" onClick={() => setIsEditingDetails(false)}>Abbrechen</Button>
                        <Button variant="primary" onClick={handleSaveDetails}>Speichern</Button>
                    </div>
                </div>
            </div>
        ) : (
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h2 className="text-2xl font-bold text-brand-text leading-tight">{location.name}</h2>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span 
                            className="text-xs font-bold uppercase tracking-wider px-2 py-1 rounded text-white"
                            style={{ backgroundColor: badgeColor }}
                        >
                            {location.classification}
                        </span>
                        {location.customLayers?.map(layer => (
                            <span 
                                key={layer}
                                className="text-xs font-bold uppercase tracking-wider px-2 py-1 rounded text-white"
                                style={{ backgroundColor: layerColors[layer] || '#6B7280' }}
                            >
                                {layer}
                            </span>
                        ))}
                        {location.rating && (
                            <div className="flex text-brand-gold text-sm ml-1">
                            {Array.from({length: location.rating}).map((_, i) => (
                                <span key={i}>★</span>
                            ))}
                            </div>
                        )}
                    </div>
                    
                    {/* GPS Copy Button */}
                    <div className="mt-4">
                        <button 
                            onClick={copyCoordinates}
                            className="flex items-center gap-2 px-4 py-2 bg-brand-bgAlt rounded-xl border border-gray-200 hover:border-brand-gold hover:bg-white transition-all active:scale-95 group shadow-sm"
                        >
                            {copied ? (
                                <Check size={18} className="text-green-600" />
                            ) : (
                                <Navigation size={18} className="text-brand-gold group-hover:rotate-12 transition-transform" />
                            )}
                            <span className="text-sm font-bold text-brand-text">
                                {copied ? 'GPS-Koordinaten kopiert' : 'Koordinaten kopieren'}
                            </span>
                        </button>
                    </div>
                </div>
                <div className="flex gap-2 flex-col">
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setIsEditingDetails(true)}
                            className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-600 relative z-10"
                            title="Ort bearbeiten"
                        >
                            <Edit2 size={20} />
                        </button>
                        <button 
                            onClick={onClose}
                            className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-500"
                        >
                            <X size={20} />
                        </button>
                    </div>
                    <div className="flex justify-end">
                        <button 
                            onClick={handleDeleteClick}
                            className="p-2 bg-red-100 rounded-full hover:bg-red-200 text-red-500 relative z-10"
                            title="Ort löschen"
                        >
                            <Trash2 size={20} />
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Note Section - Editable */}
        <div className="mb-6">
            {isEditingNote ? (
                <div className="animate-fade-in">
                    <textarea
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        className="w-full p-3 rounded-lg border border-brand-gold bg-white text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-gold min-h-[100px] resize-none text-sm"
                        placeholder="Notizen zum Fundort..."
                        autoFocus
                    />
                    <div className="flex justify-end gap-2 mt-2">
                        <button 
                            onClick={() => {
                                setNoteText(location.note || '');
                                setIsEditingNote(false);
                            }}
                            className="px-3 py-1.5 text-sm font-semibold text-gray-500 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            Abbrechen
                        </button>
                        <button 
                            onClick={handleSaveNote}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm font-semibold text-brand-text bg-brand-gold hover:bg-yellow-600 rounded-lg transition-colors"
                        >
                            <Save size={16} /> Speichern
                        </button>
                    </div>
                </div>
            ) : (
                <div className="group relative">
                    {location.note ? (
                        <div 
                            className="p-3 bg-brand-bgAlt rounded-lg border-l-4 border-brand-accent cursor-pointer hover:bg-gray-200 transition-colors"
                            onClick={() => setIsEditingNote(true)}
                            title="Tippen zum Bearbeiten"
                        >
                            <p className="text-brand-textSec italic text-sm whitespace-pre-wrap">{location.note}</p>
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Edit2 size={16} className="text-brand-textSec" />
                            </div>
                        </div>
                    ) : (
                        <button 
                            onClick={() => setIsEditingNote(true)}
                            className="flex items-center gap-2 text-sm text-brand-gold font-bold hover:underline opacity-80 hover:opacity-100"
                        >
                            <Edit2 size={16} />
                            Notiz hinzufügen
                        </button>
                    )}
                </div>
            )}
        </div>

        <h3 className="font-bold text-brand-text mb-3 flex items-center justify-between">
            Fotos
            <span className="text-xs font-normal text-gray-400">{totalImages} Bilder</span>
        </h3>
        
        <div className="grid grid-cols-3 gap-2">
             <label className="aspect-square bg-gray-200 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors border-2 border-dashed border-gray-400">
                <Camera className="text-gray-500 mb-1" size={24} />
                <span className="text-[10px] font-bold text-gray-600 text-center leading-tight">Foto<br/>machen</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleAddPhoto} />
            </label>

            {imagesToShow.map((img, idx) => (
                <div key={idx} className="aspect-square relative group">
                    <img src={img} alt={`Fundort ${idx}`} className="w-full h-full object-cover rounded-lg border border-gray-200" />
                    {idx === 3 && hasMoreImages && (
                        <div className="absolute inset-0 bg-black/60 rounded-lg flex flex-col items-center justify-center text-white cursor-pointer backdrop-blur-[1px]">
                             <span className="text-xs font-bold">+{totalImages - 4}</span>
                             <span className="text-[10px]">Bilder</span>
                        </div>
                    )}
                </div>
            ))}
        </div>

        {hasMoreImages && (
            <button className="w-full mt-4 py-3 flex items-center justify-center text-brand-textSec font-semibold hover:text-brand-gold transition-colors text-sm">
                Alle {totalImages} Bilder anzeigen <ChevronRight size={16} className="ml-1" />
            </button>
        )}
      </div>
    </div>
  );
};