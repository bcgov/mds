import React from 'react';
import { shallow } from 'enzyme';
import { UpdateMineForm } from '@/components/mine/SummaryTab/UpdateMineForm';

const props = {}
const dispatchProps = {}

const setupDispatchprops = () => {
  dispatchProps.updateMineRecord = jest.fn();
}
const setupProps = () => {
  props.mineId = 'Blah123';
};

beforeEach(() => {
  setupProps();
  setupDispatchprops();
});

describe('UpdateMineForm', () => {
  it('renders properly', () => {
    const component = shallow(<UpdateMineForm {...props} {...dispatchProps}/>);
    expect(component).toMatchSnapshot();
  });
});