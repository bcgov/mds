import React from 'react';
import { shallow } from 'enzyme';
import RenderCheckbx from '@/components/common/RenderCheckbx';

let props = {};

const setupProps = () => {
  props = {
    id: 1,
    input: '',
    label: '',
    meta: {
      touched: false,
      error: false,
    },
  };
}

beforeEach(() => {
  setupProps();
});

describe('RenderCheckbx', () => {

  it('renders properly', () => {
    const wrapper = shallow(<RenderCheckbx {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

});