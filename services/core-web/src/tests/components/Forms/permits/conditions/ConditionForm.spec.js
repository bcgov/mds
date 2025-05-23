import React from "react";
import { render } from "@testing-library/react";
import { ConditionForm } from "@/components/Forms/permits/conditions/ConditionForm";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const dispatchProps = {
  onCancel: jest.fn(),
  onSubmit: jest.fn(),
};
const props = {
  submitting: false,
  layer: 1,
  initialValues: {},
};

describe("ConditionForm", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <ReduxWrapper>
        <ConditionForm {...dispatchProps} {...props} />
      </ReduxWrapper>
    );
    expect(component).toMatchSnapshot();
  });
});
