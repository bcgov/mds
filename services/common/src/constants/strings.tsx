/* eslint-disable react/jsx-key */
import React from "react";
import { MINE_REPORT_SUBMISSION_CODES } from "./enums";
// reusable messages for error handling, validations, null-screens, etc.
export const ERROR = "Error.";
export const ERROR_CANCELED =
  "Can't complete this request. Please notify mds@gov.bc.ca if this problem persists.";
export const LOADING = "Loading...";
export const TRY_AGAIN = "Please try again later";
export const NO_DATA = "No data available";
export const NO_COORDINATES = "This mine does not contain valid coordinates";
export const NO_MINE_MANAGER = "No assigned mine manager";
export const NO_PREV_MINE_MANAGER = "No previous mine managers found";
export const NO_PERMITTEE = "No assigned permittee";
export const NO_PERMIT = "No permit information available";
export const NO_SECURITIES = "No security information available";
export const NO_APPROVED_VARIANCE = "There are no approved variances";
export const NO_VARIANCE_APPLICATIONS = "There are no pending variance applications";
export const NO_APPLICATION = "No application information available";
export const ADD_MINE_MANAGER = "Please add mine manager below";
export const ADD_PARTY = "Please create party below";
export const NO_RESULTS = "No results found";
export const NO_NRIS_INSPECTIONS = "No inspections in NRIS";
export const NO_EPIC_INFORMATION = "No Information on EPIC for this Mine.";
export const MAP_UNAVAILABLE = [
  "The BC Geographic Warehouse (BCGW) map layers used in this application are unavailable at this time.",
  "Please notify ",
  <b>mds@gov.bc.ca</b>,
  " if this problem persists.",
];

export const UNAUTHORIZED = "You do not have permission to access this site";
export const UNAUTHORIZED_PAGE = "You do not have permission to access this page";
// to get HTML to render in a React String you send the string as a list of its parts, a mix of HTML and strings.
export const CONTACT_ADMIN = [
  "Contact your system administrator at ",
  <b>mds@gov.bc.ca</b>,
  " to request access",
];
export const MMO_EMAIL = "permrecl@gov.bc.ca";
export const EMPTY_FIELD = "N/A";
export const EMPTY = "";
export const ZERO = "0.00";
export const UNASSIGNED = "Unassigned";
export const DATE_FORMAT = "YYYY-MM-DD";

// default coordinates for center of BC
export const DEFAULT_LAT = 53.7267;
export const DEFAULT_LONG = -127.6476;
export const DEFAULT_ZOOM = 6;
export const HIGH_ZOOM = 14;

// default url values
export const DEFAULT_PAGE = "1";
export const DEFAULT_PER_PAGE = "10";
export const MAX_PER_PAGE = 1000000000;
export const DEFAULT_DASHBOARD_PARAMS = "?page=1&per_page=10";

// mine types
export const MAJOR_MINE = "Major mine";
export const REGIONAL_MINE = "Regional mine";

export const VARIANCE_APPLICATION_CODE = "REV";
export const VARIANCE_DECISION_CODE = "RFD";
export const VARIANCE_APPROVED_CODE = "APP";
export const VARIANCE_DENIED_CODE = "DEN";

export const INCIDENT_DOCUMENT_TYPES = {
  initial: "INI",
  final: "FIN",
  internalMinistry: "INM",
};

export const INCIDENT_DETERMINATION_TYPES = {
  pending: "PEN",
  notADangerousOccurance: "NDO",
  dangerousOccurance: "DO",
};

export const INCIDENT_FOLLOWUP_ACTIONS = {
  miu: "MIU",
  none: "NO",
  unknown: "HUK",
  inspectorInvestigation: "INS",
};

export const INCIDENT_CONTACT_METHOD_OPTIONS = [
  { label: "Phone", value: "PHN" },
  { label: "Email", value: "EML" },
  { label: "Direct phone", value: "PHN", inspectorOnly: true },
  { label: "Direct email", value: "EML", inspectorOnly: true },
  { label: "Ministry reporting phone line", value: "MRP", inspectorOnly: true },
  { label: "Ministry reporting email", value: "MRE", inspectorOnly: true },
];

export const BUSINESS_ROLES = {
  inspector: "INS",
  projectLead: "PRL",
};

export const NOT_APPLICABLE = "N/A";

// MDS email
export const MDS_EMAIL = "mds@gov.bc.ca";

export const MINE_REPORTS_TYPE = {
  codeRequiredReports: "CRR",
  permitRequiredReports: "PRR",
  tailingsReports: "TAR",
};

export enum MINE_REPORTS_ENUM {
  PRR = "Permit Required Report",
  CRR = "Code Required Report",
}

export const E_REFERRALS_URL =
  "https://j200.gov.bc.ca/int/ereferral/Default.aspx?PosseMenuName=EIMain";

export const EMLI_INSPECTION_MAPPER_BASE_URL =
  "https://governmentofbc.maps.arcgis.com/apps/webappviewer/index.html?id=f024193c07a04a28b678170e1e2046f6";

export const PERMIT_AMENDMENT_TYPES = {
  original: "OGP",
  amendment: "AMD",
  amalgamated: "ALG",
};

