// Frontend Category model
export function createCategory(overrides = {}) {
  return {
    id: overrides.id ?? Date.now().toString(),
    name: overrides.name ?? '',
  };
}

export default { createCategory };
