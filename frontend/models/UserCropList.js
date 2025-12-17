// Frontend representation of a user-crop join table
export function createUserCropList(overrides = {}) {
  return {
    userId: overrides.userId ?? null,
    cropId: overrides.cropId ?? null,
  };
}

export default { createUserCropList };
