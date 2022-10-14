import React from "react";
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
export const DEFAULT_PER_PAGE = "25";
export const MAX_PER_PAGE = 1000000000;
export const DEFAULT_DASHBOARD_PARAMS = "?page=1&per_page=25";

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

export const TSF_OPERATING_STATUS_CODE = [{ value: "OPT", label: "Operating" }];

export const CONSEQUENCE_CLASSIFICATION_STATUS_CODE = [
  { value: "LOW", label: "Low" },
  { value: "HIG", label: "High" },
  { value: "SIG", label: "Significant" },
  { value: "VHIG", label: "Very High" },
  { value: "EXT", label: "Extreme" },
  { value: "NOD", label: "N/A (No Dam)" },
];

export const CONSEQUENCE_CLASSIFICATION_CODE_HASH = {
  LOW: "Low",
  HIG: "High",
  SIG: "Significant",
  VHIG: "Very High",
  EXT: "Extreme",
  NOD: "N/A (No Dam)",
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
