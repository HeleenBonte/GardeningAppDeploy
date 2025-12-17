// Frontend RecipeQuantity model (joins Recipe <-> Ingredient with measurement)
export function createRecipeQuantity(overrides = {}) {
  return {
    id: overrides.id ?? Date.now().toString(),
    recipeId: overrides.recipeId ?? null,
    ingredientId: overrides.ingredientId ?? null,
    measurementId: overrides.measurementId ?? null,
    quantity: overrides.quantity ?? 0,
  };
}

export default { createRecipeQuantity };
