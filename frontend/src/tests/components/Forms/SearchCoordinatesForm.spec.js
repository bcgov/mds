import React from 'react';
import { shallow } from 'enzyme';
import { SearchCoordinatesForm } from '@/components/Forms/SearchCoordinatesForm';

const dispatchProps = {};

const setupDispatchProps = () => {
  dispatchProps.handleSubmit = jest.fn();
};

beforeEach(() => {
  setupDispatchProps();
});

describe('AddPartyFrom', () => {
  it('renders properly', () => {
    const component = shallow(<SearchCoordinatesForm {...dispatchProps} />);
    expect(component).toMatchSnapshot();
  });
});