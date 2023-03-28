import React from "react";
import { shallow } from "enzyme";
import { AuthenticationGuard } from "@/HOC/AuthenticationGuard";
import NullScreen from "@/components/common/NullScreen";
import Loading from "@/components/common/Loading";
import * as Mock from "@/tests/mocks/dataMocks";

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
    const wrapper = shallow(<Component.WrappedComponent {...dispatchProps} {...reducerProps} />);
    expect(wrapper).toMatchSnapshot();
    expect(wrapper.html()).toEqual("<div>Test</div>");
    expect(wrapper.find(Loading).length).toEqual(0);
    expect(wrapper.find(NullScreen).length).toEqual(0);
  });

  it("should render the `NullScreen` if `isAuthenticated` && `userAccessData !== role_view`", () => {
    getJestMock(true, true, []);
    reducerProps.userAccessData = [];
    const wrapper = shallow(<Component.WrappedComponent {...dispatchProps} {...reducerProps} />);
    expect(wrapper.find(NullScreen).length).toEqual(1);
    expect(wrapper.find(Loading).length).toEqual(0);
  });
});
