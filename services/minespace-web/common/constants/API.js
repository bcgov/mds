import queryString from "query-string";

export const CORE_STATIC_CONTENT = "/exports/core-static-content";

// Network URL's
export const MINE = "/mines";
export const MINE_LIST = "/mines";
export const SUBSCRIPTION = (mineGuid) => `/mines/${mineGuid}/subscribe`;
export const MINE_SUBSCRIPTION = "/mines/subscribe";
export const MINE_LIST_QUERY = (params) => `/mines${params}`;
export const PARTIES_LIST_QUERY = (params = {}) => `/parties?${queryString.stringify(params)}`;
export const MINE_MAP_LIST = "/mines/map-list";
export const MINE_BASIC_INFO_LIST = `/mines/basicinfo`;
export const PARTY = "/parties";
export const MANAGER = "/parties/managers";
export const PARTY_RELATIONSHIP = "/parties/mines";
export const PARTY_ORGBOOK_ENTITY = (partyGuid) => `/parties/${partyGuid}/orgbook-entity`;
export const MERGE_PARTIES = () => `/parties/merge`;
export const PERMITTEE = "/permits/permittees";
export const MINE_NAME_LIST = (params = {}) => `/mines/search?${queryString.stringify(params)}`;
export const MINE_STATUS = "/mines/status";
export const MINE_REGION = "/mines/region";
export const MINE_COMPLIANCE_SUMMARY = (mine_guid) => `/mines/${mine_guid}/compliance/summary`;
export const MINE_TSFS = (mine_guid) => `/mines/${mine_guid}/tailings`;
export const MINE_TSF = (mine_guid, mine_tailings_storage_facility_guid) =>
  `/mines/${mine_guid}/tailings/${mine_tailings_storage_facility_guid}`;
export const DISTURBANCE_CODES = "/mines/disturbance-codes";
export const COMMODITY_CODES = "/mines/commodity-codes";
export const EDIT_TSF_REPORT = "";
export const MINE_DOCUMENTS = (mine_guid) => `/mines/${mine_guid}/documents`;
export const MINE_TSF_REQUIRED_DOCUMENTS = "/required-documents?category=TSF";
export const MINE_TENURE_TYPES = "/mines/mine-tenure-type-codes";
export const MINE_TYPES = (mineGuid) => `/mines/${mineGuid}/mine-types`;
export const MINE_TYPES_DETAILS = "/mines/mine-types/details";
export const DOCUMENT_MANAGER_FILE_GET_URL = (token = {}) =>
  `/documents?${queryString.stringify(token)}`;
export const DOCUMENT_MANAGER_TOKEN_GET_URL = (documentManagerGuid) =>
  `/download-token/${documentManagerGuid}`;
export const DOCUMENT_MANAGER_DOCUMENT = (documentManagerGuid) =>
  `/documents/${documentManagerGuid}`;
export const MINESPACE_USER = "/users/minespace";
export const UPDATE_MINESPACE_USER = (id) => `/users/minespace/${id}`;
export const PROVINCE_CODES = "/parties/sub-division-codes";

// EMLI contacts
export const EMLI_CONTACTS = "/EMLI-contacts";
export const EMLI_CONTACTS_BY_REGION = (region, isMajorMine) =>
  `/EMLI-contacts/${region}/contacts?is_major_mine=${isMajorMine}`;
export const EMLI_CONTACT = (guid) => `/EMLI-contacts/${guid}`;

export const MINE_VERIFIED_STATUSES = (params = {}) =>
  `/mines/verified-status?${queryString.stringify(params)}`;
export const MINE_VERIFIED_STATUS = (mine_guid) => `/mines/${mine_guid}/verified-status`;

// Permits
export const PERMIT_STATUS_CODES = () => `/mines/permits/status-codes`;
export const PERMITS = (mineGuid) => `/mines/${mineGuid}/permits`;
export const PERMIT_AMENDMENTS = (mineGuid, permitGuid) =>
  `/mines/${mineGuid}/permits/${permitGuid}/amendments`;
export const PERMIT_AMENDMENT = (mineGuid, permitGuid, permitAmendmentGuid) =>
  `/mines/${mineGuid}/permits/${permitGuid}/amendments/${permitAmendmentGuid}`;

export const PERMIT_AMENDMENT_VC = (mineGuid, permitGuid, permitAmendmentGuid) =>
  `/mines/${mineGuid}/permits/${permitGuid}/amendments/${permitAmendmentGuid}/verifiable-credential`;
