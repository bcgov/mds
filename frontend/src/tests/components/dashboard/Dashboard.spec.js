import React from 'react';
import { shallow } from 'enzyme';
import { Dashboard } from '@/components/dashboard/Dashboard';
import * as MOCK from '@/tests/mocks/dataMocks';

const dispatchProps = {};
const reducerProps = {};

const setupDispatchProps = () => {
  dispatchProps.fetchMineRecords = jest.fn(() => Promise.resolve({}));
  dispatchProps.createMineRecord = jest.fn();
  dispatchProps.fetchStatusOptions = jest.fn();
};

const setupReducerProps = () => {
  reducerProps.location = {search:""}
  reducerProps.history = {}
  reducerProps.mines = MOCK.MINES.mines;
  reducerProps.mineIds = MOCK.MINES.mineIds;
  reducerProps.pageData = MOCK.PAGE_DATA;
  reducerProps.mineStatusOptions = MOCK.MINE_STATUS_OPTIONS;
};

beforeEach(() => {
  setupDispatchProps();
  setupReducerProps();
});

describe('Dashboard', () => {
  it('renders properly', () => {
    const component = shallow(<Dashboard  {...dispatchProps} {...reducerProps} />);
    expect(component).toMatchSnapshot();
  });
});