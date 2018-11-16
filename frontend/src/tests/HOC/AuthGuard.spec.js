import React from 'react';
import { shallow } from 'enzyme';
import { AuthGuard } from '@/HOC/AuthGuard';
import * as Mock from '@/tests/mocks/dataMocks';

const Component = AuthGuard(() => <div>Test</div>);
const dispatchProps = {};
const reducerProps = {};

const setupDispatchProps = () => {
  dispatchProps.authenticateUser = jest.fn();
  dispatchProps.storeUserAccessDate = jest.fn();
  dispatchProps.storeKeycloakData = jest.fn();
};

const setupReducerProps = () => {
  reducerProps.keycloak = {};
  reducerProps.isAuthenticated = true;
  reducerProps.userAccessData = Mock.USER_ACCESS_DATA;
};

beforeEach(() => {
  setupDispatchProps();
  setupReducerProps();
});

describe('AuthGuard', () => {
  it('should render the `WrappedComponent` if `isAuthenticated` && `userAccessData === role_view`', () => {
    const wrapper = shallow(<Component.WrappedComponent {...dispatchProps} {...reducerProps}/>);
    expect(wrapper).toMatchSnapshot();
  });
});