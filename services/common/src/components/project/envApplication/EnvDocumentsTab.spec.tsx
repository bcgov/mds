import React from "react";
import { render } from "@testing-library/react";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import FormWrapper from "../../forms/FormWrapper";
import EnvDocumentsTab from "./EnvDocumentsTab";
import { BrowserRouter } from "react-router-dom";
import { FORM } from "@mds/common/constants/forms";

const initialState = {};

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
                    <FormWrapper name={FORM.ADD_EDIT_AMS_FINAL_APPLICATION} initialValues={MOCK.AMS_FINAL_APPLICATION}>
                        <EnvDocumentsTab />
                    </FormWrapper>
                </ReduxWrapper>
            </BrowserRouter>
        );
        expect(container).toMatchSnapshot();
    })
});
