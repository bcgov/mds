import React from 'react';
import { shallow } from 'enzyme';
import { AddPersonnelForm } from '@/components/Forms/AddPersonnelForm';

const dispatchProps = {};

const setupDispatchProps = () => {
  dispatchProps.handleSubmit = jest.fn();
};

beforeEach(() => {
  setupDispatchProps();
});

describe('AddPersonnelFrom', () => {
  it('renders properly', () => {
    const component = shallow(<AddPersonnelForm {...dispatchProps} />);
    expect(component).toMatchSnapshot();
  });
});