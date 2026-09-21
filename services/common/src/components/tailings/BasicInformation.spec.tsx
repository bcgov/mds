import React from "react";
import { render } from "@testing-library/react";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import BasicInformation from "@mds/common/components/tailings/BasicInformation";
import { TSF } from "@mds/common/tests/mocks/dataMocks";
import FormWrapper from "../forms/FormWrapper";
import { FORM } from "@mds/common/constants/forms";
import { tsfReducerType } from "@mds/common/redux/slices/tailingsSlice";


const initialState = {
    [tsfReducerType]: {
        mineTsfs: {
            [TSF.mine_guid]: [TSF]
        }
    },
};



describe("Tailings BasicInformation", () => {
    let tzGuessSpy;
    const originalTZ = process.env.TZ;

    beforeAll(() => {
        // Set timezone to UTC for consistent CI results
        // Mock moment.tz.guess to always return UTC
        const moment = require('moment-timezone');
        moment.tz.setDefault('UTC');
    });

    afterAll(() => {
        // Restore original timezone
        const moment = require('moment-timezone');
        moment.tz.setDefault(); // Unset default timezone
    });

    it("renders properly", () => {
        const { container } = render(
            <ReduxWrapper initialState={initialState}>
                <FormWrapper name={FORM.ADD_TAILINGS_STORAGE_FACILITY} initialValues={TSF}>
                    <BasicInformation mineName={"Mine Name"} isEditMode={true} />
                </FormWrapper>
            </ReduxWrapper>
        );
        expect(container).toMatchSnapshot();
    });
});