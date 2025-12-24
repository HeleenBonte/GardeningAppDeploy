import { useCallback, useEffect, useMemo, useState } from 'react';
import { getCrops, getIngredients, getRecipesByIngredient } from '../config/api';
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

  const [remoteRelated, setRemoteRelated] = useState(null);

  const relatedRecipes = useMemo(() => {
    if (!crop || !Array.isArray(recipes)) return [];

    const name = crop.name && String(crop.name).toLowerCase();

    return recipes.filter((r) => {
      if (Array.isArray(r.crops) && r.crops.some((c) => String(c) === String(crop.id) || (c && c.id && String(c.id) === String(crop.id)))) return true;
      if (Array.isArray(r.ingredients) && r.ingredients.some((ing) => (ing.cropId && String(ing.cropId) === String(crop.id)) || (ing.crop && String(ing.crop).toLowerCase().includes(name)) || (ing.name && String(ing.name).toLowerCase().includes(name)))) return true;
      if (r.name && name && String(r.name).toLowerCase().includes(name)) return true;
      if (r.description && name && String(r.description).toLowerCase().includes(name)) return true;
      return false;
    });
  }, [recipes, crop]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!crop) return;
        const allIngr = await getIngredients();
        const matching = Array.isArray(allIngr) ? allIngr.filter(i => String(i.cropId) === String(crop.id)) : [];
        if (!matching.length) return;
        const map = new Map();
        for (const ing of matching) {
          try {
            const res = await getRecipesByIngredient(ing.id);
            const list = Array.isArray(res) ? res : (res?.content ?? []);
            (list || []).forEach(r => { if (r && r.id) map.set(String(r.id), r); });
            } catch (e) {
            console.warn('getRecipesByIngredient failed for', ing.id, e);
          }
        }
        if (!mounted) return;
        const arr = Array.from(map.values());
        if (arr.length) setRemoteRelated(arr);
      } catch (e) {
        console.warn('Failed to fetch related recipes by ingredient', e);
      }
    })();
    return () => { mounted = false; };
  }, [crop]);

  try {
    const fallbackNames = (relatedRecipes || []).slice(0, 6).map(r => r.name || r.recipeName || r.id);
    const remoteNames = (remoteRelated || []).slice(0, 6).map(r => r.name || r.recipeName || r.id);
    console.debug('[useCropDetail] crop=', crop?.name, 'recipes total=', Array.isArray(recipes) ? recipes.length : 0, 'relatedFallback=', (relatedRecipes || []).length, 'relatedRemote=', (remoteRelated || []).length, 'sampleFallback=', fallbackNames, 'sampleRemote=', remoteNames);
  } catch (e) {  }

  const reload = useCallback(async () => {
    await fetchCrop();
    await reloadRecipes();
  }, [fetchCrop, reloadRecipes]);

  return {
    crop,
    relatedRecipes: Array.isArray(remoteRelated) && remoteRelated.length ? remoteRelated : relatedRecipes,
    loading: loading || recipesLoading,
    error: error || recipesError,
    reload,
  };
}
