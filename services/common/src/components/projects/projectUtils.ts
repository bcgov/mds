import { SystemFlagEnum } from "@mds/common/constants/enums";

export const isFieldDisabled = (
    systemFlag,
    projectSummaryStatusCode = "",
    isAuthorizationPage = false
) => {
    // Return false if status = "" => "Not Started"
    if (!projectSummaryStatusCode) return false;

    const disabledStatuses = new Set(["WDN", "COM"]);
    const enabledStatusMapping = {
        [SystemFlagEnum.ms]: new Set(["DFT", "CHR"]),
        [SystemFlagEnum.core]: new Set(["DFT", "ASG", "UNR", "CHR", "OHD"]),
    };

    if (disabledStatuses.has(projectSummaryStatusCode)) return true;

    const enabledStatuses = enabledStatusMapping[systemFlag];
    const isFieldEnabled = enabledStatuses?.has(projectSummaryStatusCode) ?? false;

    if (!isFieldEnabled) return true;

    return isAuthorizationPage ? projectSummaryStatusCode !== "DFT" : false;
};

export const isDocumentFieldDisabled = (systemFlag, projectSummaryStatusCode = "") => {
    // Return false if status = "" => "Not Started"
    if (!projectSummaryStatusCode) return false;

    const disabledStatuses = new Set(["WDN", "COM"]);
    const enabledStatusMapping = {
        [SystemFlagEnum.ms]: new Set(["DFT", "SUB", "ASG", "CHR"]),
        [SystemFlagEnum.core]: new Set(["DFT", "SUB", "ASG", "UNR", "CHR", "OHD"]),
    };

    if (disabledStatuses.has(projectSummaryStatusCode)) return true;

    const enabledStatuses = enabledStatusMapping[systemFlag];
    return !enabledStatuses?.has(projectSummaryStatusCode);
};

export const getProjectStatusDescription = (
    projectSummaryStatusCode,
    majorMineApplicationStatusCode,
    irtStatusCode
) => {
    if (
        projectSummaryStatusCode === "WDN" ||
        majorMineApplicationStatusCode === "WDN" ||
        irtStatusCode === "WDN"
    ) {
        return "Inactive";
    }
    return "Active";
};