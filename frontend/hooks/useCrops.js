import { useState, useEffect, useCallback } from 'react';
import { getCrops, getRecipes } from '../config/api';

export default function useCrops() {
  const [crops, setCrops] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [cropsRes, recipesRes] = await Promise.all([getCrops(), getRecipes()]);
      setCrops(Array.isArray(cropsRes) ? cropsRes : []);
      setRecipes(Array.isArray(recipesRes) ? recipesRes : []);
      setError(null);
    } catch (err) {
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    if (mounted) load();
    return () => { mounted = false; };
  }, [load]);

  return { crops, recipes, loading, error, reload: load };
}
