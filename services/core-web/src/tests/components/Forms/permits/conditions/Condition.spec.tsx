import React from "react";
import { render } from "@testing-library/react";
import { Condition } from "@/components/Forms/permits/conditions/Condition";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

// Mock ConditionForm to avoid SIGSEGV crash with FormWrapper/AUTO_SIZE_FIELD
jest.mock("@/components/Forms/permits/conditions/ConditionForm", () => ({
  __esModule: true,
  default: ({ layer, onCancel, onSubmit, initialValues }: any) => (
    <div data-testid="condition-form">
      <textarea data-testid="condition-input" />
      <button type="button" onClick={onCancel}>Cancel</button>
      <button type="submit">Save</button>
    </div>
  ),
}));

const dispatchProps = {
  onSubmit: jest.fn(),
  handleCancel: jest.fn(),
  setConditionEditingFlag: jest.fn(),
};
const props = {
  condition: {},
  new: true,
  initialValues: {},
  layer: 1,
};

describe("Condition", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <ReduxWrapper>
        <Condition {...dispatchProps} {...props} />
      </ReduxWrapper>
    );
    expect(component).toMatchSnapshot();
  });
});
