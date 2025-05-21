import React from "react";
import { render } from "@testing-library/react";
import { Condition } from "@/components/Forms/permits/conditions/Condition";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.onSubmit = jest.fn();
  dispatchProps.handleCancel = jest.fn();
  dispatchProps.setConditionEditingFlag = jest.fn();
};

const setupProps = () => {
  props.condition = {};
  props.new = true;
  props.initialValues = {};
  props.layer = 1;
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("Condition", () => {
  it("renders properly", () => {
    const { container: component } = render(<ReduxWrapper><Condition {...dispatchProps} {...props} /></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});
