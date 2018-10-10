import React from 'react';
import { shallow } from 'enzyme';
import RenderLargeSelect from '@/components/common/RenderLargeSelect';
import { PARTY } from '@/tests/mocks/dataMocks';


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
    option: {},
    handleChange: jest.fn()
  };
}

beforeEach(() => {
  setupProps();
});

describe('RenderLargeSelect', () => {

  it('renders properly', () => {
    props.data = PARTY.partyIds
    props.option = PARTY.parties
    const wrapper = shallow(<RenderLargeSelect {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

});