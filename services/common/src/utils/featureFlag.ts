import { detectProdEnvironment as IN_PROD } from "./environmentUtils";
import flagsmith from "flagsmith";

// Name of feature flags. These correspond to feature flags defined in flagsmith.
export enum Feature {
  MAJOR_PROJECT_ARCHIVE_FILE = "major_project_archive_file",
  DOCUMENTS_REPLACE_FILE = "major_project_replace_file",
  MAJOR_PROJECT_ALL_DOCUMENTS = "major_project_all_documents",
  MAJOR_PROJECT_DECISION_PACKAGE = "major_project_decision_package",
  FLAGSMITH = "flagsmith",
  TSF_V2 = "tsf_v2",
}

// Definition of legacy flags
// TODO: Remove after flagsmith is live
const Flags = {
  [Feature.MAJOR_PROJECT_ARCHIVE_FILE]: !IN_PROD(),
  [Feature.DOCUMENTS_REPLACE_FILE]: !IN_PROD(),
  [Feature.MAJOR_PROJECT_ALL_DOCUMENTS]: !IN_PROD(),
  [Feature.MAJOR_PROJECT_DECISION_PACKAGE]: !IN_PROD(),
  [Feature.TSF_V2]: !IN_PROD(),
  [Feature.FLAGSMITH]: !IN_PROD(),
};

export const initializeFlagsmith = async (flagsmithUrl, flagsmithKey) => {
  await flagsmith.init({
    api: flagsmithUrl,
    environmentID: flagsmithKey,
    cacheFlags: true,
    enableAnalytics: true,
  });
};

/**
 * Returns true if the given feature is enabled
 * @param feature Feature to verify
 * @returns true if the given feature is enabled
 */
export const isFeatureEnabled = (feature: Feature) => {
  if (Feature.FLAGSMITH in Flags && Flags[Feature.FLAGSMITH]) {
    return flagsmith.hasFeature(feature);
  }

  if (feature in Flags) {
    return Flags[feature];
  }

  return false;
};
