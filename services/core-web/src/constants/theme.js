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
};

export const getNoticeOfWorkApplicationBadgeStatusType = (status) =>
  badgeStatusTypes.noticeOfWork[status] || undefinedStatusStyleType;

export const getVarianceApplicationBadgeStatusType = (status) =>
  badgeStatusTypes.variance[status] || undefinedStatusStyleType;

export const getReportSubmissionBadgeStatusType = (status) =>
  badgeStatusTypes.report[status] || undefinedStatusStyleType;
