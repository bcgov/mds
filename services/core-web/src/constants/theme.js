// Styling types for various document/application status codes
import { MINE_REPORT_STATUS_HASH } from "@mds/common/constants";

const undefinedStatusStyleType = "default";

const badgeStatusTypes = {
  noticeOfWork: {
    Approved: "success",
    "Client Delayed": "processing",
    "Permit Closed": "success",
    "Pending Approval": "processing",
    "Govt. Action Required": "processing",
    Referred: "processing",
    Rejected: "error",
    Received: "processing",
    "Rejected-Initial": "error",
    "No Permit Required": "success",
    "Referral Complete": "processing",
    "Pending Verification": "processing",
  },
  variance: {
    Approved: "success",
    Denied: "error",
    "Not Applicable": "default",
    "In Review": "processing",
    "Ready for Decision": "processing",
    Withdrawn: "warning",
  },
  report: {
    [MINE_REPORT_STATUS_HASH.ACC]: "success",
    [MINE_REPORT_STATUS_HASH.REC]: "warning",
    [MINE_REPORT_STATUS_HASH.REQ]: "processing",
    [MINE_REPORT_STATUS_HASH.NRQ]: "default",
    [MINE_REPORT_STATUS_HASH.NON]: "warning",
  },
  workInformation: {
    Unknown: "default",
    Working: "success",
    "Not Working": "warning",
  },
  explosivesPermit: {
    Approved: "success",
    Received: "processing",
    Rejected: "error",
    Withdrawn: "warning",
  },
  closedStatus: {
    true: "error",
    false: "success",
    null: "success",
    undefined: "success",
  },
};

export const getApplicationStatusType = (status) =>
  badgeStatusTypes.noticeOfWork[status] || undefinedStatusStyleType;

export const getVarianceApplicationBadgeStatusType = (status) =>
  badgeStatusTypes.variance[status] || undefinedStatusStyleType;

export const getReportSubmissionBadgeStatusType = (status) =>
  badgeStatusTypes.report[status] || undefinedStatusStyleType;

export const getWorkInformationBadgeStatusType = (status) =>
  badgeStatusTypes.workInformation[status] || undefinedStatusStyleType;

export const getExplosivesPermitBadgeStatusType = (status) =>
  badgeStatusTypes.explosivesPermit[status] || undefinedStatusStyleType;

export const getExplosivesPermitClosedBadgeStatusType = (status) =>
  badgeStatusTypes.closedStatus[status] || undefinedStatusStyleType;
