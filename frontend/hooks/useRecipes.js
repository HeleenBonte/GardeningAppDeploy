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
      const list = Array.isArray(res) ? res : [];
      console.debug('[useRecipes] fetched recipes:', Array.isArray(list) ? list.length : 0);
      setRecipes(list);
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
