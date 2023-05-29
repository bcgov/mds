import React from "react";
import { shallow } from "enzyme";
import { AddCondition } from "@/components/Forms/permits/conditions/AddCondition";

const dispatchProps: any = {};
const props: any = {};

const setupDispatchProps = () => {
  dispatchProps.setEditingConditionFlag = jest.fn();
  dispatchProps.createPermitCondition = jest.fn();
  dispatchProps.fetchPermitConditions = jest.fn();
  dispatchProps.fetchDraftPermitByNOW = jest.fn();
  dispatchProps.fetchStandardPermitConditions = jest.fn();
  dispatchProps.createStandardPermitCondition = jest.fn();
};

const setupProps = () => {
  props.AddCondition = [];
  props.permitConditionCategoryOptions = [];
  props.editingConditionFlag = false;
  props.isNoWApplication = true;
  props.hasSourceAddCondition = true;
  props.draftPermitAmendment = {};
  props.initialValues = {};
  props.draftPermitAmendment = {};
  props.match = {};
  props.location = { pathname: "" };
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("AddCondition", () => {
  it("renders properly", () => {
    const component = shallow(<AddCondition {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
