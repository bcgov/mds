import React from 'react';
import { shallow } from 'enzyme';
import RenderField from '@/components/common/RenderField';


let props = {};

const setupProps = () => {
  props = {
    id: 1,
    input: '',
    label: '',
    type: '',
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

describe('RenderField', () => {

  it('renders properly', () => {
    const wrapper = shallow(<RenderField {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

});
