// Styling types for various document/application status codes

const undefinedStatusStyleType = "default";

const badgeStatusTypes = {
  noticeOfWork: {
    Submitted: "warning",
    "Under Review": "processing",
    Referred: "processing",
    "Client Delay Info": "processing",
    "Client Delay Bond": "processing",
    "Govt Delay": "processing",
    Consultation: "processing",
    "Active/Issued/Approved": "success",
    Accepted: "success",
    Withdrawn: "warning",
    Rejected: "error",
    Closed: "error",
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
