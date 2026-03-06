'use client';

import { Haptics, ImpactStyle } from '@capacitor/haptics';

export function useHaptics() {
  const triggerHaptic = async (style: ImpactStyle = ImpactStyle.Medium) => {
    try {
      await Haptics.impact({ style });
    } catch (error) {
      console.error('Haptics error:', error);
    }
  };

  const triggerNotification = async (type: 'success' | 'warning' | 'error' = 'success') => {
    try {
      await Haptics.notification({ type: type as any });
    } catch (error) {
      console.error('Haptics notification error:', error);
    }
  };

  const triggerVibrate = async (duration: number = 300) => {
    try {
      await Haptics.vibrate({ duration });
    } catch (error) {
      console.error('Haptics vibrate error:', error);
    }
  };

  return {
    triggerHaptic,
    triggerNotification,
    triggerVibrate,
  };
}
