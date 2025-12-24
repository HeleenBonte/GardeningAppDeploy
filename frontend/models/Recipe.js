export function createRecipe(overrides = {}) {
  return {
    id: overrides.id ?? Date.now().toString(),
    name: overrides.name ?? overrides.title ?? '',
    description: overrides.description ?? '',
    prepTime: overrides.prepTime ?? overrides.prep_time ?? '00:15',
    cookTime: overrides.cookTime ?? overrides.cook_time ?? '00:30',
    categoryId: overrides.categoryId ?? null,
    courseId: overrides.courseId ?? null,
    author: overrides.author ?? null,
    image: overrides.image ?? null,
    steps: overrides.steps ?? [],
    ingredients: overrides.ingredients ?? [],
  };
}

export default { createRecipe };
