import React from 'react';
import { shallow } from 'enzyme';
import RenderSearch from '@/components/reusables/RenderSearch';
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

describe('RenderSearch', () => {

  it('renders properly', () => {
    props.data = PERSONNEL.personnelIds
    props.option = PERSONNEL.personnel
    const wrapper = shallow(<RenderSearch {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

});