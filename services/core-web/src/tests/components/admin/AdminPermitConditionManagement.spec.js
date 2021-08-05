import React from "react";
import { shallow } from "enzyme";
import { AdminPermitConditionManagement } from "@/components/admin/AdminPermitConditionManagement";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {};

const setupProps = () => {};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("AdminPermitConditionManagement", () => {
  it("renders properly", () => {
    const component = shallow(<AdminPermitConditionManagement {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
