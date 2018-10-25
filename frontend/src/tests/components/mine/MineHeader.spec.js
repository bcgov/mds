import React from 'react';
import { shallow } from 'enzyme';
import MineHeader from '@/components/mine/MineHeader';
import * as MOCK from '@/tests/mocks/dataMocks';

const props = {}
const dispatchProps = {};

const setupDispatchProps = () => {
  dispatchProps.updateMineRecord = jest.fn();
  dispatchProps.fetchMineRecordById = jest.fn();
  dispatchProps.closeModal = jest.fn();
  dispatchProps.openModal = jest.fn();
};

const setupProps = () => {
  dispatchProps.mine = MOCK.MINES.mines[MOCK.MINES.mineIds[0]];
  dispatchProps.mineStatusOptions = MOCK.STATUS_OPTIONS.options;
}

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe('MineHeader', () => {
  it('renders dispatchPropsrly', () => {
    const component = shallow(<MineHeader {...dispatchProps} {...props}/>);
    expect(component).toMatchSnapshot();
  });
});