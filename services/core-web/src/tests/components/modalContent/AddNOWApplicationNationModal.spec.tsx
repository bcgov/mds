import React from "react";
import { render } from "@testing-library/react";
import { AddNOWApplicationNationModal } from "@/components/modalContent/AddNOWApplicationNationModal";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const dispatchProps = {
    onSubmit: jest.fn(),
};

const props = {
    pipConsultationAreaOptions: [
        {
            label: "Nation A",
            value: "nation-a-guid",
        },
        {
            label: "Nation B",
            value: "nation-b-guid",
        },
    ],
};

describe("AddNOWApplicationNationModal", () => {
    it("renders properly", () => {
        const { container: component } = render(
            <ReduxWrapper>
                <AddNOWApplicationNationModal {...props} {...dispatchProps} />
            </ReduxWrapper>
        );

        expect(component).toMatchSnapshot();
    });
});