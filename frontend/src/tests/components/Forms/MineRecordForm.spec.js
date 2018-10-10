import React from 'react';
import { shallow } from 'enzyme';
import MineRecordForm from '@/components/Forms/MineRecordForm';

const dispatchProps = {};

const setupDispatchProps = () => {
  dispatchProps.handleSubmit = jest.fn();
};

beforeEach(() => {
  setupDispatchProps();
});

describe('MineRecordForm', () => {
  it('renders properly', () => {
    const component = shallow(<MineRecordForm {...dispatchProps} />);
    expect(component).toMatchSnapshot();
  });
});