export const PERMIT_AMENDMENT_DOCUMENT = (
  mineGuid,
  permitGuid,
  permitAmendmentGuid,
  documentGuid
) =>
  `/mines/${mineGuid}/permits/${permitGuid}/amendments/${permitAmendmentGuid}/documents/${documentGuid}`;
export const PERMIT_DELETE = (mineGuid, permitGuid) => `/mines/${mineGuid}/permits/${permitGuid}`;
export const DRAFT_PERMITS = (mineGuid, nowApplicationGuid) =>
  `/mines/${mineGuid}/permits?now_application_guid=${nowApplicationGuid}`;
export const PERMIT_CONDITIONS = (mineGuid, permitGuid, permitAmendmentGuid) =>
  `/mines/${mineGuid}/permits/${permitGuid}/amendments/${permitAmendmentGuid}/conditions`;
export const PERMIT_CONDITION = (mineGuid, permitGuid, permitAmendmentGuid, permitConditionGuid) =>
  `/mines/${mineGuid}/permits/${permitGuid}/amendments/${permitAmendmentGuid}/conditions/${permitConditionGuid}`;

export const STANDARD_PERMIT_CONDITIONS = (noticeOfWorkType) =>
  `/mines/permits/standard-conditions/${noticeOfWorkType}`;
export const STANDARD_PERMIT_CONDITION = (permitConditionGuid) =>
  `/mines/permits/standard-conditions/${permitConditionGuid}`;

// Permits - Notices of Departure
export const NOTICES_OF_DEPARTURE = () => `/notices-of-departure`;
export const NOTICE_OF_DEPARTURE = (noticeOfDepartureGuid) =>
  `/notices-of-departure/${noticeOfDepartureGuid}`;
export const NOTICES_OF_DEPARTURE_DOCUMENTS = (noticeOfDepartureGuid) =>
  `/notices-of-departure/${noticeOfDepartureGuid}/documents`;
export const NOTICES_OF_DEPARTURE_DOCUMENT = (noticeOfDepartureGuid, documentGuid) =>
  `/notices-of-departure/${noticeOfDepartureGuid}/documents/${documentGuid}`;

// Explosive Storage & Use Permits
export const EXPLOSIVES_PERMITS = (mineGuid) => `/mines/${mineGuid}/explosives-permits`;
export const EXPLOSIVES_PERMIT = (mineGuid, explosivesPermitGuid) =>
  `/mines/${mineGuid}/explosives-permits/${explosivesPermitGuid}`;
export const EXPLOSIVES_PERMIT_DOCUMENTS = (mineGuid, guid) =>
  `/mines/${mineGuid}/explosives-permits/${guid}/documents`;
export const EXPLOSIVES_PERMIT_DOCUMENT_TYPE_OPTIONS = "/mines/explosives-permit-document-types";

// EPIC Mine Information
export const EPIC_INFO = (mineGuid) => `/mines/${mineGuid}/epic`;

// Search
export const SEARCH = (params) => (params ? `/search?${queryString.stringify(params)}` : "/search");
export const SEARCH_OPTIONS = "/search/options";
export const SIMPLE_SEARCH = "/search/simple";

// Reporting
export const DASHBOARD = (dashboardId) => `/reporting/dashboard/${dashboardId}`;

// Variances
export const COMPLIANCE_CODES = "/compliance/codes";
export const MINE_VARIANCES = (mineGuid) => `/mines/${mineGuid}/variances`;
export const VARIANCES = (params = {}) => `/variances?${queryString.stringify(params)}`;
export const VARIANCE = (mineGuid, varianceGuid) => `/mines/${mineGuid}/variances/${varianceGuid}`;
export const VARIANCE_DOCUMENTS = (mineGuid, varianceGuid) =>
  `/mines/${mineGuid}/variances/${varianceGuid}/documents`;
export const VARIANCE_DOCUMENT = (mineGuid, varianceGuid, documentManagerGuid) =>
  `/mines/${mineGuid}/variances/${varianceGuid}/documents/${documentManagerGuid}`;
export const VARIANCE_STATUS_CODES = "/variances/status-codes";
export const VARIANCE_DOCUMENT_CATEGORY_OPTIONS = "/variances/document-categories";

