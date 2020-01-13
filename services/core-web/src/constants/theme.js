// Styling types for various document/application status codes

const undefinedStatusStyleType = "default";

const badgeStatusTypes = {
  noticeOfWork: {
    Accepted: "success",
    "Under Review": "processing",
    Withdrawn: "warning",
  },
  variance: {
    Approved: "success",
    Denied: "error",
    "Not Applicable": "default",
    "In Review": "processing",
    "Ready for Decision": "processing",
    Withdrawn: "warning",
  },
};

export const getNoticeOfWorkApplicationBadgeStatusType = (status) =>
  badgeStatusTypes.noticeOfWork[status] || undefinedStatusStyleType;

export const getVarianceApplicationBadgeStatusType = (status) =>
  badgeStatusTypes.variance[status] || undefinedStatusStyleType;
