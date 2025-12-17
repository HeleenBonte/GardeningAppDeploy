import { useCallback, useEffect, useState } from 'react';
import { getRecipes } from '../config/api';

export default function useRecipes() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getRecipes();
      setRecipes(Array.isArray(res) ? res : []);
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

  return { recipes, loading, error, reload: load };
}