// Project & Project Summaries
export const PROJECTS = (mineGuid) => `/projects?${queryString.stringify({ mine_guid: mineGuid })}`;
export const PROJECT = (projectGuid) => `/projects/${projectGuid}`;
export const PROJECT_PROJECT_SUMMARIES = (projectGuid, params = {}) =>
  `/projects/${projectGuid}/project-summaries?${queryString.stringify(params)}`;
export const NEW_PROJECT_SUMMARY = () => "/projects/new/project-summaries/new";
export const PROJECT_SUMMARY = (projectGuid, projectSummaryGuid) =>
  `/projects/${projectGuid}/project-summaries/${projectSummaryGuid}`;
export const PROJECT_SUMMARY_DOCUMENTS = ({ projectGuid, projectSummaryGuid, mineGuid }) =>
  `/projects/${projectGuid}/project-summaries/${projectSummaryGuid}/documents?${queryString.stringify(
    { mine_guid: mineGuid }
  )}`;
export const PROJECT_SUMMARY_DOCUMENT = (
  projectGuid,
  projectSummaryGuid,
  mineDocumentGuid,
  params = {}
) =>
  `/projects/${projectGuid}/project-summaries/${projectSummaryGuid}/documents/${mineDocumentGuid}?${queryString.stringify(
    params
  )}`;
export const DECISION_PACKAGE = () => `/`;
export const MAJOR_PROJECT_DASHBOARD = (params = {}) =>
  `/projects/dashboard?${queryString.stringify(params)}`;

// Information Requirements Table (IRT)
export const REQUIREMENT = (requirementGuid) => `/projects/requirements/${requirementGuid}`;
export const REQUIREMENTS = `/projects/requirements`;
export const INFORMATION_REQUIREMENTS_TABLE_TEMPLATE_DOWNLOAD = `/projects/information-requirements-table/template-download`;
export const INFORMATION_REQUIREMENTS_TABLE_DOCUMENTS = (projectGuid) =>
  `/projects/${projectGuid}/information-requirements-table/documents`;
export const INFORMATION_REQUIREMENTS_TABLE_DOCUMENT = (projectGuid, irtGuid, mineDocumentGuid) =>
  `/projects/${projectGuid}/information-requirements-table/${irtGuid}/documents/${mineDocumentGuid}`;
export const INFORMATION_REQUIREMENTS_TABLES = (projectGuid) =>
  `/projects/${projectGuid}/information-requirements-table`;
export const INFORMATION_REQUIREMENTS_TABLE = (projectGuid, irtGuid) =>
  `/projects/${projectGuid}/information-requirements-table/${irtGuid}`;

// Major mine application
export const MAJOR_MINE_APPLICATIONS = (projectGuid) =>
  `/projects/${projectGuid}/major-mine-application`;
export const MAJOR_MINE_APPLICATION = (projectGuid, majorMineApplicationGuid) =>
  `/projects/${projectGuid}/major-mine-application/${majorMineApplicationGuid}`;
export const MAJOR_MINE_APPLICATION_DOCUMENTS = (projectGuid) =>
  `/projects/${projectGuid}/major-mine-application/documents`;
export const MAJOR_MINE_APPLICATION_DOCUMENT = (
  projectGuid,
  majorMineApplicationGuid,
  mineDocumentGuid
) =>
  `/projects/${projectGuid}/major-mine-application/${majorMineApplicationGuid}/documents/${mineDocumentGuid}`;

// Project Decision Package
export const PROJECT_DECISION_PACKAGES = (projectGuid) =>
  `/projects/${projectGuid}/project-decision-package`;
export const PROJECT_DECISION_PACKAGE = (projectGuid, projectDecisionPackageGuid) =>
  `/projects/${projectGuid}/project-decision-package/${projectDecisionPackageGuid}`;
export const PROJECT_DECISION_PACKAGE_DOCUMENTS = (projectGuid) =>
  `/projects/${projectGuid}/project-decision-package/documents`;
export const PROJECT_DECISION_PACKAGE_DOCUMENT = (
  projectGuid,
  projectDecisionPackageGuid,
  mineDocumentGuid
) =>
  `/projects/${projectGuid}/project-decision-package/${projectDecisionPackageGuid}/documents/${mineDocumentGuid}`;

// Users
export const CORE_USER = "/users/core";

// Incidents
export const MINE_INCIDENTS = (mine_guid) => `/mines/${mine_guid}/incidents`;
export const MINE_INCIDENT = (mineGuid, mine_incident_guid) =>
  `/mines/${mineGuid}/incidents/${mine_incident_guid}`;
