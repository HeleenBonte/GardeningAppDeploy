import { useCallback, useEffect, useMemo, useState } from 'react';
import { getCrops } from '../config/api';
import useRecipes from './useRecipes';

export default function useCropDetail({ id, initialCrop = null } = {}) {
  const [crop, setCrop] = useState(initialCrop);
  const [loading, setLoading] = useState(!initialCrop && !!id);
  const [error, setError] = useState(null);

  const { recipes, loading: recipesLoading, error: recipesError, reload: reloadRecipes } = useRecipes();

  const fetchCrop = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const crops = await getCrops();
      const found = Array.isArray(crops) ? crops.find((c) => String(c.id) === String(id)) : null;
      setCrop(found ?? initialCrop ?? null);
    } catch (err) {
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }, [id, initialCrop]);

  useEffect(() => {
    if (!initialCrop && id) fetchCrop();
  }, [id, initialCrop, fetchCrop]);

  const relatedRecipes = useMemo(() => {
    if (!crop || !Array.isArray(recipes)) return [];

    const name = crop.name && String(crop.name).toLowerCase();

    return recipes.filter((r) => {
      // Heuristics: recipe may include crop id in `crops` or `ingredients`, or crop name in text fields
      if (Array.isArray(r.crops) && r.crops.some((c) => String(c) === String(crop.id) || (c && c.id && String(c.id) === String(crop.id)))) return true;
      if (Array.isArray(r.ingredients) && r.ingredients.some((ing) => (ing.cropId && String(ing.cropId) === String(crop.id)) || (ing.crop && String(ing.crop).toLowerCase().includes(name)) || (ing.name && String(ing.name).toLowerCase().includes(name)))) return true;
      if (r.name && name && String(r.name).toLowerCase().includes(name)) return true;
      if (r.description && name && String(r.description).toLowerCase().includes(name)) return true;
      return false;
    });
  }, [recipes, crop]);

  const reload = useCallback(async () => {
    await fetchCrop();
    await reloadRecipes();
  }, [fetchCrop, reloadRecipes]);

  return {
    crop,
    relatedRecipes,
    loading: loading || recipesLoading,
    error: error || recipesError,
    reload,
  };
}
