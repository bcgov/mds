import React from 'react';
import { shallow } from 'enzyme';
import RenderLargeSelect from '@/components/common/RenderLargeSelect';
import { PERSONNEL } from '@/tests/mocks/dataMocks';


let props = {};

const setupProps = () => {
  props = {
    input: '',
    label: '',
    meta: {
      touched: false,
      error: false,
      warning: false,
    },
    data: [],
    option: {}
  };
}

beforeEach(() => {
  setupProps();
});

describe('RenderLargeSelect', () => {

  it('renders properly', () => {
    props.data = PERSONNEL.personnelIds
    props.option = PERSONNEL.personnel
    const wrapper = shallow(<RenderLargeSelect {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

});