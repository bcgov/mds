import React from "react";
import { shallow } from "enzyme";
import { HeaderDropdown } from "@/components/layout/HeaderDropdown";

const dispatchProps = {
  logoutUser: jest.fn(),
};
const props = {
  keycloak: { logout: jest.fn() },
  isAuthenticated: true,
  location: { pathname: "/mines" },
};

// this works with react testing library, but renders a lot less without any events interaction
describe("HeaderDropdown", () => {
  it("renders properly", () => {
    const wrapper = shallow(<HeaderDropdown {...props} {...dispatchProps} />);
    expect(wrapper).toMatchSnapshot();
  });
});
