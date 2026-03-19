import { PresetLayers } from './types';

export const DEFAULT_COORDINATES = { lat: 51.1657, lng: 10.4515 }; // Center of Germany

export const CLASSIFICATION_COLORS = {
  [PresetLayers.GOLDHOEFFIG]: '#C9A646', // Gold
  [PresetLayers.INTERESSANT]: '#3A5A40', // Green
  [PresetLayers.NICHT_GOLDHOEFFIG]: '#555555', // Grey
};

export const MAX_RATING = 5;