import React from 'react';
import { shallow } from 'enzyme';
import { CreateGuard } from '@/HOC/CreateGuard';

const dispatchProps = {};
const reducerProps = {}

const setupDispatchProps = () => {
  dispatchProps.logoutUser = jest.fn();
};

const setupReducerProps = () => {
  reducerProps.keycloak = {}
};

beforeEach(() => {
  setupDispatchProps();
  setupReducerProps();
});

describe('CreateGuard', () => {
  it('renders properly', () => {
    const component = shallow(<CreateGuard {...dispatchProps} {...reducerProps} />);
    expect(component).toMatchSnapshot();
  });
});