import React from 'react';
import { shallow } from 'enzyme';
import { AddPartyForm } from '@/components/Forms/AddPartyForm';

const dispatchProps = {};

const setupDispatchProps = () => {
  dispatchProps.handleSubmit = jest.fn();
};

beforeEach(() => {
  setupDispatchProps();
});

describe('AddPartyFrom', () => {
  it('renders properly', () => {
    const component = shallow(<AddPartyForm {...dispatchProps} />);
    expect(component).toMatchSnapshot();
  });
});