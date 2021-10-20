import React from "react";
import { shallow } from "enzyme";
import { VariableConditionMenu } from "@/components/Forms/permits/conditions/VariableConditionMenu";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {};

const setupProps = () => {
  props.reclamationSummary = [];
  props.activityTypeOptions = [];
  props.isManagementView = false;
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("VariableConditionMenu", () => {
  it("renders properly", () => {
    const component = shallow(<VariableConditionMenu {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
