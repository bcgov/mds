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
export const NO_APPROVED_VARIANCE = "There are no approved variances";
export const NO_VARIANCE_APPLICATIONS =
  "There are no pending variance applications";
export const NO_APPLICATION = "No application information available";
export const ADD_MINE_MANAGER = "Please add mine manager below";
export const ADD_PARTY = "Please create party below";
export const NO_RESULTS = "No results found";
export const NO_NRIS_INSPECTIONS = "No inspections in NRIS";

export const UNAUTHORIZED = "You do not have permission to access this site";
export const UNAUTHORIZED_PAGE =
  "You do not have permission to access this page";

export const EMPTY_FIELD = "N/A";
export const EMPTY = "";
export const ZERO = "0.00";
export const UNASSIGNED = "Unassigned";

// default url values
export const DEFAULT_PAGE = "1";
export const DEFAULT_PER_PAGE = "25";
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
  final: "FIN"
};

export const INCIDENT_DETERMINATION_TYPES = {
  pending: "PEN",
  notADangerousOccurance: "NDO",
  dangerousOccurance: "DO"
};

export const INCIDENT_FOLLOWUP_ACTIONS = {
  miu: "MIU",
  inspector: "INS",
  none: "NO",
  unknown: "HUK"
};
