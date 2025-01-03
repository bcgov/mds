import React from "react";
import { render } from "@testing-library/react";
import SteppedForm from "./SteppedForm";
import Step from "./Step";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";

const props = {
    name: "STEPPED_FORM_NAME",
    tabs: ["basic-information"],
    form: <div />,
    handleTabChange: jest.fn(),
    handleSaveDraft: jest.fn(),
    match: {
        params: {
            tab: "basic-information",
        },
    },
    errors: ["error"],
};


describe("SteppedForm", () => {
    it("renders properly", () => {
        const { container } = render(
            <ReduxWrapper>
                <SteppedForm {...props} activeTab="1">
                    <Step key="1">
                        <div>Step 1 content</div>
                    </Step>
                    <Step key="2">
                        <div>Step 2 content</div>
                    </Step>
                </SteppedForm>
            </ReduxWrapper>
        );
        expect(container).toMatchSnapshot();
    });
});
