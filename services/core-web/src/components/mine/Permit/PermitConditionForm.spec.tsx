import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { PERMITS } from "@mds/common/constants/reducerTypes";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import PermitConditionForm from "./PermitConditionForm";

const condition = MOCK.PERMITS[0].permit_amendments[0].conditions[0];
const initialState = {
    [PERMITS]: {
        permits: MOCK.PERMITS,
        permitAmendments: {
            [MOCK.PERMITS[0].permit_guid]: MOCK.PERMITS[0].permit_amendments[0]
        }
    },
};

function mockFunction() {
    const original = jest.requireActual("react-router-dom");
    return {
        ...original,
        useParams: jest.fn().mockReturnValue({
            id: MOCK.MINES.mineIds[0],
            permitGuid: MOCK.PERMITS[0].permit_guid,
        }),
    };
}

jest.mock("react-router-dom", () => mockFunction());

describe("PermitConditionForm", () => {
    it("renders properly in edit mode", async () => {
        const { container, findByText } = render(<ReduxWrapper initialState={initialState}>
            <PermitConditionForm
                permitAmendmentGuid={MOCK.PERMITS[0].permit_amendments[0].permit_amendment_guid}
                condition={condition}
                canEditPermitConditions={true}
                onEdit={jest.fn()}
                setEditingConditionGuid={jest.fn()}
                editingConditionGuid={undefined}
                moveUp={jest.fn()}
                moveDown={jest.fn()}
                refreshData={jest.fn()}
                setIsAddingListItem={jest.fn()}
                isAddingListItem={false}
            />
        </ReduxWrapper>);

        const editElement = container.querySelector("[aria-label='Edit Condition']")
        fireEvent.click(editElement);
        await findByText("Add Report Requirement");
        expect(container).toMatchSnapshot()
    });
    it("does not allow edit when it shouldn't", async () => {
        const { container } = render(<ReduxWrapper initialState={initialState}>
            <PermitConditionForm
                permitAmendmentGuid={MOCK.PERMITS[0].permit_amendments[0].permit_amendment_guid}
                condition={condition}
                canEditPermitConditions={false}
                onEdit={jest.fn()}
                setEditingConditionGuid={jest.fn()}
                editingConditionGuid={undefined}
                moveUp={jest.fn()}
                moveDown={jest.fn()}
                refreshData={jest.fn()}
                setIsAddingListItem={jest.fn()}
                isAddingListItem={false}
            />
        </ReduxWrapper>);

        const editElements = container.querySelectorAll("[aria-label='Edit Condition']");
        expect(Array.from(editElements)).toEqual([]);

        // and make sure that it's not just missing the aria-label and nothing happens on click
        const conditionColumn = container.querySelector(".condition-column");
        fireEvent.click(conditionColumn);
        await waitFor(() => {
            const editButtons = container.querySelectorAll(".condition-edit-buttons");
            expect(Array.from(editButtons)).toEqual([])
        })
    });
});