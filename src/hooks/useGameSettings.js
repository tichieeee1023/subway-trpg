import { useLayoutEffect, useState } from 'react';

const key = 'subway-settings-v1';
export function useGameSettings() {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(key) || '{}');
      return { textSize: saved.textSize === 'large' ? 'large' : 'normal', disableEffects: saved.disableEffects === true, skipDiceAnimation: saved.skipDiceAnimation === true, easyMode: saved.easyMode === true };
    } catch { return { textSize: 'normal', disableEffects: false, skipDiceAnimation: false, easyMode: false }; }
  });
  useLayoutEffect(() => {
    document.documentElement.dataset.textSize = settings.textSize;
    document.documentElement.dataset.effects = settings.disableEffects ? 'off' : 'on';
    try { localStorage.setItem(key, JSON.stringify(settings)); } catch { /* Settings still work for this session. */ }
  }, [settings]);
  return { settings, updateSettings: (patch) => setSettings((previous) => ({ ...previous, ...patch })) };
}
