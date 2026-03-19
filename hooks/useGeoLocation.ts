import { useState, useEffect } from 'react';
import { GeoCoordinates } from '../types';

export const useGeoLocation = () => {
  const [coordinates, setCoordinates] = useState<GeoCoordinates | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolokalisation wird von diesem Browser nicht unterstützt.');
      setLoading(false);
      return;
    }

    const handleSuccess = (position: GeolocationPosition) => {
      setCoordinates({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
      setLoading(false);
    };

    const handleError = (error: GeolocationPositionError) => {
      setError(`Fehler bei der Standortbestimmung: ${error.message}`);
      setLoading(false);
    };

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    };

    const watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, options);

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return { coordinates, loading, error };
};