// Frontend RecipeStep model
export function createRecipeStep(overrides = {}) {
  return {
    id: overrides.id ?? Date.now().toString(),
    recipeId: overrides.recipeId ?? null,
    stepNumber: overrides.stepNumber ?? 1,
    description: overrides.description ?? '',
  };
}

export default { createRecipeStep };
