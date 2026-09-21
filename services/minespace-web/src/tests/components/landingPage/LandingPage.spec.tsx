import React from "react";
import { render } from "@testing-library/react";
import { LandingPage } from "@/components/pages/LandingPage";

jest.mock("@react-keycloak/web", () => ({
  useKeycloak: () => ({
    keycloak: {
      authenticated: false,
      didInitialize: true,
      tokenParsed: null,
      login: jest.fn(),
    },
    initialized: true,
  }),
}));

describe("LandingPage", () => {
  it("renders properly", () => {
    const { container } = render(<LandingPage />);
    expect(container).toMatchSnapshot();
  });
});
