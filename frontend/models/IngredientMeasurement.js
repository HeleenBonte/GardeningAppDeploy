// Frontend IngredientMeasurement model
export function createIngredientMeasurement(overrides = {}) {
  return {
    id: overrides.id ?? Date.now().toString(),
    name: overrides.name ?? '',
  };
}

export default { createIngredientMeasurement };
