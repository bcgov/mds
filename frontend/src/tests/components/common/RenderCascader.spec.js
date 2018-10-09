import React from 'react';
import { shallow } from 'enzyme';
import RenderCascader from '@/components/common/RenderCascader';

let props = {};

const setupProps = () => {
  props = {
    id: 1,
    input: '',
    label: '',
    meta: {
      touched: false,
      error: false,
      warning: false,
    },
  };
}

beforeEach(() => {
  setupProps();
});

describe('RenderCascader', () => {

  it('renders properly', () => {
    const wrapper = shallow(<RenderCascader {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

});
