import React from "react";
import { render } from "@testing-library/react";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { amsAppReducerType } from "@mds/common/redux/slices/amsFinalApplicationSlice";
import FormWrapper from "../../forms/FormWrapper";
import EnvDeclarationTab from "./EnvDeclarationTab";

const initialState = {
    [amsAppReducerType]: {
        amsFinalApplications: {
            [MOCK.AMS_AUTHORIZATION_SUCCESS.project_summary_authorization_guid]: MOCK.AMS_FINAL_APPLICATION
        }
    },
    form: {
        formName: {
            initial: MOCK.AMS_FINAL_APPLICATION,
            values: MOCK.AMS_FINAL_APPLICATION
        }
    }
};


describe("EnvDeclarationTab", () => {
    it("renders properly", () => {
        const { container } = render(
            <ReduxWrapper initialState={initialState}>
                <FormWrapper name="formName">
                    <EnvDeclarationTab />
                </FormWrapper>
            </ReduxWrapper>
        );
        expect(container).toMatchSnapshot();
    })
});
