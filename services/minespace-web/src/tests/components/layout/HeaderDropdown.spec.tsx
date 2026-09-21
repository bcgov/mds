import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HeaderDropdown from "@/components/layout/HeaderDropdown";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { AUTHENTICATION } from "@mds/common/constants/reducerTypes";
import { SystemFlagEnum } from "@mds/common/constants/enums";
import { BrowserRouter } from "react-router-dom";

jest.mock("react-responsive", () => ({
  __esModule: true,
  default: ({ children, minWidth }: any) => (minWidth ? children : null),
}));

jest.mock("@react-keycloak/web", () => ({
  useKeycloak: () => ({
    keycloak: {
      authenticated: true,
      didInitialize: true,
      tokenParsed: null,
      login: jest.fn(),
    },
    initialized: true,
  }),
}));

function mockFunction() {
  const original = jest.requireActual("react-router-dom");
  return {
    ...original,
    useLocation: jest.fn().mockReturnValue({
      pathname: "/mines",
    }),
    useHistory: jest.fn().mockReturnValue({
      push: jest.fn(),
    }),
  };
}
jest.mock("react-router-dom", () => mockFunction());

const initialState = {
  [AUTHENTICATION]: {
    isAuthenticated: true,
    userAccessData: [],
    userInfo: { email: "test@example.com" },
    redirect: false,
    isProponent: true,
    systemFlag: SystemFlagEnum.ms,
  },
};

// this works with react testing library, but renders a lot less without any events interaction
describe("HeaderDropdown", () => {
  it("renders properly", async () => {
    render(
      <BrowserRouter>
        <ReduxWrapper initialState={initialState}>
          <HeaderDropdown />
        </ReduxWrapper>
      </BrowserRouter>
    );

    // Verify "My Mines" link is rendered
    expect(screen.getByText("My Mines")).toBeInTheDocument();

    // Hover over the dropdown button to open the menu
    const dropdownButton = screen.getByText("test@example.com");
    await userEvent.hover(dropdownButton);

    // Verify the logout menu item appears
    expect(await screen.findByText("Log out")).toBeInTheDocument();
  });
});
