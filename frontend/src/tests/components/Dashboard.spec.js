import React from 'react';
import { shallow } from 'enzyme';
import { Dashboard } from '../../components/Dashboard';
import * as MOCK from '../mocks/dataMocks';

const dispatchProps = {};
const reducerProps = {};

const setupDispatchProps = () => {
  dispatchProps.getMineRecords = jest.fn();
};

const setupReducerProps = () => {
  reducerProps.mineIds = MOCK.MINES.mineIds;
  reducerProps.mines = MOCK.MINES.mines;
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