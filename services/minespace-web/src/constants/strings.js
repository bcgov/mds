// reusable messages for error handling, validations, null-screens, etc.
export const ERROR = "Error!";
export const LOADING = "Loading...";
export const TRY_AGAIN = "Please try again later";

export const EMPTY_FIELD = "-";
export const NOT_APPLICABLE = "N/A";
export const UNKNOWN = "Unknown";
export const NONE = "None";

// variances
export const VARIANCE_APPROVED_CODE = "APP";
export const VARIANCE_APPLICATION_CODE = "REV";

export const RETURN_PAGE_TYPE = {
  LOGIN: "login",
  SITEMINDER_LOGOUT: "smlogout",
  LOGOUT: "logout",
};

// MDS email
export const MDS_EMAIL = "mds@gov.bc.ca";

export const NOTICE_OF_DEPARTURE_TYPE = {
  non_substantial: "Non Substantial",
  potentially_substantial: "Potentially Substantial",
};

export const EDITABLE_NOTICE_OF_DEPARTURE_STATUS = ["Pending Review", "Information Required"];

export const NOTICE_OF_DEPARTURE_DOWNLOAD_LINK =
  "https://www2.gov.bc.ca/gov/content/industry/mineral-exploration-mining/permitting/mines-act-permits/mines-act-departures-from-approval";

export const INCIDENT_CONTACT_METHOD_OPTIONS = [
  { label: "Phone", value: "PHN" },
  { label: "Email", value: "EML" },
  { label: "Direct phone", value: "PHN", inspectorOnly: true },
  { label: "Direct email", value: "EML", inspectorOnly: true },
  { label: "Ministry reporting phone line", value: "MRP", inspectorOnly: true },
  { label: "Ministry reporting email", value: "MRE", inspectorOnly: true },
];
