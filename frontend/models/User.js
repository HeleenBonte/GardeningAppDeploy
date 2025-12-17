// Simple User model for frontend usage
export function createUser(overrides = {}) {
  return {
    id: overrides.id ?? Date.now().toString(),
    name: overrides.name ?? '',
    email: overrides.email ?? '',
  };
}

export default { createUser };
