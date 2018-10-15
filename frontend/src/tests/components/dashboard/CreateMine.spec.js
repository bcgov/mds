import React from 'react';
import { shallow } from 'enzyme';
import { CreateMine } from '@/components/dashboard/CreateMine';

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.fetchMineRecords = jest.fn();
  dispatchProps.createMineRecord = jest.fn();
};

const setupProps = () => {
  props.location = {};
  props.mineStatusOptions = [];
}

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe( 'CreateMine', () => {
  it('renders properly', () => {
    const component = shallow(<CreateMine {...dispatchProps} {...props}/>);
    expect(component).toMatchSnapshot();
  });
});
