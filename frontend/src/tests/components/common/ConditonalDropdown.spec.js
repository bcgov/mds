import React from 'react';
import { shallow } from 'enzyme';
import { ConditionalDropdown } from '@/components/common/ConditionalDropdown';

let props = {};
const dispatchProps = {}

const setupDispatchProps = () => {
  dispatchProps.handleAction = jest.fn()
};

const setupProps = () => {
  props = {
    string: '',
    type: 'primary',
    overlay: '',
  };
}

beforeEach(() => {
  setupProps();
  setupDispatchProps();
});

describe('ConditionalDropdown', () => {

  it('renders properly', () => {
    const wrapper = shallow(<ConditionalDropdown {...props} {...dispatchProps} />);
    expect(wrapper).toMatchSnapshot();
  });

});