export const BOOLEAN_DROPDOWN_OPTIONS = [
  { value: "false", label: "No" },
  { value: "true", label: "Yes" },
];

export const BOOLEAN_OPTIONS_HASH = {
  false: "No",
  true: "Yes",
  null: EMPTY_FIELD,
};

export const APPLICATION_TYPES_BY_PERMIT_PREFIX = {
  P: ["PLA"],
  G: ["SAG"],
  M: ["MIN"],
  C: ["COL"],
  Q: ["QCA", "QIM"],
};

export const NOTICE_OF_DEPARTURE_DOCUMENT_TYPE = {
  CHECKLIST: "checklist",
  OTHER: "other",
  DECISION: "decision",
};

export const NOTICE_OF_DEPARTURE_TYPE = {
  non_substantial: "Non Substantial",
  potentially_substantial: "Potentially Substantial",
};

export const NOTICE_OF_DEPARTURE_TYPE_VALUES = {
  non_substantial: "non_substantial",
  potentially_substantial: "potentially_substantial",
};

export const NOTICE_OF_DEPARTURE_STATUS = {
  pending_review: "Pending Review",
  in_review: "In Review",
  information_required: "Information Required",
  self_determined_non_substantial: "Self Determined Non Substantial",
  determined_non_substantial: "Determined Non Substantial",
  determined_substantial: "Determined Substantial",
  withdrawn: "Withdrawn",
};

export const NOTICE_OF_DEPARTURE_STATUS_VALUES = {
  pending_review: "pending_review",
  in_review: "in_review",
  information_required: "information_required",
  self_determined_non_substantial: "self_determined_non_substantial",
  determined_non_substantial: "determined_non_substantial",
  determined_substantial: "determined_substantial",
  withdrawn: "withdrawn",
  self_authorized: "self_authorized",
};

export const NOD_TYPE_FIELD_VALUE = {
  POTENTIALLY_SUBSTANTIAL: "potentially_substantial",
  NON_SUBSTANTIAL: "non_substantial",
};

export const CALLOUT_SEVERITY = {
  info: "info",
  success: "success",
  warning: "warning",
  danger: "danger",
};

export const MAJOR_MINES_APPLICATION_DOCUMENT_TYPE = {
  PRIMARY: "primary_documents",
  SPATIAL: "spatial_documents",
  SUPPORTING: "supporting_documents",
};

export const MAJOR_MINES_APPLICATION_DOCUMENT_TYPE_CODE = {
  PRIMARY: "PRM",
  SPATIAL: "SPT",
  SUPPORTING: "SPR",
};

export const MAJOR_MINES_APPLICATION_DOCUMENT_TYPE_CODE_LOCATION = {
  PRM: "Primary Document",
  SPT: "Spatial Component",
  SPR: "Supporting Document",
};

export const PROJECT_SUMMARY_DOCUMENT_TYPE = {
  GENERAL: "general",
};

export const PROJECT_SUMMARY_DOCUMENT_TYPE_CODE = {
  GENRAL: "GEN",
};

export const PROJECT_SUMMARY_DOCUMENT_TYPE_CODE_LOCATION = {
  GEN: "General",
};

export const PROJECT_DECISION_PACKAGE_DOCUMENT_TYPE = {
  DECISION: "decision_package",
  ADDITIONAL: "additional_government",
  INTERNAL: "internal_ministry",
};

export const PROJECT_DECISION_PACKAGE_DOCUMENT_TYPE_CODE = {
  DECISION: "DEC",
  ADDITIONAL: "ADG",
  INTERNAL: "INM",
};

export const PROJECT_DECISION_PACKAGE_DOCUMENT_TYPE_CODE_LOCATION = {
  DCP: "Decision Package",
  ADG: "Additional Government",
  INM: "Internal Ministry",
};

export const INFORMATION_REQUIREMENTS_TABLE_DOCUMENT_TYPE = {
  TEMPLATE: "template",
};

export const INFORMATION_REQUIREMENTS_TABLE_DOCUMENT_TYPE_CODE = {
  TEMPLATE: "TEM",
};

export const INFORMATION_REQUIREMENTS_TABLE_DOCUMENT_TYPE_CODE_LOCATION = {
  TEM: "Template",
};

export const CATEGORY_CODE = {
  PRM: "Primary Document",
  SPT: "Spatial Component",
  SPR: "Supporting Document",
  GEN: "General",
  DCP: "Decision Package",
  ADG: "Additional Government",
  INM: "Internal Ministry",
  TEM: "Template",
};

export const FACILITY_TYPES = [
  { value: "tailings_storage_facility", label: "Tailing Storage Facility" },
];

export const TSF_TYPES = [
  { value: "conventional", label: "Conventional (impounded by dams)" },
  { value: "dry_stacking", label: "Filtered/Dry stack" },
  { value: "pit", label: "In-Pit" },
  { value: "lake", label: "In-Lake" },
  { value: "other", label: "Other" },
];

export const STORAGE_LOCATION = [
  { value: "above_ground", label: "Above Ground" },
  { value: "below_ground", label: "Underground" },
];

