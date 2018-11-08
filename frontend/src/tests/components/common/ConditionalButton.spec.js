import React from 'react';
import { shallow } from 'enzyme';
import { ConditionalButton } from '@/components/common/ConditionalButton';

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
    isDropdown: false
  };
}

beforeEach(() => {
  setupProps();
  setupDispatchProps();
});

describe('ConditionalButton', () => {

  it('renders properly', () => {
    const wrapper = shallow(<ConditionalButton {...props} {...dispatchProps} />);
    expect(wrapper).toMatchSnapshot();
  });

});