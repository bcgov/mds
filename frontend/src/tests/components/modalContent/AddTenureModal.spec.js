import React from 'react';
import { shallow } from 'enzyme';
import { AddTenureModal } from '@/components/modalContent/AddTenureModal';

const dispatchProps = {};
const props = {}

const setupDispatchProps = () => {
  dispatchProps.onSubmit = jest.fn();
};

const setupProps = () => {
  props.title = 'mockTitle'
}

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe('AddTenureModal', () => {
  it('renders properly', () => {
    const component = shallow(<AddTenureModal {...dispatchProps} {...props}/>);
    expect(component).toMatchSnapshot();
  });
});