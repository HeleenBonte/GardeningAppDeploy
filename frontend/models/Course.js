export function createCourse(overrides = {}) {
  return {
    id: overrides.id ?? Date.now().toString(),
    name: overrides.name ?? '',
  };
}

export default { createCourse };
