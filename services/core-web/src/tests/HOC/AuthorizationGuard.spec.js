import React from "react";
import { shallow } from "enzyme";
import { AuthorizationGuard } from "@/HOC/AuthorizationGuard";
import * as Mock from "@/tests/mocks/dataMocks";

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
    const component = shallow(<Component.WrappedComponent {...dispatchProps} {...reducerProps} />);
    expect(component).toMatchSnapshot();
    expect(component.html()).not.toEqual("<div></div>");
    expect(component.html()).toEqual("<div>Test</div>");
  });

  it("should render the `<NullScreen /> if `userRoles !== role_edit_mines || role_admin`", () => {
    reducerProps.userRoles = [];
    const component = shallow(<Component.WrappedComponent {...dispatchProps} {...reducerProps} />);
    expect(component.html()).not.toEqual("<div>Test</div>");
  });
});
