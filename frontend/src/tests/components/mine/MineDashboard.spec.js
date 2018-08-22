import React from 'react';
import { shallow } from 'enzyme';
import { MineDashboard } from '../../../components/mine/MineDashboard';
import * as MOCK from '../../mocks/dataMocks';

const dispatchProps = {};
const reducerProps = {}

const setupDispatchProps = () => {
  dispatchProps.getMineRecord = jest.fn();
  dispatchProps.updateMineRecord = jest.fn();
};

const setupReducerProps = () => {
  reducerProps.mine = MOCK.MINES.mines[MOCK.MINES.mineIds[0]];
  reducerProps.mines = MOCK.MINES.mines;
  reducerProps.mineIds = MOCK.MINES.mineIds;
  reducerProps.mineId = 'Blah123';
  reducerProps.userRoles = []
};

beforeEach(() => {
  setupDispatchProps();
  setupReducerProps();
});

describe('MineDashboard', () => {
  it('renders properly', () => {
    const component = shallow(<MineDashboard {...dispatchProps} {...reducerProps} />);
    expect(component).toMatchSnapshot();
  });
});