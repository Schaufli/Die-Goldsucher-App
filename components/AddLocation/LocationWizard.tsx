import React, { useState } from 'react';
import { Camera, Save, ArrowLeft, ArrowRight, X, Check } from 'lucide-react';
import { Classification, GeoCoordinates, GoldLocation, WizardStep, PresetLayers } from '../../types';
import { Button } from '../UI/Button';
import { LocationService } from '../../services/locationService';

interface WizardProps {
  currentLocation: GeoCoordinates | null;
  availableLayers: Classification[];
  initialClassification?: Classification | null;
  onSave: (location: GoldLocation) => void;
  onCancel: () => void;
}

export const LocationWizard: React.FC<WizardProps> = ({ currentLocation, availableLayers, initialClassification, onSave, onCancel }) => {
  const [step, setStep] = useState<WizardStep>('NAME');
  const [name, setName] = useState('');
  const isCustomLayer = (cls: string | null | undefined) => {
      if (!cls) return false;
      return cls !== PresetLayers.GOLDHOEFFIG && cls !== PresetLayers.INTERESSANT && cls !== PresetLayers.NICHT_GOLDHOEFFIG;
  };

  const [classification, setClassification] = useState<Classification | null>(
      initialClassification && !isCustomLayer(initialClassification) ? initialClassification : null
  );
  const [customLayers, setCustomLayers] = useState<string[]>(
      initialClassification && isCustomLayer(initialClassification) ? [initialClassification] : []
  );
  const [rating, setRating] = useState<number>(1);
  const [note, setNote] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [showExitDialog, setShowExitDialog] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const base64 = await LocationService.convertFileToBase64(e.target.files[0]);
        setImage(base64);
      } catch (err) {
        alert('Fehler beim Laden des Bildes.');
      }
    }
  };

  const needsRating = (cls: Classification | null) => {
      return cls === PresetLayers.GOLDHOEFFIG;
  };

  const handleNext = () => {
    if (step === 'NAME' && name.trim()) {
      // If we have an initial classification that is a primary layer, skip the CLASSIFICATION step
      if (initialClassification && !isCustomLayer(initialClassification)) {
          if (needsRating(classification)) {
              setStep('RATING');
          } else {
              setStep('DETAILS');
          }
      } else {
          setStep('CLASSIFICATION');
      }
    } else if (step === 'CLASSIFICATION' && classification) {
      if (needsRating(classification)) {
        setStep('RATING');
      } else {
        setStep('DETAILS');
      }
    } else if (step === 'RATING') {
      setStep('DETAILS');
    }
  };

  const handleCloseTrigger = () => {
    const initialPrimary = initialClassification && !isCustomLayer(initialClassification) ? initialClassification : null;
    const initialCustomLayers = initialClassification && isCustomLayer(initialClassification) ? [initialClassification] : [];
    
    const primaryChanged = classification !== initialPrimary;
    const customLayersChanged = JSON.stringify(customLayers) !== JSON.stringify(initialCustomLayers);
    
    const hasData = name.trim().length > 0 || primaryChanged || customLayersChanged || image !== null || note.trim().length > 0;
    
    if (hasData) {
        setShowExitDialog(true);
    } else {
        onCancel();
    }
  };
  
  const handleBack = () => {
    if (step === 'DETAILS') {
       if (needsRating(classification)) {
         setStep('RATING');
       } else {
         // If initial classification was a primary layer, go back to NAME, skipping CLASSIFICATION
         if (initialClassification && !isCustomLayer(initialClassification)) {
             setStep('NAME');
         } else {
             setStep('CLASSIFICATION');
         }
       }
    } else if (step === 'RATING') {
       if (initialClassification && !isCustomLayer(initialClassification)) {
           setStep('NAME');
       } else {
           setStep('CLASSIFICATION');
       }
    } else if (step === 'CLASSIFICATION') {
      setStep('NAME');
    } else if (step === 'NAME') {
      handleCloseTrigger();
    }
  };

  const handleFinalSave = () => {
    if (!currentLocation) {
        alert("Keine GPS Koordinaten vorhanden.");
        return;
    }
    const newLocation: GoldLocation = {
      id: crypto.randomUUID(),
      name,
      classification: classification!,
      customLayers: customLayers,
      rating: needsRating(classification) ? rating : undefined,
      note,
      images: image ? [image] : [],
      coordinates: currentLocation,
      timestamp: Date.now()
    };
    onSave(newLocation);
  };

  const renderClassStep = () => {
    const primaryLayers: Classification[] = [PresetLayers.GOLDHOEFFIG, PresetLayers.INTERESSANT, PresetLayers.NICHT_GOLDHOEFFIG];
    const customAvailableLayers = availableLayers.filter(l => !primaryLayers.includes(l));

    return (
      <div className="flex flex-col gap-6 animate-fade-in">
        <div className="flex flex-col gap-3">
          <label className="text-brand-text font-bold text-lg mb-1">Kategorie (Pflichtfeld)</label>
          {primaryLayers.map((cls) => (
            <button
              key={cls}
              onClick={() => setClassification(cls)}
              type="button"
              className={`p-4 rounded-xl text-left border-2 transition-all ${
                classification === cls
                  ? 'border-brand-gold bg-brand-bgAlt font-bold shadow-md'
                  : 'border-transparent bg-white hover:bg-gray-50'
              }`}
            >
              {cls}
            </button>
          ))}
        </div>

        {customAvailableLayers.length > 0 && (
          <div className="flex flex-col gap-3 mt-4">
            <label className="text-brand-text font-bold text-lg mb-1">Zusätzliche Ebenen (Optional)</label>
            {customAvailableLayers.map((cls) => {
              const isSelected = customLayers.includes(cls);
              return (
                <button
                  key={cls}
                  onClick={() => {
                    if (isSelected) {
                      setCustomLayers(prev => prev.filter(l => l !== cls));
                    } else {
                      setCustomLayers(prev => [...prev, cls]);
                    }
                  }}
                  type="button"
                  className={`p-4 rounded-xl text-left border-2 transition-all flex justify-between items-center ${
                    isSelected
                      ? 'border-brand-gold bg-brand-bgAlt font-bold shadow-md'
                      : 'border-transparent bg-white hover:bg-gray-50'
                  }`}
                >
                  {cls}
                  {isSelected && <Check size={20} className="text-brand-gold" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderNameStep = () => (
    <div className="flex flex-col gap-4 animate-fade-in">
      <label className="text-brand-text font-bold text-lg">Wie heißt dieser Ort?</label>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="z.B. Isar-Biegung Nord"
        className="p-4 rounded-lg border border-brand-bgSection bg-white text-lg focus:outline-none focus:ring-2 focus:ring-brand-gold w-full"
        autoFocus
      />
    </div>
  );

  const renderRatingStep = () => (
    <div className="flex flex-col gap-6 animate-fade-in">
      <label className="text-brand-text font-bold text-lg">
          {classification === PresetLayers.GOLDHOEFFIG ? 'Goldbewertung' : 'Bewertung'}
      </label>
      <div className="flex justify-center gap-2">
        {[1, 2, 3, 4, 5].map((val) => (
          <button
            key={val}
            onClick={() => setRating(val)}
            type="button"
            className={`w-12 h-12 rounded-full font-bold text-xl flex items-center justify-center transition-transform ${
              rating === val
                ? 'bg-brand-gold text-brand-text scale-110 shadow-lg'
                : 'bg-white text-gray-400 border border-gray-200'
            }`}
          >
            {val}
          </button>
        ))}
      </div>
      <p className="text-center text-brand-textSec text-sm">
        {rating === 1 ? 'Wenig' : rating === 5 ? 'Sehr viel!' : 'Solide'}
      </p>
    </div>
  );

  const renderDetailsStep = () => (
    <div className="flex flex-col gap-4 animate-fade-in">
      <label className="text-brand-text font-bold text-lg">Details (Optional)</label>
      
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Notizen zum Fundort..."
        className="p-3 rounded-lg border border-brand-bgSection bg-white h-32 focus:outline-none focus:ring-2 focus:ring-brand-gold resize-none"
      />

      <div className="bg-white p-4 rounded-lg border border-brand-bgSection">
        <label className="flex items-center gap-3 cursor-pointer">
           <div className="bg-brand-bgSection p-3 rounded-full text-brand-textSec">
              <Camera size={24} />
           </div>
           <span className="text-brand-text font-medium">Foto hinzufügen</span>
           <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        </label>
        {image && (
          <div className="mt-4 relative">
            <img src={image} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
            <button 
              onClick={() => setImage(null)}
              type="button"
              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow-md"
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="relative flex flex-col h-full w-full bg-brand-bg animate-fade-in">
      {showExitDialog && (
          <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-xl p-6 shadow-xl w-full max-w-sm">
                  <h3 className="text-lg font-bold text-brand-text mb-2">Vorgang abbrechen?</h3>
                  <p className="text-brand-textSec mb-6">Ungespeicherte Änderungen gehen verloren.</p>
                  <div className="flex gap-3">
                      <Button variant="ghost" onClick={() => setShowExitDialog(false)} className="flex-1">Zurück</Button>
                      <Button variant="danger" onClick={onCancel} className="flex-1">Verwerfen</Button>
                  </div>
              </div>
          </div>
      )}

      <div className="shrink-0 bg-brand-bg z-10">
          <div className="flex justify-end p-2">
            <button onClick={handleCloseTrigger} className="p-3 bg-white rounded-full shadow-sm text-gray-500 hover:text-red-500">
                <X size={24} />
            </button>
          </div>
          <div className="h-2 bg-gray-200 w-full">
            <div 
              className="h-full bg-brand-gold transition-all duration-300"
              style={{ width: step === 'NAME' ? '25%' : step === 'CLASSIFICATION' ? '50%' : step === 'RATING' ? '75%' : '100%' }}
            />
          </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 p-6 flex flex-col">
         <div>
           {step === 'NAME' && renderNameStep()}
           {step === 'CLASSIFICATION' && renderClassStep()}
           {step === 'RATING' && renderRatingStep()}
           {step === 'DETAILS' && renderDetailsStep()}
         </div>

         <div className="mt-8 flex gap-3 pb-12">
            <Button variant="ghost" onClick={handleBack} className="flex-1">
               {step === 'NAME' ? <><X size={20} className="mr-2 inline" /> Abbrechen</> : <><ArrowLeft size={20} className="mr-2 inline" /> Zurück</>}
            </Button>
            {step === 'DETAILS' ? (
              <Button variant="primary" onClick={handleFinalSave} className="flex-[2] font-bold">
                <Save size={20} className="mr-2 inline" /> Speichern
              </Button>
            ) : (
              <Button variant="secondary" onClick={handleNext} disabled={(step === 'NAME' && name.trim().length === 0) || (step === 'CLASSIFICATION' && !classification)} className="flex-[2]">
                Weiter <ArrowRight size={20} className="ml-2 inline" />
              </Button>
            )}
         </div>
      </div>
    </div>
  );
}