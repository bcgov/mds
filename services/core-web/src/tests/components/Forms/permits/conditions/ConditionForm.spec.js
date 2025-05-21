import React from "react";
import { render } from "@testing-library/react";
import { ConditionForm } from "@/components/Forms/permits/conditions/ConditionForm";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.onCancel = jest.fn();
  dispatchProps.onSubmit = jest.fn();
};

const setupProps = () => {
  props.submitting = false;
  props.layer = 1;
  props.initialValues = {};
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("ConditionForm", () => {
  it("renders properly", () => {
    const { container: component } = render(<ReduxWrapper><ConditionForm {...dispatchProps} {...props} /></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});
