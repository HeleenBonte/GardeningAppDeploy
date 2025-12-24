import { useEffect, useState, useCallback } from 'react';
import { getUnitSystem, setUnitSystem as persistUnitSystem } from '../settings/storage';

const DEFAULT = 'metric';

export default function useUnitPreference() {
  const [unitSystem, setUnitSystemState] = useState(DEFAULT);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const stored = await getUnitSystem();
        if (!mounted) return;
        if (stored) setUnitSystemState(stored);
      } catch (e) {
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const setUnitSystem = useCallback(async (val) => {
    try {
      setUnitSystemState(val);
      await persistUnitSystem(val);
    } catch (e) {
    }
  }, []);

  return { unitSystem, setUnitSystem, loading, isImperial: unitSystem === 'imperial' };
}
