import { useState, useEffect } from 'react';

interface DeviceMotionState {
  acceleration: {
    x: number | null;
    y: number | null;
    z: number | null;
  };
  accelerationIncludingGravity: {
    x: number | null;
    y: number | null;
    z: number | null;
  };
  rotationRate: {
    alpha: number | null;
    beta: number | null;
    gamma: number | null;
  };
  interval: number | null;
  error: Error | null;
}

export const useDeviceMotion = (): DeviceMotionState => {
  const [state, setState] = useState<DeviceMotionState>({
    acceleration: {
      x: null,
      y: null,
      z: null,
    },
    accelerationIncludingGravity: {
      x: null,
      y: null,
      z: null,
    },
    rotationRate: {
      alpha: null,
      beta: null,
      gamma: null,
    },
    interval: null,
    error: null,
  });

  useEffect(() => {
    const handleMotion = (event: DeviceMotionEvent) => {
      setState({
        acceleration: {
          x: event.acceleration?.x ?? null,
          y: event.acceleration?.y ?? null,
          z: event.acceleration?.z ?? null,
        },
        accelerationIncludingGravity: {
          x: event.accelerationIncludingGravity?.x ?? null,
          y: event.accelerationIncludingGravity?.y ?? null,
          z: event.accelerationIncludingGravity?.z ?? null,
        },
        rotationRate: {
          alpha: event.rotationRate?.alpha ?? null,
          beta: event.rotationRate?.beta ?? null,
          gamma: event.rotationRate?.gamma ?? null,
        },
        interval: event.interval,
        error: null,
      });
    };

    const handleError = (error: Error) => {
      setState(prev => ({
        ...prev,
        error,
      }));
    };

    if (window.DeviceMotionEvent) {
      if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
        // iOS 13+ requires permission
        (DeviceMotionEvent as any)
          .requestPermission()
          .then((permissionState: string) => {
            if (permissionState === 'granted') {
              window.addEventListener('devicemotion', handleMotion);
            } else {
              handleError(new Error('Permission to access device motion was denied'));
            }
          })
          .catch(handleError);
      } else {
        // Non-iOS devices
        window.addEventListener('devicemotion', handleMotion);
      }
    } else {
      handleError(new Error('Device motion not supported'));
    }

    return () => {
      window.removeEventListener('devicemotion', handleMotion);
    };
  }, []);

  return state;
};

// Example usage:
// const {
//   acceleration,
//   accelerationIncludingGravity,
//   rotationRate,
//   interval,
//   error,
// } = useDeviceMotion();
//
// if (error) return <div>Error: {error.message}</div>;
//
// return (
//   <div>
//     <h3>Acceleration (excluding gravity)</h3>
//     <p>X: {acceleration.x} m/s²</p>
//     <p>Y: {acceleration.y} m/s²</p>
//     <p>Z: {acceleration.z} m/s²</p>
//
//     <h3>Acceleration (including gravity)</h3>
//     <p>X: {accelerationIncludingGravity.x} m/s²</p>
//     <p>Y: {accelerationIncludingGravity.y} m/s²</p>
//     <p>Z: {accelerationIncludingGravity.z} m/s²</p>
//
//     <h3>Rotation Rate</h3>
//     <p>Alpha: {rotationRate.alpha}°/s</p>
//     <p>Beta: {rotationRate.beta}°/s</p>
//     <p>Gamma: {rotationRate.gamma}°/s</p>
//
//     <p>Interval: {interval}ms</p>
//   </div>
// );
