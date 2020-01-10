// Colours
export const COLOR = {
  violet: "#5e46a1",
  errorRed: "#D40D0D",
  mediumGrey: "#6b6363",
  layoutGrey: "#e8e8e8",
  lightGrey: "#F4F0F0",
  antIconGrey: "#00000040",
  dangerButtonRed: "#BC2929",
  backgroundWhite: "#ffffff",
};

// Styling types for various document/application status codes

const undefinedStatusStyleType = "default";

const noticeOfWorkStatusStyleTypes = {
  Accepted: "success",
  "Under Review": "processing",
  Withdrawn: "warning",
};

const varianceApplicationStatusStyleType = {
  Approved: "success",
  Denied: "error",
  "Not Applicable": "default",
  "In Review": "processing",
  "Ready for Decision": "processing",
  Withdrawn: "warning",
};

export const getNoticeOfWorkApplicationStatusStyleType = (status) =>
  noticeOfWorkStatusStyleTypes[status] || undefinedStatusStyleType;

export const getVarianceApplicationStatusStyleType = (status) =>
  varianceApplicationStatusStyleType[status] || undefinedStatusStyleType;
