import { useState, useEffect } from 'react';

interface DeviceOrientationState {
  alpha: number | null;
  beta: number | null;
  gamma: number | null;
  absolute: boolean | null;
  error: Error | null;
}

export const useDeviceOrientation = (): DeviceOrientationState => {
  const [state, setState] = useState<DeviceOrientationState>({
    alpha: null,
    beta: null,
    gamma: null,
    absolute: null,
    error: null,
  });

  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      setState({
        alpha: event.alpha,
        beta: event.beta,
        gamma: event.gamma,
        absolute: event.absolute,
        error: null,
      });
    };

    const handleError = (error: Error) => {
      setState(prev => ({
        ...prev,
        error,
      }));
    };

    if (window.DeviceOrientationEvent) {
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        // iOS 13+ requires permission
        (DeviceOrientationEvent as any)
          .requestPermission()
          .then((permissionState: string) => {
            if (permissionState === 'granted') {
              window.addEventListener('deviceorientation', handleOrientation);
            } else {
              handleError(new Error('Permission to access device orientation was denied'));
            }
          })
          .catch(handleError);
      } else {
        // Non-iOS devices
        window.addEventListener('deviceorientation', handleOrientation);
      }
    } else {
      handleError(new Error('Device orientation not supported'));
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  return state;
};

// Example usage:
// const { alpha, beta, gamma, absolute, error } = useDeviceOrientation();
//
// if (error) return <div>Error: {error.message}</div>;
//
// return (
//   <div>
//     <p>Alpha (z-axis rotation): {alpha}°</p>
//     <p>Beta (x-axis rotation): {beta}°</p>
//     <p>Gamma (y-axis rotation): {gamma}°</p>
//     <p>Absolute: {absolute ? 'Yes' : 'No'}</p>
//   </div>
// );
