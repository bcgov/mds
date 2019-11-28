import React from "react";
import { shallow } from "enzyme";
import { AuthenticationGuard } from "@/HOC/AuthenticationGuard";
import NullScreen from "@/components/common/NullScreen";
import Loading from "@/components/common/Loading";
import * as Mock from "@/tests/mocks/dataMocks";

const Component = AuthenticationGuard(() => <div>Test</div>);
const dispatchProps = {};
const reducerProps = {};

const setupDispatchProps = () => {
  dispatchProps.authenticateUser = jest.fn();
  dispatchProps.storeUserAccessData = jest.fn();
  dispatchProps.storeKeycloakData = jest.fn();
};

const setupReducerProps = () => {
  reducerProps.keycloak = true;
  reducerProps.isAuthenticated = true;
  reducerProps.userAccessData = Mock.USER_ACCESS_DATA;
};

beforeEach(() => {
  setupDispatchProps();
  setupReducerProps();
});

describe("AuthenticationGuard", () => {
  it("should render the `WrappedComponent` if `isAuthenticated` && `userAccessData === role_view`", () => {
    const wrapper = shallow(<Component.WrappedComponent {...dispatchProps} {...reducerProps} />);
    expect(wrapper).toMatchSnapshot();
    expect(wrapper.html()).toEqual("<div>Test</div>");
    expect(wrapper.find(Loading).length).toEqual(0);
    expect(wrapper.find(NullScreen).length).toEqual(0);
  });

  it("should render the `NullScreen` if `isAuthenticated` && `userAccessData !== role_view`", () => {
    reducerProps.userAccessData = [];
    const wrapper = shallow(<Component.WrappedComponent {...dispatchProps} {...reducerProps} />);
    expect(wrapper.find(NullScreen).length).toEqual(1);
    expect(wrapper.find(Loading).length).toEqual(0);
  });

  it("should render the `Loading` if `!isAuthenticated` && `userAccessData !== role_view`", () => {
    reducerProps.isAuthenticated = false;
    reducerProps.userAccessData = [];
    const wrapper = shallow(<Component.WrappedComponent {...dispatchProps} {...reducerProps} />);
    expect(wrapper.find(Loading).length).toEqual(1);
    expect(wrapper.find(NullScreen).length).toEqual(0);
  });

  it("should render the `Loading` if `!keycloak`", () => {
    reducerProps.keycloak = false;
    const wrapper = shallow(<Component.WrappedComponent {...dispatchProps} {...reducerProps} />);
    expect(wrapper.find(Loading).length).toEqual(1);
    expect(wrapper.find(NullScreen).length).toEqual(0);
  });

  describe("lifecycle methods", () => {
    it("componentDidMount", () => {
      const keycloakInit = jest.fn();
      keycloakInit();
      expect(keycloakInit).toHaveBeenCalled();
    });
  });
});
