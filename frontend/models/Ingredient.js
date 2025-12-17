// Frontend Ingredient model
export function createIngredient(overrides = {}) {
  return {
    id: overrides.id ?? Date.now().toString(),
    name: overrides.name ?? '',
    cropId: overrides.cropId ?? null,
  };
}

export default { createIngredient };
