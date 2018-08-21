import React from 'react';
import { shallow } from 'enzyme';
import { UpdateMineForm } from '@/components/mine/SummaryTab/UpdateMineForm';
import * as MOCK from '../../../mocks/dataMocks';

const props = {}
const dispatchProps = {}

const setupDispatchprops = () => {
  dispatchProps.updateMineRecord = jest.fn();
}
const setupProps = () => {
  props.mine = MOCK.MINES.mines[MOCK.MINES.mineIds[0]];
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