export const TSF_INDEPENDENT_TAILINGS_REVIEW_BOARD = [
  { value: "YES", label: "Yes" },
  { value: "NO", label: "No" },
];

export const TSF_OPERATING_STATUS_CODE = [
  { value: "CON", label: "Construction" },
  { value: "OPT", label: "Operation" },
  { value: "CAM", label: "Care and Maintenance" },
  { value: "CLT", label: "Closure - Transition" },
  { value: "CLA", label: "Closure - Active Care" },
  { value: "CLP", label: "Closure - Passive Care" },
];

export const CONSEQUENCE_CLASSIFICATION_STATUS_CODE = [
  { value: "LOW", label: "Low" },
  { value: "SIG", label: "Significant" },
  { value: "HIG", label: "High" },
  { value: "VHIG", label: "Very High" },
  { value: "EXT", label: "Extreme" },
  { value: "NRT", label: "Not Rated" },
];

export const CONSEQUENCE_CLASSIFICATION_CODE_HASH = {
  LOW: "Low",
  SIG: "Significant",
  HIG: "High",
  VHIG: "Very High",
  EXT: "Extreme",
  NRT: "Not Rated",
};

export const CONSEQUENCE_CLASSIFICATION_RANK_HASH = {
  NRT: 0,
  LOW: 1,
  SIG: 2,
  HIG: 3,
  VHIG: 4,
  EXT: 5,
};

export const DAM_TYPES = [{ value: "dam", label: "Dam" }];

export const DAM_TYPES_HASH = {
  dam: "Dam",
};

export const DAM_OPERATING_STATUS = [
  { value: "construction", label: "Construction" },
  { value: "operation", label: "Operation" },
  { value: "care_and_maintenance", label: "Care and Maintenance" },
  { value: "closure_transition", label: "Closure - Transition" },
  { value: "closure_active_care", label: "Closure - Active Care" },
  { value: "closure_passive_care", label: "Closure - Passive Care" },
];

export const DAM_OPERATING_STATUS_HASH = {
  construction: "Construction",
  operation: "Operation",
  care_and_maintenance: "Care and Maintenance",
  closure_transition: "Closure - Transition",
  closure_active_care: "Closure - Active Care",
  closure_passive_care: "Closure - Passive Care",
};

export const MINISTRY_ACKNOWLEDGED_STATUS = {
  not_acknowledged: "Not acknowledged",
  acknowledged: "Acknowledged",
};
export const PARTY_APPOINTMENT_STATUS = {
  pending: "Pending",
  active: "Active",
  inactive: "Inactive",
};

export const ESUP_DOCUMENT_GENERATED_TYPES = {
  LET: "Explosives Storage and Use Permit",
  PER: "Permit Enclosed Letter",
};

export const BC_TIMEZONE_NAMES = ["Canada/Pacific", "Canada/Mountain", "Canada/Yukon"];

// "Display name": [corresponding zones as picked up by moment]
// the "Canada/*" TZs are valid, and what we want to display, but browser picks up "America/*"
export const CANADA_TIMEZONE_MAP = {
  // PDT (DST) -700
  "Canada/Pacific": ["America/Vancouver"],
  // MST (no DST) -700
  "Canada/Yukon": [
    "America/Creston",
    "America/Dawson",
    "America/Dawson_Creek",
    "America/Fort_Nelson",
    "America/Phoenix",
    "America/Whitehorse",
  ],
  // MDT (DST) -600
  "Canada/Mountain": [
    "America/Cambridge_Bay",
    "America/Edmonton",
    "America/Inuvik",
    "America/Yellowknife",
  ],
  // CST (no DST) -600
  "Canada/Saskatchewan": ["America/Regina", "America/Swift_Current"],
  // CDT (DST) -500
  "Canada/Central": ["America/Winnipeg", "America/Rankin_Inlet", "America/Resolute"],
  // EDT (DST) -400
  "Canada/Eastern": ["America/Toronto", "America/Iqaluit"],
  // ADT (DST) -300
  "Canada/Atlantic": [
    "America/Halifax",
    "America/Moncton",
    "America/Glace_Bay",
    "America/Goose_Bay",
  ],
  // NDT (DST) -230
  "Canada/Newfoundland": ["America/St_Johns"],
};

export const DEFAULT_TIMEZONE = "Canada/Pacific";

export const DATETIME_TZ_INPUT_FORMAT = "YYYY-MM-DD HH:mm Z z";
export const DATE_TZ_INPUT_FORMAT = "YYYY-MM-DD Z z";
export const DATETIME_TZ_FORMAT = "MMM DD YYYY, HH:mm (z)";

export const MINE_REPORT_STATUS_HASH = {
  [MINE_REPORT_SUBMISSION_CODES.NRQ]: "Not Requested",
  [MINE_REPORT_SUBMISSION_CODES.REQ]: "Changes Requested",
  [MINE_REPORT_SUBMISSION_CODES.REC]: "Changes Received",
  [MINE_REPORT_SUBMISSION_CODES.ACC]: "Accepted",
  [MINE_REPORT_SUBMISSION_CODES.INI]: "Received",
};
