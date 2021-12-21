import React from "react";
import { shallow } from "enzyme";
import { Conditions } from "@/components/Forms/permits/conditions/Conditions";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.openModal = jest.fn();
  dispatchProps.closeModal = jest.fn();
  dispatchProps.fetchPermitConditions = jest.fn();
  dispatchProps.setEditingConditionFlag = jest.fn();
  dispatchProps.deletePermitCondition = jest.fn();
  dispatchProps.updatePermitCondition = jest.fn();
  dispatchProps.fetchDraftPermitByNOW = jest.fn();
};

const setupProps = () => {
  props.conditions = [];
  props.permitConditionCategoryOptions = [];
  props.editingConditionFlag = false;
  props.isNoWApplication = true;
  props.isSourcePermitGeneratedInCore = true;
  props.draftPermitAmendment = {};
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("Conditions", () => {
  it("renders properly", () => {
    const component = shallow(<Conditions {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
