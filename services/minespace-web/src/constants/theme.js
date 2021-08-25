// Styling types for various document/application status codes

const undefinedStatusStyleType = "default";

const badgeStatusTypes = {
  workInformation: {
    Unknown: "default",
    Working: "success",
    "Not Working": "warning",
  },
};

export const getWorkInformationBadgeStatusType = (status) =>
  badgeStatusTypes.workInformation[status] || undefinedStatusStyleType;
