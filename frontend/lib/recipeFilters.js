export function filterRecipe(recipe, { search, selectedFilters }) {
  const term = (search || '').trim().toLowerCase();
  const active = (selectedFilters || []).map((s) => String(s).toLowerCase());

  const haystack = `${recipe.name || ''} ${recipe.description || ''} ${(recipe.ingredients || []).map(i => i.name || '').join(' ')}`.toLowerCase();

  const matchesSearch = term.length === 0 || haystack.includes(term);
  const matchesFilter = active.length === 0 || active.some((f) => haystack.includes(f));
  return matchesSearch && matchesFilter;
}
