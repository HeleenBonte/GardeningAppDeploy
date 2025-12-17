// Frontend representation of a user-recipe join table
export function createUserRecipeList(overrides = {}) {
  return {
    userId: overrides.userId ?? null,
    recipeId: overrides.recipeId ?? null,
  };
}

export default { createUserRecipeList };
