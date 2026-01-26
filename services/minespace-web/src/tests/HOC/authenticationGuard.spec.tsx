import React from "react";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { AuthenticationGuard } from "@/HOC/AuthenticationGuard";
import { AUTHENTICATION } from "@mds/common/constants/reducerTypes";

const mockStore = (isAuthenticated = true) => ({
  getState: () => ({
    [AUTHENTICATION]: {
      isAuthenticated,
      userInfo: {},
      userAccessData: [],
    },
  }),
  subscribe: jest.fn(),
  dispatch: jest.fn(),
});

jest.mock("@react-keycloak/web", () => ({
  useKeycloak: () => ({
    keycloak: {
      authenticated: false,
      didInitialize: true,
      tokenParsed: null,
    },
    initialized: true,
  }),
}));

jest.mock("@/actionCreators/authenticationActionCreator", () => ({
  authenticateUser: jest.fn(() => ({ type: "MOCK_AUTHENTICATE" })),
}));

jest.mock("@mds/common/redux/actions/authenticationActions", () => ({
  storeUserAccessData: jest.fn(() => ({ type: "MOCK_STORE_ACCESS" })),
}));

const TestComponent = () => <div>Test</div>;

describe("AuthenticationGuard", () => {
  it("should render the wrapped component if authenticated", () => {
    const Component = AuthenticationGuard()(TestComponent);
    const store = mockStore(true);
    const { container } = render(
      <Provider store={store as any}>
        <Component />
      </Provider>
    );
    expect(container).toMatchSnapshot();
  });

  it("should render the wrapped component if route is public", () => {
    const Component = AuthenticationGuard(true)(TestComponent);
    const store = mockStore(false);
    const { container } = render(
      <Provider store={store as any}>
        <Component />
      </Provider>
    );
    expect(container).toMatchSnapshot();
  });

  it("should render UnauthenticatedNotice if not authenticated", () => {
    const Component = AuthenticationGuard()(TestComponent);
    const store = mockStore(false);
    const { container } = render(
      <Provider store={store as any}>
        <Component />
      </Provider>
    );
    expect(container).toMatchSnapshot();
  });
});
