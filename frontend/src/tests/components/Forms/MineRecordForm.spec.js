import React from 'react';
import { shallow } from 'enzyme';
import MineRecordForm from '@/components/Forms/MineRecordForm';

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.handleSubmit = jest.fn();
  dispatchProps.toggleModal = jest.fn();
};

const setupProps = () => {
  props.title = 'mockTitle';
}

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe('MineRecordForm', () => {
  it('renders properly', () => {
    const component = shallow(<MineRecordForm {...dispatchProps} {...props}/>);
    expect(component).toMatchSnapshot();
  });
});