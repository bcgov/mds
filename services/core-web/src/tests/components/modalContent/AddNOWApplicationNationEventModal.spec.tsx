import React from "react";
import { render } from "@testing-library/react";
import { AddNOWApplicationNationEventModal } from "@/components/modalContent/AddNOWApplicationNationEventModal";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const dispatchProps = {
    onSubmit: jest.fn(),
};

const props = {
    eventOptions: [
        {
            label: "Information sent",
            value: "INS",
        },
        {
            label: "Information received",
            value: "INR",
        },
    ],
};

describe("AddNOWApplicationNationEventModal", () => {
    it("renders properly", () => {
        const { container: component } = render(
            <ReduxWrapper>
                <AddNOWApplicationNationEventModal {...props} {...dispatchProps} />
            </ReduxWrapper>
        );

        expect(component).toMatchSnapshot();
    });

    it("renders properly with start date disabled", () => {
        const { container: component } = render(
            <ReduxWrapper>
                <AddNOWApplicationNationEventModal
                    {...props}
                    {...dispatchProps}
                    startDateDisabled
                />
            </ReduxWrapper>
        );

        expect(component).toMatchSnapshot();
    });
});