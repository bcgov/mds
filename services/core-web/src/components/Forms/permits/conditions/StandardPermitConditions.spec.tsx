import React from "react";
import { render } from "@testing-library/react";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import StandardPermitConditions from "./StandardPermitConditions";
import { PERMITS } from "@mds/common/constants/reducerTypes";

const initialState = {
    [PERMITS]: {
        standardPermitConditions: MOCK.STANDARD_PERMIT_CONDITIONS,
        permits: [],
    }
};

describe("StandardPermitConditions", () => {
    it("renders properly", async () => {
        const { container } = render(
            <ReduxWrapper initialState={initialState}>
                <StandardPermitConditions
                    type="sand-and-gravel"
                />
            </ReduxWrapper>
        );
        expect(container).toMatchSnapshot();
    });
});