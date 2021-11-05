import React from "react";
import { shallow } from "enzyme";
import { Logout } from "@/components/common/Logout";

const props = {};

const setupProps = () => {
  props.logoutUser = jest.fn();
  props.keycloak = {};
};

beforeEach(() => {
  setupProps();
});

describe("Logout", () => {
  it("renders properly", () => {
    const component = shallow(<Logout {...props} />);
    expect(component).toMatchSnapshot();
  });
});
