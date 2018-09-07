import React from 'react';
import { shallow } from 'enzyme';
import { Dashboard } from '@/components/dashboard/Dashboard';
import * as MOCK from '@/tests/mocks/dataMocks';

const dispatchProps = {};
const reducerProps = {};

const setupDispatchProps = () => {
  dispatchProps.getMineRecords = jest.fn(() => Promise.resolve({}));
  dispatchProps.createMineRecord = jest.fn();
};

const setupReducerProps = () => {
  reducerProps.mineIds = MOCK.MINES.mineIds;
  reducerProps.mines = MOCK.MINES.mines;
  reducerProps.pageData = MOCK.PAGE_DATA;
  reducerProps.location = {search:""}
  reducerProps.history = {}
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