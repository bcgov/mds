import React from "react";
import { render } from "@testing-library/react";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import BasicInformation from "@mds/common/components/tailings/BasicInformation";
import { TSF } from "@mds/common/tests/mocks/dataMocks";
import { TAILINGS } from "@mds/common/constants/reducerTypes";
import FormWrapper from "../forms/FormWrapper";
import { FORM } from "@mds/common/constants/forms";


const initialState = {
    [TAILINGS]: {
        tsf: TSF
    },
};


describe("Tailings BasicInformation", () => {
    it("renders properly", () => {
        const { container } = render(
            <ReduxWrapper initialState={initialState}>
                <FormWrapper name={FORM.ADD_TAILINGS_STORAGE_FACILITY}>
                    <BasicInformation mineName={"Mine Name"} isEditMode={true} />
                </FormWrapper>
            </ReduxWrapper>
        );
        expect(container).toMatchSnapshot();
    });
});