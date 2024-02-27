export enum SystemFlagEnum {
  core = "CORE",
  ms = "MineSpace",
}
export enum NoDTypeDisplayEnum {
  non_substantial = "Non Substantial",
  potentially_substantial = "Potentially Substantial",
}

export enum NoDTypeSaveEnum {
  non_substantial = "non_substantial",
  potentially_substantial = "potentially_substantial",
}

export enum NoDStatusDisplayEnum {
  pending_review = "Pending Review",
  in_review = "In Review",
  information_required = "Information Required",
  self_determined_non_substantial = "Self Determined Non Substantial",
  determined_substantial = "Determined Substantial",
  determined_non_substantial = "Determined Non Substantial",
  withdrawn = "Withdrawn",
}

export enum NodStatusSaveEnum {
  pending_review = "pending_review",
  in_review = "in_review",
  information_required = "information_required",
  self_determined_non_substantial = "self_determined_non_substantial",
  determined_substantial = "determined_substantial",
  determined_non_substantial = "determined_non_substantial",
  withdrawn = "withdrawn",
}

export enum TailingsStorageFacilityTypeEnum {
  conventional = "conventional",
  dry_stacking = "dry_stacking",
  pit = "pit",
  lake = "lake",
  other = "other",
}

export enum FacilityTypeEnum {
  tailings_storage_facility = "tailings_storage_facility",
}

export enum StorageLocationEnum {
  above_ground = "above_ground",
  below_ground = "below_ground",
}

export enum ConsequenceClassificationStatusCodeEnum {
  LOW = "LOW",
  HIG = "HIG",
  VHIG = "VHIG",
  EXT = "EXT",
  NRT = "NRT",
}

export enum TSFOperatingStatusCodeEnum {
  CLO = "CLO",
  CON = "CON",
  CLT = "CLT",
  CLA = "CLA",
  CLP = "CLP",
  OPT = "OPT",
  CAM = "CAM",
}

export enum ITRBExemptionStatusCodeEnum {
  NO = "NO",
  YES = "YES",
  EXEM = "EXEM",
}

export enum PartyTypeCodeEnum {
  PER = "PER",
  ORG = "ORG",
}

export enum DamTypeEnum {
  dam = "dam",
}
export enum OperatingStatusEnum {
  construction = "construction",
  operation = "operation",
  care_and_maintenance = "care_and_maintenance",
  closure_transition = "closure_transition",
  closure_active_care = "closure_active_care",
  closure_passive_care = "closure_passive_care",
}

export enum MinePartyAppointmentTypeCodeEnum {
  EOR = "EOR",
  TQP = "TQP",
  MMG = "MMG",
}

export enum ActivityTypeEnum {
  mine = "mine",
  eor_expiring_60_days = "eor_expiring_60_days",
  tsf_eor_expired = "tsf_eor_expired",
  qp_expiring_60_days = "qp_expiring_60_days",
  tsf_qp_expired = "tsf_qp_expired",
  incident_report_submitted = "incident_report_submitted",
  mine_incident_created = "mine_incident_created",
  mine_incident_updated = "mine_incident_updated",
  nod_status_changed = "nod_status_changed",
  eor_created = "eor_created",
  qfp_created = "qfp_created",
  nod_submitted = "nod_submitted",
  ir_table_submitted = "ir_table_submitted",
  major_mine_app_submitted = "major_mine_app_submitted",
  major_mine_desc_submitted = "major_mine_desc_submitted",
}

export enum LOADING_STATUS {
  none,
  sent,
  success,
  error,
}

// connection to permittee wallet
export enum VC_CONNECTION_STATES {
  null = "Inactive",
  invitation = "Pending",
  request = "Pending",
  response = "Pending",
  active = "Active",
  completed = "Active",
}

// issue state of the permit digital credential
export enum VC_CRED_ISSUE_STATES {
  null = "Not Active",
  offer_sent = "Pending",
  credential_issued = "Pending",
  credential_acked = "Active",
  deleted = "Active",
  abandoned = "Error",
}

export enum PROJECT_SUMMARY_STATUS_CODES {
  DFT = "Draft",
  WDN = "Withdrawn",
  ASG = "Assigned",
  COM = "Complete",
  OHD = "On Hold",
  SUB = "Submitted",
  UNR = "Under review",
}

export enum MAJOR_MINE_APPLICATION_AND_IRT_STATUS_CODES {
  DFT = "Draft",
  APV = "Approved",
  CHR = "Change Requested",
  SUB = "Submitted",
  UNR = "Under review",
}

export enum MINE_REPORT_SUBMISSION_CODES {
  NRQ = "NRQ",
  REQ = "REQ",
  REC = "REC",
  ACC = "ACC",
  INI = "INI",
}

export enum REPORT_TYPE_CODES {
  CRR = "CRR",
  PRR = "PRR",
  TAR = "TAR",
}

export enum MINE_REPORTS_ENUM {
  PRR = "Permit Required Report",
  CRR = "Code Required Report",
}

export enum MINE_INCIDENT_DOCUMENT_TYPE_CODE {
  INM = "INM",
  FIN = "FIN",
  INI = "INI",
}

export enum REPORT_REGULATORY_AUTHORITY_CODES {
  CPO = "CPO",
  CIM = "CIM",
  BOTH = "Both",
  NONE = "Not specified",
}

export enum REPORT_REGULATORY_AUTHORITY_ENUM {
  CPO = "Chief Permitting Officer",
  CIM = "Chief Inspector of Mines",
}
