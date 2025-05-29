import React from "react";
import { render } from "@testing-library/react";
import { AuthenticationGuard } from "@/HOC/AuthenticationGuard";

jest.mock("react", () => ({
  ...jest.requireActual("react"),
  useEffect: (cb) => cb(), // Run useEffect hooks manually as they do not work with shallow enzyme rendering
}));

jest.mock("@react-keycloak/web", () => ({
  useKeycloak: () => ({
    keycloak: {
      authenticated: false,
    },
    initialized: true,
  }),
}));

const Component = AuthenticationGuard()(() => <div>Test</div>);
const dispatchProps = {
  getUserInfoFromToken: jest.fn(() => Promise.resolve()),
  authenticateUser: jest.fn(() => Promise.resolve()),
};
const props = {
  isAuthenticated: true,
  fromCore: false,
};

describe("AuthenticationGuard", (isPublic = false) => {
  it("should render the `WrappedComponent` if `isAuthenticated`", () => {
    const { container: component } = render(
      <Component.WrappedComponent {...dispatchProps} {...props} />
    );
    expect(component).toMatchSnapshot();
  });

  it("should render the `WrappedComponent` if `isPublic`", () => {
    isPublic = true;
    const { container: component } = render(
      <Component.WrappedComponent {...dispatchProps} {...props} />
    );
    expect(component).toMatchSnapshot();
  });

  it("should render the `NullScreen` if `!isAuthenticated`", () => {
    props.isAuthenticated = false;
    const { container: component } = render(
      <Component.WrappedComponent {...dispatchProps} {...props} />
    );
    expect(component).toMatchSnapshot();
  });

  describe("lifecycle methods", () => {
    it("componentDidMount", () => {
      const authenticate = jest.fn();
      authenticate();
      expect(authenticate).toHaveBeenCalled();
    });
  });
});
