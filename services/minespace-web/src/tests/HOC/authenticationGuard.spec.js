import React from "react";
import { shallow } from "enzyme";
import { AuthenticationGuard } from "@/HOC/AuthenticationGuard";
import UnauthorizedNotice from "@/components/common/UnauthorizedNotice";

const Component = AuthenticationGuard()(() => <div>Test</div>);
const dispatchProps = {};
const reducerProps = {};

const setupDispatchProps = () => {
  dispatchProps.getUserInfoFromToken = jest.fn();
};

const setupReducerProps = () => {
  reducerProps.isAuthenticated = true;
};

beforeEach(() => {
  setupDispatchProps();
  setupReducerProps();
});

describe("AuthenticationGuard", () => {
  it("should render the `WrappedComponent` if `isAuthenticated`", () => {
    const wrapper = shallow(<Component.WrappedComponent {...dispatchProps} {...reducerProps} />);
    expect(wrapper).toMatchSnapshot();
    expect(wrapper.html()).toEqual("<div>Test</div>");
    expect(wrapper.find(UnauthorizedNotice).length).toEqual(0);
  });

  it("should render the `NullScreen` if `!isAuthenticated`", () => {
    reducerProps.isAuthenticated = false;
    const wrapper = shallow(<Component.WrappedComponent {...dispatchProps} {...reducerProps} />);
    expect(wrapper.find(UnauthorizedNotice).length).toEqual(1);
  });
});
