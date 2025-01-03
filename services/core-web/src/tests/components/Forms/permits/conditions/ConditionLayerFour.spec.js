import React from "react";
import { shallow } from "enzyme";
import { ConditionLayerFour } from "@/components/Forms/permits/conditions/ConditionLayerFour";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.onSubmit = jest.fn();
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

describe("ConditionLayerFour", () => {
  it("renders properly", () => {
    const component = shallow(<ConditionLayerFour {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
