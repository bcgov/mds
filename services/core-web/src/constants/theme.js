// Styling types for various document/application status codes

const undefinedStatusStyleType = "default";

const badgeStatusTypes = {
  noticeOfWork: {
    // Core Status Code Descriptions
    Accepted: "success",
    "Under Review": "processing",
    Withdrawn: "warning",

    // NROS/vFCBC Status Code Descriptions
    Submitted: "warning",
    Referred: "processing",
    "Client Delay Info": "processing",
    "Client Delay Bond": "processing",
    "Govt Delay": "processing",
    Consultation: "processing",
    "Active/Issued/Approved": "success",
    // Withdrawn: "error",
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
