import { PROJECT_STATUS_CODES, SystemFlagEnum } from "@mds/common/constants/enums";
import { areAuthEnvFieldsDisabled, areAuthFieldsDisabled, areDocumentFieldsDisabled, areFieldsDisabled } from "./projectUtils";

const enumValues = (<any>Object).values(PROJECT_STATUS_CODES);

const TEST_PARAMETERS = [
    {
        label: "areFieldsDisabled",
        testFunction: areFieldsDisabled,
        coreDisabledStatuses: ["WDN", "COM"],
        coreEnabledStatuses: ["DFT", "SUB", "ASG", "UNR", "CHR", "OHD"],
        msDisabledStatuses: ["SUB", "ASG", "UNR", "WDN", "OHD", "COM"],
        msEnabledStatuses: ["DFT", "CHR"],
    },
    {
        label: "areDocumentFieldsDisabled",
        testFunction: areDocumentFieldsDisabled,
        coreDisabledStatuses: ["WDN", "COM"],
        coreEnabledStatuses: ["DFT", "SUB", "ASG", "UNR", "CHR", "OHD"],
        msDisabledStatuses: ["UNR", "WDN", "OHD", "COM"],
        msEnabledStatuses: ["DFT", "SUB", "ASG", "CHR"],
    },
    {
        label: "areAuthFieldsDisabled",
        testFunction: areAuthFieldsDisabled,
        coreDisabledStatuses: ["WDN", "COM", "CHR", "UNR"],
        coreEnabledStatuses: ["DFT", "SUB", "ASG", "OHD"],
        msDisabledStatuses: ["UNR", "WDN", "OHD", "COM", "SUB", "ASG", "CHR"],
        msEnabledStatuses: ["DFT"],
    },
    {
        label: "areAuthEnvFieldsDisabled",
        testFunction: areAuthEnvFieldsDisabled,
        coreDisabledStatuses: ["WDN", "COM", "ASG", "UNR", "CHR", "OHD", "SUB"],
        coreEnabledStatuses: ["DFT"],
        msDisabledStatuses: ["UNR", "WDN", "OHD", "COM", "SUB", "ASG", "CHR"],
        msEnabledStatuses: ["DFT"],
    }
];

TEST_PARAMETERS.forEach(
    ({ label, testFunction, coreDisabledStatuses, coreEnabledStatuses, msDisabledStatuses, msEnabledStatuses }) => {
        describe(label, () => {
            const coreStatuses = [...coreDisabledStatuses, ...coreEnabledStatuses];
            const msStatuses = [...msDisabledStatuses, ...msEnabledStatuses];

            enumValues.forEach((status) => {
                it(`Enum value ${status} should be included in testing`, () => {
                    const coreIncludes = coreStatuses.includes(status);
                    const msIncludes = msStatuses.includes(status);
                    expect(coreIncludes).toBe(true);
                    expect(msIncludes).toBe(true);
                });
            });

            coreDisabledStatuses.forEach((status) => {
                it(`CORE status: ${status} Should return true (disabled)`, () => {
                    const result = testFunction(SystemFlagEnum.core, status);
                    expect(result).toBe(true);
                });
            });

            if (label !== "areDocumentFieldsDisabled") {
                const noSubmissionMinespaceDisabledStatuses = [...msDisabledStatuses].filter((status) => status !== "ASG");
                noSubmissionMinespaceDisabledStatuses.forEach((status) => {
                    it(`MS status: ${status} Should return true (disabled) when submission has not occured`, () => {
                        const result = testFunction(SystemFlagEnum.ms, status);
                        expect(result).toBe(true);
                    });
                })
            }

            msDisabledStatuses.forEach((status) => {
                it(`MS status: ${status} Should return true (disabled) when submission has occured`, () => {
                    const result = testFunction(SystemFlagEnum.ms, status, true);
                    expect(result).toBe(true);
                });
            });

            coreEnabledStatuses.forEach((status) => {
                it(`CORE status: ${status} Should return false (enabled)`, () => {
                    const result = testFunction(SystemFlagEnum.core, status);
                    expect(result).toBe(false);
                });
            });

            msEnabledStatuses.forEach((status) => {
                it(`MS status: ${status} Should return false (enabled)`, () => {
                    const result = testFunction(SystemFlagEnum.ms, status);
                    expect(result).toBe(false);
                });
            });

            it("should return false (enabled) when there is no status", () => {
                const coreResult = testFunction(SystemFlagEnum.core, "");
                expect(coreResult).toBe(false);
                const msResult = testFunction(SystemFlagEnum.ms, "");
                expect(msResult).toBe(false);
            });
        });
    })

// when it says that the user can make changes except env/auths, does that include docs?