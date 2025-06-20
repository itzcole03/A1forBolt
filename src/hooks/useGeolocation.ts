import { useState, useEffect } from 'react';

interface GeolocationState {
  loading: boolean;
  accuracy: number | null;
  altitude: number | null;
  altitudeAccuracy: number | null;
  heading: number | null;
  latitude: number | null;
  longitude: number | null;
  speed: number | null;
  timestamp: number | null;
  error: GeolocationPositionError | null;
}

interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

export const useGeolocation = (options: GeolocationOptions = {}) => {
  const [state, setState] = useState<GeolocationState>({
    loading: true,
    accuracy: null,
    altitude: null,
    altitudeAccuracy: null,
    heading: null,
    latitude: null,
    longitude: null,
    speed: null,
    timestamp: null,
    error: null,
  });

  useEffect(() => {
    const { enableHighAccuracy = true, timeout = 5000, maximumAge = 0 } = options;

    const onSuccess = (position: GeolocationPosition) => {
      setState({
        loading: false,
        accuracy: position.coords.accuracy,
        altitude: position.coords.altitude,
        altitudeAccuracy: position.coords.altitudeAccuracy,
        heading: position.coords.heading,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        speed: position.coords.speed,
        timestamp: position.timestamp,
        error: null,
      });
    };

    const onError = (error: GeolocationPositionError) => {
      setState(prev => ({
        ...prev,
        loading: false,
        error,
      }));
    };

    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: {
          code: 2,
          message: 'Geolocation is not supported by your browser',
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3,
        },
      }));
      return;
    }

    const watchId = navigator.geolocation.watchPosition(onSuccess, onError, {
      enableHighAccuracy,
      timeout,
      maximumAge,
    });

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [options]);

  return state;
};

// Example usage:
// const {
//   loading,
//   latitude,
//   longitude,
//   accuracy,
//   error,
// } = useGeolocation({
//   enableHighAccuracy: true,
//   timeout: 5000,
//   maximumAge: 0,
// });
//
// if (loading) return <div>Loading...</div>;
// if (error) return <div>Error: {error.message}</div>;
//
// return (
//   <div>
//     <p>Latitude: {latitude}</p>
//     <p>Longitude: {longitude}</p>
//     <p>Accuracy: {accuracy} meters</p>
//   </div>
// );
