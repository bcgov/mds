import React from 'react';
import { shallow } from 'enzyme';
import { MineContainer } from '@/components/mine/MineContainer';
import * as MOCK from '../../mocks/dataMocks';

const dispatchProps = {};
const reducerProps = {}

const setupDispatchProps = () => {
  dispatchProps.getMineRecord = jest.fn();
  dispatchProps.updateMineRecord = jest.fn();
  dispatchProps.match = {};
};

const setupReducerProps = () => {
  reducerProps.mine = MOCK.MINES.mines[MOCK.MINES.mineIds[0]];
  reducerProps.mines = MOCK.MINES.mines;
  reducerProps.mineIds = MOCK.MINES.mineIds;
  reducerProps.mineId = 'Blah123';
  reducerProps.userRoles = [];
};

beforeEach(() => {
  setupDispatchProps();
  setupReducerProps();
});

describe('MineContainer', () => {
  it('renders properly', () => {
    const component = shallow(
      <MineContainer
        {...dispatchProps}
        {...reducerProps} 
        match={{ params: { id: 1 }, isExact: true, path: "", url: "" }}
      />
    );
    expect(component).toMatchSnapshot();
  });
});