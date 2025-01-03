import React from "react";
import { shallow } from "enzyme";
import { ConditionForm } from "@/components/Forms/permits/conditions/ConditionForm";

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
    const component = shallow(<ConditionForm {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
