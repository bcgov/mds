import React from "react";
import { render } from "@testing-library/react";
import { UpdateNOWTierForm } from "@/components/Forms/noticeOfWork/UpdateNOWTierForm";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const dispatchProps = {
    onSubmit: jest.fn(),
    closeModal: jest.fn(),
};

const props = {
    title: "Update Tier Category",
    noticeOfWorkTierOptions: [],
    initialValues: {
        now_application_tier_code: "1",
        now_application_tier_description: "Rationale",
    },
};

describe("UpdateNOWTierForm", () => {
    it("renders properly", () => {
        const { container: component } = render(
            <ReduxWrapper>
                <UpdateNOWTierForm {...props} {...dispatchProps} />
            </ReduxWrapper>
        );
        expect(component).toMatchSnapshot();
    });
});
