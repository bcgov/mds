import React from "react";
import { render } from "@testing-library/react";
import { DeleteConditionModal } from "@mds/common/components/permits/DeleteConditionModal";
import { IPermitCondition } from "@mds/common/interfaces";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const condition = {
    condition: "This is the condition text",
    condition_type_code: "CON",
    stepPath: "General - 1.a"
} as IPermitCondition;

describe("DeleteConditionModal", () => {
    it("renders properly", () => {
        const { container } = render(
            <ReduxWrapper>
                <DeleteConditionModal
                    title="Delete Condition"
                    onSubmit={jest.fn()}
                    onCancel={jest.fn()}
                    condition={condition}
                />
            </ReduxWrapper>
        );
        expect(container).toMatchSnapshot();
    })
});