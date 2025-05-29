import React from "react";
import { render } from "@testing-library/react";
import { AuthorizationGuard } from "@/HOC/AuthorizationGuard";
import * as Mock from "@mds/common/tests/mocks/dataMocks";

const Component = AuthorizationGuard("role_edit_mines")(() => <div>Test</div>);
const dispatchProps = {
  logoutUser: jest.fn(),
  mapStateToProps: jest.fn(),
};
const reducerProps = {
  userRoles: Mock.USER_ACCESS_DATA,
};

describe("AuthorizationGuard", () => {
  it("should render the `WrappedComponent` if `userRoles === role_edit_mines || role_admin`", () => {
    const { container, queryByText } = render(<Component.WrappedComponent {...dispatchProps} {...reducerProps} />);
    expect(container).toMatchSnapshot();
    // Explicit assertion: should see the wrapped component's text
    expect(queryByText("Test")).toBeInTheDocument();
    // Explicit assertion: should NOT see the NullScreen message
    expect(queryByText("You do not have permission to access this page")).not.toBeInTheDocument();
  });

  it("should render the `<NullScreen /> if `userRoles !== role_edit_mines || role_admin`", () => {
    reducerProps.userRoles = [];
    const { container, queryByText } = render(<Component.WrappedComponent {...dispatchProps} {...reducerProps} />);
    expect(container).toMatchSnapshot();
    // Explicit assertion: should see the NullScreen message
    expect(queryByText("You do not have permission to access this page")).toBeInTheDocument();
    // Explicit assertion: should NOT see the wrapped component's text
    expect(queryByText("Test")).not.toBeInTheDocument();
  });
});
