import React from 'react';
import { shallow } from 'enzyme';
import { MineDashboard } from '@/components/mine/MineDashboard';
import * as MOCK from '@/tests/mocks/dataMocks';

const dispatchProps = {};
const reducerProps = {}

const setupDispatchProps = () => {
  dispatchProps.fetchMineRecordById = jest.fn();
  dispatchProps.updateMineRecord = jest.fn();
  dispatchProps.match = {};
};

const setupReducerProps = () => {
  reducerProps.mine = MOCK.MINES.mines[MOCK.MINES.mineIds[0]];
  reducerProps.mines = MOCK.MINES.mines;
};

beforeEach(() => {
  setupDispatchProps();
  setupReducerProps();
});

describe('MineDashboard', () => {
  it('renders properly', () => {
    const component = shallow(
    <MineDashboard 
      {...dispatchProps} 
      {...reducerProps} 
      match={{ params: { id: 1 }, isExact: true, path: "", url: "" }}
    />
  );
    expect(component).toMatchSnapshot();
  });
});