import React from 'react';
import { shallow } from 'enzyme';
import RenderSelect from '@/components/reusables/RenderSelect';
import { PERSONNEL } from '../../mocks/dataMocks';


let props = {};

const setupProps = () => {
  props = {
    id: '1',
    input: '',
    label: '',
    type: '',
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

describe('RenderSelect', () => {

  it('renders properly', () => {
    props.data = PERSONNEL.personnelIds
    props.option = PERSONNEL.personnel
    const wrapper = shallow(<RenderSelect {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

});
