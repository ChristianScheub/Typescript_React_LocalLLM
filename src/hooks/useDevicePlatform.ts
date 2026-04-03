import { useState, useEffect } from 'react';

type Platform = 'ios' | 'android' | 'web' | 'unknown';

interface DeviceInfo {
  platform: Platform;
  isNative: boolean;
  isMobile: boolean;
}

/**
 * Hook to detect device platform and check if device is mobile.
 * Uses Capacitor Device API when available.
 */
export function useDevicePlatform(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    platform: 'web',
    isNative: false,
    isMobile: window.innerWidth < 768,
  });

  useEffect(() => {
    const detectPlatform = async () => {
      try {
        // Dynamically import Capacitor to avoid module resolution errors at build time
        // Use string concatenation to prevent static import analysis by Vite
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const moduleName = '@capacitor' + '/' + 'device';
        // @ts-ignore - Capacitor types may not be available in all builds
        // @vite-ignore - Dynamic import with concatenated string is intentional
        const capacitorDevice: any = await (import(moduleName) as any);
        const Device = capacitorDevice.Device;
        const info = await Device.getInfo();
        const platform = (info.platform as string).toLowerCase() as Platform;
        const isNative = platform === 'ios' || platform === 'android';
        const isMobile = isNative || window.innerWidth < 768;

        setDeviceInfo({
          platform: isNative ? platform : 'web',
          isNative,
          isMobile,
        });
      } catch (error) {
        // Fallback if Capacitor is not available
        const isMobile = window.innerWidth < 768;
        setDeviceInfo({
          platform: 'web',
          isNative: false,
          isMobile,
        });
      }
    };

    detectPlatform();

    // Listen to window resize for responsive behavior
    const handleResize = () => {
      setDeviceInfo(prev => ({
        ...prev,
        isMobile: prev.isNative || window.innerWidth < 768,
      }));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return deviceInfo;
}
