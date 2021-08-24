import React from "react";
import { shallow } from "enzyme";
import { PermitConditionsNavigation } from "@/components/admin/permitConditions/PermitConditionsNavigation";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {};

const setupProps = () => {
  props.activeButton = "sand-and-gravel";
  props.openSubMenuKey = [];
  props.userRoles = [];
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("PermitConditionsNavigation", () => {
  it("renders properly", () => {
    const component = shallow(<PermitConditionsNavigation {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
