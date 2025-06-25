import React from "react";
import { render } from "@testing-library/react";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { amsAppReducerType } from "@mds/common/redux/slices/amsFinalApplicationSlice";
import FormWrapper from "../../forms/FormWrapper";
import EnvDocumentsTab from "./EnvDocumentsTab";
import { BrowserRouter } from "react-router-dom";

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

function mockFunction() {
    const original = jest.requireActual("react-router-dom");
    return {
        ...original,
        useParams: jest.fn().mockReturnValue({
            projectSummaryGuid: "70414192-ca71-4d03-93a5-630491e9c554",
        }),
    };
};

jest.mock("react-router-dom", () => mockFunction());


describe("EnvDocumentsTab", () => {
    it("renders properly", () => {
        const { container } = render(
            <BrowserRouter>
                <ReduxWrapper initialState={initialState}>
                    <FormWrapper name="formName">
                        <EnvDocumentsTab />
                    </FormWrapper>
                </ReduxWrapper>
            </BrowserRouter>
        );
        expect(container).toMatchSnapshot();
    })
});
