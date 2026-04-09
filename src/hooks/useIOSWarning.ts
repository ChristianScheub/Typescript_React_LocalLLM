import { useState, useEffect } from 'react';
import { Device } from '@capacitor/device';
import Logger from '@services/logger';

interface IOSWarning {
  isIOS: boolean;
  showIOSWarning: boolean;
}

export function useIOSWarning(provider: 'transformers' | 'webllm'): IOSWarning {
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSWarning, setShowIOSWarning] = useState(false);

  useEffect(() => {
    const checkPlatform = async () => {
      try {
        const info = await Device.getInfo();
        const isiOS = info.platform === 'ios';
        setIsIOS(isiOS);
        setShowIOSWarning(isiOS && provider === 'transformers');
        Logger.infoService(`[useIOSWarning] Device platform: ${info.platform}`);
      } catch (err) {
        Logger.errorStack('[useIOSWarning] Error checking device platform', err instanceof Error ? err : new Error(String(err)));
      }
    };
    checkPlatform();
  }, [provider]);

  return { isIOS, showIOSWarning };
}
