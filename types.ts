export const PresetLayers = {
  INTERESSANT: 'Interessant',
  NICHT_GOLDHOEFFIG: 'Nicht goldhöffig',
  GOLDHOEFFIG: 'Goldhöffig',
} as const;

// Allow string to support custom layers
export type Classification = typeof PresetLayers[keyof typeof PresetLayers] | string;

export interface CustomLayer {
  name: string;
  color: string;
}

export interface GeoCoordinates {
  lat: number;
  lng: number;
}

export interface GoldLocation {
  id: string;
  name: string;
  classification: Classification; // This will now be strictly one of the PresetLayers
  customLayers?: string[]; // Array of additional layer names
  rating?: number; // 1 to 5, for GOLDHOEFFIG and Custom layers
  note?: string;
  images: string[]; // Array of Base64 strings
  coordinates: GeoCoordinates;
  timestamp: number;
}

export type WizardStep = 'NAME' | 'CLASSIFICATION' | 'RATING' | 'DETAILS';