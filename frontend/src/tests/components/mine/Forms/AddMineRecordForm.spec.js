import React from 'react';
import { shallow } from 'enzyme';
import AddMineRecordForm from '@/components/mine/Forms/AddMineRecordForm';

const dispatchProps = {};

const setupDispatchProps = () => {
  dispatchProps.handleSubmit = jest.fn();
};

beforeEach(() => {
  setupDispatchProps();
});

describe('AddMineRecordForm', () => {
  it('renders properly', () => {
    const component = shallow(<AddMineRecordForm {...dispatchProps} />);
    expect(component).toMatchSnapshot();
  });
});