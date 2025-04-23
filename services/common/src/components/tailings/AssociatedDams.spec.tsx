import React from "react";
import { render } from "@testing-library/react";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import AssociatedDams from "./AssociatedDams";
import { TSF } from "@mds/common/tests/mocks/dataMocks";
import { tsfReducerType } from "@mds/common/redux/slices/tailingsSlice";
import FormWrapper from "../forms/FormWrapper";
import { FORM } from "@mds/common/constants/forms";

const initialState = {
    [tsfReducerType]: {
        mineTsfs: {
            [TSF.mine_guid]: [TSF]
        }
    },
};

describe("Tailings Associated Dams", () => {
    it("renders properly", () => {
        const { container } = render(
            <ReduxWrapper initialState={initialState}>
                <FormWrapper
                    name={FORM.ADD_TAILINGS_STORAGE_FACILITY}
                    initialValues={TSF}
                >
                    <AssociatedDams canEditTSF={true} isEditMode={true} />
                </FormWrapper>
            </ReduxWrapper>
        );
        expect(container).toMatchSnapshot()
    });
})