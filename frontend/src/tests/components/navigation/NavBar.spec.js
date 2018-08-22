import React from 'react';
import { shallow } from 'enzyme';
import { NavBar } from '../../../components/navigation/NavBar';

const reducerProps = {}

const setupReducerProps = () => {
  reducerProps.userInfo = {}
};

beforeEach(() => {
  setupReducerProps();
});

describe('NavBar', () => {
  it('renders properly', () => {
    const component = shallow(<NavBar {...reducerProps} />);
    expect(component).toMatchSnapshot();
  });
});