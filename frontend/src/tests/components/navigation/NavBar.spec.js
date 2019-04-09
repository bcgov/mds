import React from "react";
import { shallow } from "enzyme";
import { NavBar } from "@/components/navigation/NavBar";

const props = {};
const dispatchProps = {};

const setupDispatchProps = () => {
  dispatchProps.logoutUser = jest.fn();
  dispatchProps.toggleHamburgerMenu = jest.fn();
  dispatchProps.fetchMineVerifiedStatuses = jest.fn();
};

const setupProps = () => {
  props.userInfo = {};
  props.activeButton = "";
  props.isMenuOpen = false;
  props.keycloak = {};
};

beforeEach(() => {
  setupProps();
  setupDispatchProps();
});

describe("NavBar", () => {
  it("renders properly", () => {
    const component = shallow(<NavBar {...props} {...dispatchProps} />);
    expect(component).toMatchSnapshot();
  });
});
