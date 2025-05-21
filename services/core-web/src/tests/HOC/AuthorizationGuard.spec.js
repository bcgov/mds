import React from "react";
import { render } from "@testing-library/react";
import { AuthorizationGuard } from "@/HOC/AuthorizationGuard";
import * as Mock from "@mds/common/tests/mocks/dataMocks";

const Component = AuthorizationGuard("role_edit_mines")(() => <div>Test</div>);
const dispatchProps = {};
const reducerProps = {};

const setupDispatchProps = () => {
  dispatchProps.logoutUser = jest.fn();
  dispatchProps.mapStateToProps = jest.fn();
};

const setupReducerProps = () => {
  reducerProps.userRoles = Mock.USER_ACCESS_DATA;
};

beforeEach(() => {
  setupDispatchProps();
  setupReducerProps();
});

describe("AuthorizationGuard", () => {
  it("should render the `WrappedComponent` if `userRoles === role_edit_mines || role_admin`", () => {
    const { container: component } = render(<Component.WrappedComponent {...dispatchProps} {...reducerProps} />);
    expect(component).toMatchSnapshot();
  });

  it("should render the `<NullScreen /> if `userRoles !== role_edit_mines || role_admin`", () => {
    reducerProps.userRoles = [];
    const { container: component } = render(<Component.WrappedComponent {...dispatchProps} {...reducerProps} />);
    expect(component).toMatchSnapshot();
  });
});
