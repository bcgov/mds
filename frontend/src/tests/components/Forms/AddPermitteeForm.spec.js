import React from 'react';
import { shallow } from 'enzyme';
import { AddPermitteeForm } from '@/components/Forms/AddPermitteeForm';

const dispatchProps = {};

const setupDispatchProps = () => {
  dispatchProps.handleSubmit = jest.fn();
};

beforeEach(() => {
  setupDispatchProps();
});

describe('AddPermitteeFrom', () => {
  it('renders properly', () => {
    const component = shallow(<AddPermitteeForm {...dispatchProps} />);
    expect(component).toMatchSnapshot();
  });
});