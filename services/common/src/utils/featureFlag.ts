import { detectProdEnvironment as IN_PROD } from "./environmentUtils";

export enum Feature {
  MAJOR_PROJECT_ARCHIVE_FILE,
}

const Flags = {
  [Feature.MAJOR_PROJECT_ARCHIVE_FILE]: !IN_PROD(),
};

/**
 * Returns true if the given feature is enabled
 * @param feature Feature to verify
 * @returns true if the given feature is enabled
 */
export const isFeatureEnabled = (feature: Feature) => {
  if (feature in Flags) {
    return Flags[feature];
  }

  return false;
};
