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
  pending_review: "Pending Preview",
  in_review: "In Review",
  self_authorized: "Self Authorized",
  ministry_authorized: "Ministry Authorized",
  permit_amendment_required: "Permit Amendment Required",
  additional_information_required: "Additional Information Required",
  not_authorized: "Not Authorized",
  withdrawn: "Withdrawn",
};

export const NOTICE_OF_DEPARTURE_STATUS_VALUES = {
  pending_review: "pending_review",
  in_review: "in_review",
  self_authorized: "self_authorized",
  ministry_authorized: "ministry_authorized",
  permit_amendment_required: "permit_amendment_required",
  additional_information_required: "additional_information_required",
  not_authorized: "not_authorized",
  withdrawn: "withdrawn",
};