import React from "react";
import { shallow } from "enzyme";
import { Logout } from "@/components/common/Logout";

const props = {};

jest.mock("@react-keycloak/web", () => ({
  useKeycloak: () => ({
    keycloak: {
      authenticated: false,
    },
    initialized: true,
  }),
}));

const setupProps = () => {
  props.logoutUser = jest.fn();
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
