import React from "react";
import { render } from "@testing-library/react";
import { AuthenticationGuard } from "@/HOC/AuthenticationGuard";
import * as Mock from "@mds/common/tests/mocks/dataMocks";

const getJestMock = (mockInitialized, mockAuthenticated, mockClient_roles) => {
  jest.mock("@react-keycloak/web", () => ({
    useKeycloak: () => ({
      keycloak: {
        authenticated: mockAuthenticated,
        login: jest.fn(),
        tokenParsed: {
          client_roles: mockClient_roles,
        },
      },
      initialized: mockInitialized,
    }),
  }));
};
jest.mock("@react-keycloak/web", () => ({
  useKeycloak: () => ({
    keycloak: {
      authenticated: true,
      login: jest.fn(),
      tokenParsed: {
        client_roles: [],
      },
    },
    initialized: true,
  }),
}));

const Component = AuthenticationGuard(() => <div>Test</div>);
const dispatchProps = {};
const reducerProps = {};

const setupDispatchProps = () => {
  dispatchProps.authenticateUser = jest.fn();
  dispatchProps.storeUserAccessData = jest.fn();
};

const setupReducerProps = () => {
  reducerProps.isAuthenticated = true;
  reducerProps.userAccessData = Mock.USER_ACCESS_DATA;
};

beforeEach(() => {
  setupDispatchProps();
  setupReducerProps();
  jest.resetModules();
});

describe("AuthenticationGuard", () => {
  it("should render the `WrappedComponent` if `isAuthenticated` && `userAccessData === role_view`", () => {
    getJestMock(true, true, ["role_view"]);
    const { container: component } = render(<Component.WrappedComponent {...dispatchProps} {...reducerProps} />);
    expect(component).toMatchSnapshot();
  });

  it("should render the `NullScreen` if `isAuthenticated` && `userAccessData !== role_view`", () => {
    getJestMock(true, true, []);
    reducerProps.userAccessData = [];
    const { container: component } = render(<Component.WrappedComponent {...dispatchProps} {...reducerProps} />);
    expect(component).toMatchSnapshot();
  });
});
