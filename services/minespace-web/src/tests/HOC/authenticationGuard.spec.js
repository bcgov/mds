import React from "react";
import { shallow } from "enzyme";
import { AuthenticationGuard } from "@/HOC/AuthenticationGuard";
import UnauthenticatedNotice from "@/components/common/UnauthenticatedNotice";
import Loading from "@/components/common/Loading";

const Component = AuthenticationGuard()(() => <div>Test</div>);
const dispatchProps = {};
const reducerProps = {};

const setupDispatchProps = () => {
  dispatchProps.getUserInfoFromToken = jest.fn();
};

const setupReducerProps = () => {
  reducerProps.isAuthenticated = true;
  reducerProps.fromCore = false;
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
    expect(wrapper.find(UnauthenticatedNotice).length).toEqual(0);
  });

  it("should render the `NullScreen` if `!isAuthenticated`", () => {
    reducerProps.isAuthenticated = false;
    const wrapper = shallow(<Component.WrappedComponent {...dispatchProps} {...reducerProps} />);
    expect(wrapper.find(UnauthenticatedNotice).length).toEqual(1);
  });

  it("should render the `Loading` if `fromCore` is in localStorage", () => {
    reducerProps.fromCore = true;
    const wrapper = shallow(<Component.WrappedComponent {...dispatchProps} {...reducerProps} />);
    expect(wrapper.find(Loading).length).toEqual(1);
  });
});
