import { PROJECT_STATUS_CODES, SystemFlagEnum } from "@mds/common/constants/enums";
import { memoize } from "lodash";

export const areFieldsDisabled = memoize((systemFlag: SystemFlagEnum, projectSummaryStatusCode: string) => {
    // Return false (enabled) if status = "" => "Not Started"
    const isStatusInEnum = (<any>Object).values(PROJECT_STATUS_CODES).includes(projectSummaryStatusCode);

    if (!isStatusInEnum) return false;
    const projectSummaryStatus = projectSummaryStatusCode as PROJECT_STATUS_CODES;

    const disabledStatuses = [PROJECT_STATUS_CODES.WDN, PROJECT_STATUS_CODES.COM];

    const enabledStatuses = systemFlag === SystemFlagEnum.core
        ? [PROJECT_STATUS_CODES.DFT, PROJECT_STATUS_CODES.ASG, PROJECT_STATUS_CODES.UNR, PROJECT_STATUS_CODES.CHR, PROJECT_STATUS_CODES.OHD, PROJECT_STATUS_CODES.SUB]
        : [PROJECT_STATUS_CODES.DFT, PROJECT_STATUS_CODES.CHR];

    if (disabledStatuses.includes(projectSummaryStatus)) return true;
    return !enabledStatuses.includes(projectSummaryStatus);

},
    (systemFlag: SystemFlagEnum, projectSummaryStatusCode: string) => `${systemFlag}_${projectSummaryStatusCode}`);

export const areAuthFieldsDisabled = memoize((systemFlag: SystemFlagEnum, projectSummaryStatusCode: string) => {
    const fieldsDisabled = areFieldsDisabled(systemFlag, projectSummaryStatusCode);
    if (fieldsDisabled) return true;

    const extraDisabledStatuses = [PROJECT_STATUS_CODES.CHR, PROJECT_STATUS_CODES.UNR];
    const authDisabled = extraDisabledStatuses.includes(projectSummaryStatusCode as PROJECT_STATUS_CODES)
    return authDisabled;
}, (systemFlag: SystemFlagEnum, projectSummaryStatusCode: string) => `${systemFlag}_${projectSummaryStatusCode}`);

export const areAuthEnvFieldsDisabled = memoize((systemFlag, projectSummaryStatusCode) => {
    const authFieldsDisabled = areAuthFieldsDisabled(systemFlag, projectSummaryStatusCode);
    if (authFieldsDisabled) return true;

    const extraDisabledStatuses = systemFlag === SystemFlagEnum.core
        ? [PROJECT_STATUS_CODES.ASG, PROJECT_STATUS_CODES.OHD, PROJECT_STATUS_CODES.SUB]
        : [PROJECT_STATUS_CODES.CHR];

    const envDisabled = extraDisabledStatuses.includes(projectSummaryStatusCode as PROJECT_STATUS_CODES);

    return envDisabled;
}, (systemFlag: SystemFlagEnum, projectSummaryStatusCode: string) => `${systemFlag}_${projectSummaryStatusCode}`);

export const areDocumentFieldsDisabled = memoize((systemFlag: SystemFlagEnum, projectSummaryStatusCode: string) => {
    // Return false (enabled) if status = "" => "Not Started"
    const isStatusInEnum = (<any>Object).values(PROJECT_STATUS_CODES).includes(projectSummaryStatusCode)
    if (!isStatusInEnum) return false;

    const projectSummaryStatus = projectSummaryStatusCode as PROJECT_STATUS_CODES;
    const disabledStatuses = [PROJECT_STATUS_CODES.WDN, PROJECT_STATUS_CODES.COM];

    const enabledStatuses = systemFlag === SystemFlagEnum.core
        ? [PROJECT_STATUS_CODES.DFT, PROJECT_STATUS_CODES.SUB, PROJECT_STATUS_CODES.ASG, PROJECT_STATUS_CODES.UNR, PROJECT_STATUS_CODES.CHR, PROJECT_STATUS_CODES.OHD]
        : [PROJECT_STATUS_CODES.DFT, PROJECT_STATUS_CODES.SUB, PROJECT_STATUS_CODES.ASG, PROJECT_STATUS_CODES.CHR];

    if (disabledStatuses.includes(projectSummaryStatus)) return true;
    return !enabledStatuses.includes(projectSummaryStatus);

},
    (systemFlag: SystemFlagEnum, projectSummaryStatusCode: string) => `${systemFlag}_${projectSummaryStatusCode}`);

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