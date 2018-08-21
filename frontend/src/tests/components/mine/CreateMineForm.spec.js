import React from 'react';
import { shallow } from 'enzyme';
import { CreateMine } from '@/components/mine/CreateMine';

const dispatchProps = {};

const setupDispatchProps = () => {
  dispatchProps.createMineRecord = jest.fn();
};

beforeEach(() => {
  setupDispatchProps();
});

describe( 'CreateMine', () => {
  it('renders properly', () => {
    const component = shallow(<CreateMine{...dispatchProps} />);
    expect(component).toMatchSnapshot();
  });
});
