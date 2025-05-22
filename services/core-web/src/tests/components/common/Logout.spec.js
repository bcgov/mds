import React from "react";
import { render } from "@testing-library/react";
import { Logout } from "@/components/common/Logout";
import { BrowserRouter } from "react-router-dom";

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
    const { container: component } = render(<BrowserRouter><Logout {...props} /></BrowserRouter>);
    expect(component).toMatchSnapshot();
  });
});
