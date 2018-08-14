import React from 'react';
import { shallow } from 'enzyme';
import { CreateMineForm } from '../../../components/mine/CreateMineForm';

const dispatchProps = {};

const setupDispatchProps = () => {
  dispatchProps.createMineRecord = jest.fn();
};

beforeEach(() => {
  setupDispatchProps();
});

describe( 'CreateMineForm', () => {
  it('renders properly', () => {
    const component = shallow(<CreateMineForm {...dispatchProps} />);
    expect(component).toMatchSnapshot();
  });
});
