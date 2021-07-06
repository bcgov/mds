// Styling types for various document/application status codes

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
    Accepted: "success",
    "Changes Received": "warning",
    "Changes Requested": "processing",
    "Not Requested": "default",
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
