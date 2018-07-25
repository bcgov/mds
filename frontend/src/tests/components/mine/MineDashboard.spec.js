import React from 'react';
import { mount } from 'enzyme';
import MineDashboard from '../../../components/mine/MineDashboard';

describe('MineDashboard', () => {
  const component = mount(<MineDashboard />);

  it('renders properly', () => {
    expect(component).toMatchSnapshot();
  });

});