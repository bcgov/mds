import React from "react";
import { shallow } from "enzyme";
import { ConditionLayerFive } from "@/components/Forms/permits/conditions/ConditionLayerFive";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.handleSubmit = jest.fn();
  dispatchProps.handleCancel = jest.fn();
  dispatchProps.handleDelete = jest.fn();
  dispatchProps.reorderConditions = jest.fn();
  dispatchProps.setConditionEditingFlag = jest.fn();
};

const setupProps = () => {
  props.condition = { sub_conditions: [] };
  props.new = false;
  props.initialValues = {};
  props.editingConditionFlag = true;
  props.isViewOnly = false;
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("ConditionLayerFive", () => {
  it("renders properly", () => {
    const component = shallow(<ConditionLayerFive {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