export const MINE_INCIDENT_DOCUMENTS = (mineGuid) => `/mines/${mineGuid}/incidents/documents`;
export const MINE_INCIDENT_DOCUMENT = (mineGuid, mineIncidentGuid, mineDocumentGuid) =>
  `/mines/${mineGuid}/incidents/${mineIncidentGuid}/documents/${mineDocumentGuid}`;
export const INCIDENTS = (params = {}) => `/incidents?${queryString.stringify(params)}`;

export const INCIDENT_NOTE = (mineIncidentGuid, mineIncidentNoteGuid) =>
  `/incidents/${mineIncidentGuid}/notes/${mineIncidentNoteGuid}`;
export const INCIDENT_NOTES = (mineIncidentGuid) => `/incidents/${mineIncidentGuid}/notes`;
export const INCIDENT_FOLLOWUP_ACTIONS = `/incidents/followup-types`;
export const INCIDENT_DETERMINATION_TYPES = `/incidents/determination-types`;
export const INCIDENT_STATUS_CODES = `/incidents/status-codes`;
export const INCIDENT_DOCUMENT_TYPE = `/incidents/document-types`;
export const INCIDENT_CATEGORY_CODES = `/incidents/category-codes`;

// Work Information
export const MINE_WORK_INFORMATIONS = (mineGuid) => `/mines/${mineGuid}/work-information`;
export const MINE_WORK_INFORMATION = (mineGuid, mineWorkInformationGuid) =>
  `/mines/${mineGuid}/work-information/${mineWorkInformationGuid}`;

// Reports
export const REPORTS = (params = {}) => `/mines/reports?${queryString.stringify(params)}`;
export const MINE_REPORT_DEFINITIONS = () => `/mines/reports/definitions`;
export const MINE_REPORTS = (mineGuid, reportsType) =>
  `/mines/${mineGuid}/reports?${queryString.stringify({
    mine_reports_type: reportsType,
  })}`;
export const MINE_REPORT = (mineGuid, mineReportGuid) =>
  `/mines/${mineGuid}/reports/${mineReportGuid}`;
export const MINE_REPORT_DOCUMENT = (mineGuid) => `/mines/${mineGuid}/reports/documents`;
export const MINE_REPORT_COMMENTS = (mineGuid, reportGuid) =>
  `/mines/${mineGuid}/reports/${reportGuid}/comments`;
export const MINE_REPORT_COMMENT = (mineGuid, reportGuid, commentGuid) =>
  `/mines/${mineGuid}/reports/${reportGuid}/comments/${commentGuid}`;
export const MINE_REPORT_STATUS = "/mines/reports/status-codes";
export const MINE_REPORT_CATEGORY = "/mines/reports/category-codes";

// Notice Of Work
export const NOTICE_OF_WORK_APPLICATION_LIST = (params = {}) =>
  `/now-applications?${queryString.stringify(params)}`;
export const ADMINISTRATIVE_AMENDMENT_APPLICATION = `/now-applications/administrative-amendments`;
export const NOTICE_OF_WORK_APPLICATION = (applicationGuid) =>
  `/now-applications/${applicationGuid}`;
export const NOTICE_OF_WORK_APPLICATION_STATUS = (applicationGuid) =>
  `${NOTICE_OF_WORK_APPLICATION(applicationGuid)}/status`;
export const NOTICE_OF_WORK_DOCUMENT_FILE_GET_URL = (id, applicationGuid, token = {}) =>
  `/now-submissions/applications/${applicationGuid}/document/${id}?${queryString.stringify(token)}`;
export const NOTICE_OF_WORK_DOCUMENT_TOKEN_GET_URL = (id, applicationGuid) =>
  `/now-submissions/applications/${applicationGuid}/document/${id}/token`;
export const NOTICE_OF_WORK_APPLICATION_IMPORT = (applicationGuid) =>
  `/now-applications/${applicationGuid}/import`;
export const NOTICE_OF_WORK_IMPORT_SUBMISSION_DOCUMENTS_JOB = (applicationGuid) =>
  `${NOTICE_OF_WORK_APPLICATION(applicationGuid)}/import-submission-documents-job`;
export const NOTICE_OF_WORK_ACTIVITY_TYPE_OPTIONS = "/now-applications/activity-types";
export const NOTICE_OF_WORK_UNIT_TYPE_OPTIONS = "/now-applications/unit-types";
export const NOTICE_OF_WORK_APPLICATION_TYPE_OPTIONS = "/now-applications/application-types";
export const NOTICE_OF_WORK_APPLICATION_STATUS_OPTIONS =
  "/now-applications/application-status-codes";
