import flagsmith from "flagsmith";
import { ENVIRONMENT } from "@mds/common/constants/environment";
import featureFlags from "./feature_flags.json";

// Name of feature flags. These correspond to feature flags defined in flagsmith.
export enum Feature {
  MAJOR_PROJECT_ARCHIVE_FILE = "major_project_archive_file",
  DOCUMENTS_REPLACE_FILE = "major_project_replace_file",
  MAJOR_PROJECT_ALL_DOCUMENTS = "major_project_all_documents",
  MAJOR_PROJECT_DECISION_PACKAGE = "major_project_decision_package",
  FLAGSMITH = "flagsmith",
  TSF_V2 = "tsf_v2",
  TSF_TERMINATE_APPTS = "tsf_terminate_appts",
  VC_ANONCREDS_CORE = "vc_anoncreds_core",
  VC_ANONCREDS_MINESPACE = "vc_anoncreds_minespace",
  VC_W3C = "vc_w3c",
  MINESPACE_ESUPS = "minespace_esups",
  MINESPACE_NOW_STATUS = "minespace_now_status",
  MINESPACE_NOW_APPLICATION_DETAILS_VIEW = "minespace_now_application_details_view",
  REPORT_ERROR = "report_error",
  MAJOR_PROJECT_LINK_PROJECTS = "major_project_link_projects",
  AMS_AGENT = "ams_agent",
  AMS_FINAL_APPLICATION = 'ams_final_application',
  HSRC_CODE_EDIT = "hsrc_code_edit",
  MULTIPART_UPLOAD = "s3_multipart_upload",
  DIGITIZED_PERMITS = "digitized_permits",
  SPATIAL_BUNDLE = "spatial_bundle",
  PERMIT_CONDITIONS_PAGE = "permit_conditions_page",
  PERMIT_CONDITIONS_PDF_SPLIT_VIEW = "permit_conditions_pdf_split_view",
  PERMIT_CONDITION_TAGS = "permit_condition_tags",
  MODIFY_PERMIT_CONDITIONS = "modify_permit_conditions",
  MAJOR_PROJECT_REFACTOR = "major_project_refactor",
  HELP_GUIDE = "help_guide",
  PERMIT_CONDITION_SEARCH = "PERMIT_CONDITION_SEARCH",
  STANDARD_PERMIT_CONDITIONS_EDITOR = "standard_permit_conditions_new_editor",
  NOW_PERMIT_CONDITIONS_EDITOR = "now_permit_conditions_new_editor",
  REPORT_MANAGEMENT_V2 = "report_management_v2",
  MINESPACE_SIGNUP = "minespace_signup",
  GLOBAL_SEARCH_V2 = "global_search_v2",
  NOTICE_OF_WORK_TIER = "notice_of_work_tier",
  NOW_APPLICATION_DOCUMENT_SEARCH = "now_application_document_search",
  NOTICE_OF_WORK_NATIONS = 'notice_of_work_nations',
  INSPECTOR_PERMIT_PACKAGE_TYPE_SELECTOR = "inspector_permit_package_type_selector",
}

export const initializeFlagsmith = async (flagsmithUrl, flagsmithKey) => {
  if (ENVIRONMENT.flagsmithLocal) {
    // Skip flagsmith initialization in local eval mode
    return;
  }
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
  if (ENVIRONMENT.flagsmithLocal) {
    // Use the value from the local JSON file
    return featureFlags[feature] ?? false;
  }
  return flagsmith.hasFeature(feature);
};
