import React from "react";
import { render } from "@testing-library/react";
import { Condition } from "@/components/Forms/permits/conditions/Condition";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

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
