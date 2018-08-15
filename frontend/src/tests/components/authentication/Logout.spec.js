import React from 'react';
import { shallow } from 'enzyme';
import { Logout } from '../../../components/authentication/Logout';

const dispatchProps = {};
const reducerProps = {}

const setupDispatchProps = () => {
  dispatchProps.logoutUser= jest.fn();
};

const setupReducerProps = () => {
  reducerProps.keycloak = {}
};

beforeEach(() => {
  setupDispatchProps();
  setupReducerProps();
});

describe('Logout', () => {
  it('renders properly', () => {
    const component = shallow(<Logout {...dispatchProps} {...reducerProps} />);
    expect(component).toMatchSnapshot();
  });
});