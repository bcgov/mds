import React from 'react';
import { shallow } from 'enzyme';
import { Logout } from '@/components/authentication/Logout';

const dispatchProps = {};
const props = {}

const setupDispatchProps = () => {
  dispatchProps.logoutUser = jest.fn();
};

const setupProps = () => {
  props.keycloak = {}
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe('Logout', () => {
  it('renders properly', () => {
    const component = shallow(<Logout {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});