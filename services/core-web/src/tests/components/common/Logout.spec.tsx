import React from "react";
import { render } from "@testing-library/react";
import { Logout } from "@/components/common/Logout";
import { BrowserRouter } from "react-router-dom";

const props = {
  logoutUser: jest.fn(),
};

jest.mock("@react-keycloak/web", () => ({
  useKeycloak: () => ({
    keycloak: {
      authenticated: false,
    },
    initialized: true,
  }),
}));

describe("Logout", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <BrowserRouter>
        <Logout {...props} />
      </BrowserRouter>
    );
    expect(component).toMatchSnapshot();
  });
});
