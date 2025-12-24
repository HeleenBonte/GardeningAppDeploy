export function createUserRecipeList(overrides = {}) {
  return {
    userId: overrides.userId ?? null,
    recipeId: overrides.recipeId ?? null,
  };
}

export default { createUserRecipeList };
