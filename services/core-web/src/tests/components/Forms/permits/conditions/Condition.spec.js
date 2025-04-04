import React from "react";
import { shallow } from "enzyme";
import { Condition } from "@/components/Forms/permits/conditions/Condition";

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
    const component = shallow(<Condition {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
