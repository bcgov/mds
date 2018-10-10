import React from 'react';
import { shallow } from 'enzyme';
import { CreateMine } from '@/components/dashboard/CreateMine';

const dispatchProps = {};

const setupDispatchProps = () => {
  dispatchProps.createMineRecord = jest.fn();
  dispatchProps.fetchMineRecord = jest.fn();
  dispatchProps.location = {};
};

beforeEach(() => {
  setupDispatchProps();
});

describe( 'CreateMine', () => {
  it('renders properly', () => {
    const component = shallow(<CreateMine {...dispatchProps} />);
    expect(component).toMatchSnapshot();
  });
});
