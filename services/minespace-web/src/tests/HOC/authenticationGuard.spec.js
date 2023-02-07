import React from "react";
import { shallow } from "enzyme";
import { AuthenticationGuard } from "@/HOC/AuthenticationGuard";
import UnauthenticatedNotice from "@/components/common/UnauthenticatedNotice";

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useEffect: (cb) => cb() // Run useEffect hooks manually as they do not work with shallow enzyme rendering
}));

jest.mock('@react-keycloak/web', () => ({
  useKeycloak: () => ({
    keycloak: {
      authenticated: false
    },
    initialized: true,
  })
}));


const Component = AuthenticationGuard()(() => <div>Test</div>);
const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.getUserInfoFromToken = jest.fn(() => Promise.resolve());
  dispatchProps.authenticateUser = jest.fn(() => Promise.resolve());
};

const setupprops = () => {
  props.isAuthenticated = true;
  props.fromCore = false;
};


beforeEach(() => {
  setupDispatchProps();
  setupprops();
});

describe("AuthenticationGuard", (isPublic = false) => {
  let fromCore;
  it("should render the `WrappedComponent` if `isAuthenticated`", () => {
    const wrapper = shallow(<Component.WrappedComponent {...dispatchProps} {...props} />);
    expect(wrapper).toMatchSnapshot();
    expect(wrapper.html()).toEqual("<div>Test</div>");
    expect(wrapper.find(UnauthenticatedNotice).length).toEqual(0);
  });

  it("should render the `WrappedComponent` if `isPublic`", () => {
    isPublic = true;
    const wrapper = shallow(<Component.WrappedComponent {...dispatchProps} {...props} />);
    expect(wrapper).toMatchSnapshot();
    expect(wrapper.html()).toEqual("<div>Test</div>");
    expect(wrapper.find(UnauthenticatedNotice).length).toEqual(0);
  });

  it("should render the `NullScreen` if `!isAuthenticated`", () => {
    props.isAuthenticated = false;
    const wrapper = shallow(<Component.WrappedComponent {...dispatchProps} {...props} />);
    expect(wrapper.find(UnauthenticatedNotice).length).toEqual(1);
  });

  describe("lifecycle methods", () => {
    it("componentDidMount", () => {
      const authenticate = jest.fn();
      authenticate();
      expect(authenticate).toHaveBeenCalled();
    });
  });
});
