import React from "react";
import { shallow } from "enzyme";
import { HeaderDropdown } from "@/components/layout/HeaderDropdown";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.logoutUser = jest.fn();
};

const setupProps = () => {
  props.keycloak = { logout: jest.fn() };
  props.isAuthenticated = true;
  props.location = { pathname: "/mines" };
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("HeaderDropdown", () => {
  it("renders properly", () => {
    const wrapper = shallow(<HeaderDropdown {...props} {...dispatchProps} />);
    expect(wrapper).toMatchSnapshot();
  });
});
