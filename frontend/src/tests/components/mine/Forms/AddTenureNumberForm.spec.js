import React from 'react';
import { shallow } from 'enzyme';
import { AddTenureNumberForm } from '@/components/mine/Forms/AddTenureNumberForm';

const dispatchProps = {};

const setupDispatchProps = () => {
  dispatchProps.handleSubmit = jest.fn();
};

beforeEach(() => {
  setupDispatchProps();
});

describe('AddPersonnelFrom', () => {
  it('renders properly', () => {
    const component = shallow(<AddTenureNumberForm {...dispatchProps} />);
    expect(component).toMatchSnapshot();
  });
});