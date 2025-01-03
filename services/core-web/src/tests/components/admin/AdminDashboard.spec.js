import React from "react";
import { shallow } from "enzyme";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => { };

const setupProps = () => {
  props.location = { pathname: "" };
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("AdminDashboard", () => {
  it("renders properly", () => {
    const component = shallow(<AdminDashboard {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
