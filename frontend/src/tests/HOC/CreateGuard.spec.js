import React from 'react';
import { shallow } from 'enzyme';
import { CreateGuard } from '@/HOC/CreateGuard';
import * as Mock from '@/tests/mocks/dataMocks';

let Component;
const dispatchProps = {};
const reducerProps = {}

const setupDispatchProps = () => {
  dispatchProps.logoutUser = jest.fn();
};
// 
const setupReducerProps = () => {
  reducerProps.userRoles = Mock.USER_ACCESS_DATA;
  reducerProps.keycloak = {}
};

beforeEach(() => {
  setupDispatchProps();
  setupReducerProps();
  Component = CreateGuard(() => <div>Test</div>)
});

describe('CreateGuard', () => {
  it('should render the `WrappedComponent` if `userRoles === role_create`', () => {
    const component = shallow(<Component.WrappedComponent {...dispatchProps} {...reducerProps} />);
    expect(component).toMatchSnapshot();
  });
});