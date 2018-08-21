import React from 'react';
import { shallow } from 'enzyme';
import { AuthGuard } from '@/HOC/AuthGuard';

const dispatchProps = {};
const reducerProps = {}

const setupDispatchProps = () => {
  dispatchProps.authenticateUser = jest.fn();
  dispatchProps.storeUserAccessDate = jest.fn();
  dispatchProps.storeKeycloakData = jest.fn();
};

const setupReducerProps = () => {
  reducerProps.keycloak = {}
  reducerProps.isAuthenticated = true;
};

beforeEach(() => {
  setupDispatchProps();
  setupReducerProps();
});

describe('AuthGuard', () => {
  it('renders properly', () => {
    const component = shallow(<AuthGuard {...dispatchProps} {...reducerProps} />);
    expect(component).toMatchSnapshot();
  });
});