export const NOW_APPLICATION_DOCUMENT_TYPE_OPTIONS = "/now-applications/application-document-types";
export const NOW_APPLICATION_EXPORT_DOCUMENT_TYPE_OPTIONS = "/now-applications/application-export";
export const NOW_UNDERGROUND_EXPLORATION_TYPE_OPTIONS =
  "/now-applications/underground-exploration-types";
export const NOTICE_OF_WORK_APPLICATION_PROGRESS = (applicationGuid, progressCode) =>
  `/now-applications/${applicationGuid}/progress/${progressCode}`;
export const NOTICE_OF_WORK_APPLICATION_REVIEW = (applicationGuid) =>
  `/now-applications/${applicationGuid}/reviews`;
export const NOTICE_OF_WORK_APPLICATION_REVIEW_TYPES = `/now-applications/review-types`;
export const NOW_APPLICATION_PROGRESS_STATUS_CODES =
  "/now-applications/application-progress-status-codes";
export const NOTICE_OF_WORK_DOCUMENT = (now_document_guid) =>
  `/now-applications/${now_document_guid}/document`;
export const SORT_NOTICE_OF_WORK_DOCUMENTS = (now_document_guid) =>
  `/now-applications/${now_document_guid}/sort-documents`;
export const NOW_APPLICATION_PERMIT_TYPES = "/now-applications/application-permit-types";
export const IMPORT_NOTICE_OF_WORK_SUBMISSION_DOCUMENTS_JOB = (applicationGuid) =>
  `/import-now-submission-documents?now_application_guid=${applicationGuid}&most_recent_only=true`;
export const NOTICE_OF_WORK_APPLICATION_DELAY = (applicationGuid, delayGuid) =>
  delayGuid
    ? `/now-applications/${applicationGuid}/delays/${delayGuid}`
    : `/now-applications/${applicationGuid}/delays`;

// Mine Party Appointments
export const MINE_PARTY_APPOINTMENT_DOCUMENTS = (mineGuid, minePartyAppointmentGuid) =>
  `/mines/${mineGuid}/party-appts/${minePartyAppointmentGuid}/documents`;

export const NRIS_DOCUMENT_TOKEN_GET_URL = (externalId, inspectionId, file_name) =>
  `/compliance/inspection/${inspectionId}/document/${externalId}/token?${queryString.stringify({
    file_name,
  })}`;
export const NRIS_DOCUMENT_FILE_GET_URL = (externalId, inspectionId, token) =>
  `/compliance/inspection/${inspectionId}/document/${externalId}?${queryString.stringify(token)}`;

export const MINE_BONDS = (mineGuid) => `/securities/bonds?mine_guid=${mineGuid}`;
export const BOND = (bondGuid) =>
  bondGuid ? `/securities/bonds/${bondGuid}` : "/securities/bonds";
export const BOND_TRANSFER = (bondGuid) => `/securities/bonds/${bondGuid}/transfer`;
export const BOND_DOCUMENTS = (mineGuid) => `/securities/${mineGuid}/bonds/documents`;
export const MINE_RECLAMATION_INVOICES = (mineGuid) =>
  `/securities/reclamation-invoices?mine_guid=${mineGuid}`;
export const RECLAMATION_INVOICE = (invoiceGuid) =>
  invoiceGuid
    ? `/securities/reclamation-invoices/${invoiceGuid}`
    : "/securities/reclamation-invoices";
export const RECLAMATION_INVOICE_DOCUMENTS = (mineGuid) =>
  `/securities/${mineGuid}/reclamation-invoices/documents`;

export const MINE_COMMENTS = (mineGuid) => `/mines/${mineGuid}/comments`;
export const MINE_COMMENT = (mineGuid, commentGuid) => `/mines/${mineGuid}/comments/${commentGuid}`;

// OrgBook
export const ORGBOOK_SEARCH = (search) => `/orgbook/search?${queryString.stringify({ search })}`;
export const ORGBOOK_CREDENTIAL = (credentialId) => `/orgbook/credential/${credentialId}`;

// Activities
export const ACTIVITIES = () => "/activities";
export const ACTIVITIES_MARK_AS_READ = () => "/activities/mark-as-read";

// Dams
export const DAMS = () => `/dams`;
export const DAM = (damGuid) => (damGuid ? `/dams/${damGuid}` : "/dams");
