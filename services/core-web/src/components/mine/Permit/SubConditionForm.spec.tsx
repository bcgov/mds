import React from "react";
import { render } from "@testing-library/react";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import SubConditionForm from "./SubConditionForm";

const condition = MOCK.PERMITS[0].permit_amendments[0].conditions[0];
const conditionCategory = {
    ...MOCK.PERMITS[0].permit_amendments[0].condition_categories[0],
    conditions: [condition]
}
const initialState = {}

describe("SubConditionForm", () => {
    it("renders properly for adding list item", async () => {
        const { container } = render(<ReduxWrapper initialState={initialState}>
            <SubConditionForm
                level={2}
                permitAmendmentGuid={MOCK.PERMITS[0].permit_amendments[0].permit_amendment_guid}
                parentCondition={condition}
                handleCancel={jest.fn()}
                onSubmit={jest.fn()}
            />
        </ReduxWrapper>);

        expect(container).toMatchSnapshot()
    });
    it("renders properly for adding to category", () => {
        const { container } = render(<ReduxWrapper initialState={initialState}>
            <SubConditionForm
                permitAmendmentGuid={MOCK.PERMITS[0].permit_amendments[0].permit_amendment_guid}
                conditionCategory={conditionCategory}
                handleCancel={jest.fn()}
                onSubmit={jest.fn()}
            />
        </ReduxWrapper>);

        const textInput = container.querySelector("textarea");
        expect(textInput.placeholder).toEqual("Enter Sub-Section title");
    });
});