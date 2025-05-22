import React from "react";
import { render } from "@testing-library/react";
import { StandardPermitConditions } from "@/components/Forms/permits/conditions/StandardPermitConditions";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.openModal = jest.fn();
  dispatchProps.closeModal = jest.fn();
  dispatchProps.fetchStandardPermitConditions = jest.fn(() => Promise.resolve());
  dispatchProps.setEditingConditionFlag = jest.fn();
  dispatchProps.deleteStandardPermitCondition = jest.fn();
  dispatchProps.updateStandardPermitCondition = jest.fn();
};

const setupProps = () => {
  props.conditions = [];
  props.permitConditionCategoryOptions = [];
  props.editingConditionFlag = false;
  props.match = { params: { type: "SAG" } };
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("StandardPermitConditions", () => {
  it("renders properly", () => {
    const { container: component } = render(<StandardPermitConditions {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
