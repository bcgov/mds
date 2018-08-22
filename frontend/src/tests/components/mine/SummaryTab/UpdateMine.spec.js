import React from 'react';
import { shallow } from 'enzyme';
import { UpdateMine } from '@/components/mine/SummaryTab/UpdateMine';
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

describe('UpdateMine', () => {
  it('renders properly', () => {
    const component = shallow(<UpdateMine {...props} {...dispatchProps}/>);
    expect(component).toMatchSnapshot();
  });
});