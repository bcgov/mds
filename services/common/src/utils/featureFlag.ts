import flagsmith from "flagsmith";

// Name of feature flags. These correspond to feature flags defined in flagsmith.
export enum Feature {
  MAJOR_PROJECT_ARCHIVE_FILE = "major_project_archive_file",
  DOCUMENTS_REPLACE_FILE = "major_project_replace_file",
  MAJOR_PROJECT_ALL_DOCUMENTS = "major_project_all_documents",
  MAJOR_PROJECT_DECISION_PACKAGE = "major_project_decision_package",
  ESUP_PERMIT_AMENDMENT = "esup_permit_amendment",
  FLAGSMITH = "flagsmith",
  TSF_V2 = "tsf_v2",
  VERIFIABLE_CREDENTIALS = "verifiable_credentials",
  VERIFIABLE_CREDENTIALS_2 = "verifiable_credentials_2.0",
  MINESPACE_ESUPS = "minespace_esups",
  REPORT_ERROR = "report_error",
  MAJOR_PROJECT_LINK_PROJECTS = "major_project_link_projects",
  CODE_REQUIRED_REPORTS = "code_required_reports",
  AMS_AGENT = "ams_agent",
  HSRC_CODE_EDIT = "hsrc_code_edit",
  MULTIPART_UPLOAD = "s3_multipart_upload",
}

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
  return flagsmith.hasFeature(feature);
};
