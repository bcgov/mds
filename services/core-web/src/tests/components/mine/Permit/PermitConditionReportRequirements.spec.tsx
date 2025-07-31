import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { PermitConditionsProvider } from "@mds/common/components/permits/PermitConditionsContext";
import PermitConditionReportRequirements from "@mds/common/components/permits/PermitConditionReportRequirements";
import { PERMITS } from "@mds/common/constants/reducerTypes";

const initialState = {
    [PERMITS]: {
        permits: MOCK.PERMITS,
        latestPermitAmendments: MOCK.PERMIT_AMENDMENT_STATE,
    },
};

const requirements = [MOCK.PERMITS[0].permit_amendments[0].conditions[0].mineReportPermitRequirement];

const params = {
    mineGuid: MOCK.PERMITS[0].mine_guid,
    permitGuid: MOCK.PERMITS[0].permit_guid,
    currentAmendment: MOCK.PERMITS[0].permit_amendments[0],
    latestAmendment: MOCK.PERMITS[0].permit_amendments[0],
    previousAmendment: MOCK.PERMITS[0].permit_amendments[0],
    loading: false,
    setLoading: jest.fn(),
    refreshData: jest.fn(),
};

describe("PermitConditionReportRequirements", () => {
    it("renders report requirements correctly", () => {
        const { getByText } = render(
            <ReduxWrapper initialState={initialState}>
                <PermitConditionsProvider value={params}>
                    <PermitConditionReportRequirements
                        requirements={requirements}
                    />
                </PermitConditionsProvider>
            </ReduxWrapper>
        );

        expect(getByText("Report #1 - Test Report")).toBeInTheDocument();
    });

    it("expands collapse panel on click", () => {
        const { getByText, container } = render(
            <ReduxWrapper initialState={initialState}>
                <PermitConditionsProvider value={params}>
                    <PermitConditionReportRequirements
                        requirements={requirements}
                    />
                </PermitConditionsProvider>
            </ReduxWrapper>
        );

        const panel = getByText("Report #1 - Test Report");
        fireEvent.click(panel);

        expect(container.querySelector(".ant-collapse-content-active")).toBeInTheDocument();
        expect(container).toMatchSnapshot();
    });

    it("calls refreshData when provided", async () => {
        const refreshData = jest.fn().mockResolvedValue(undefined);

        render(
            <ReduxWrapper initialState={initialState}>
                <PermitConditionsProvider value={params}>
                    <PermitConditionReportRequirements
                        requirements={requirements}
                        refreshData={refreshData}
                        canEditPermitConditions={true}
                    />
                </PermitConditionsProvider>
            </ReduxWrapper>
        );

        expect(refreshData).not.toHaveBeenCalled();
    });

    it("renders without report name when not provided", () => {

        const requirementWithoutReportName = {
            ...requirements[0],
            report_name: undefined
        };

        const { getByText } = render(
            <ReduxWrapper initialState={initialState}>
                <PermitConditionsProvider value={params}>
                    <PermitConditionReportRequirements
                        requirements={[requirementWithoutReportName]}
                    />
                </PermitConditionsProvider>
            </ReduxWrapper>
        );

        expect(getByText("Report #1")).toBeInTheDocument();
    });

});