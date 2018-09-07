import React from 'react';
import { shallow } from 'enzyme';
import {MineSearch} from '@/components/dashboard/MineSearch';
import * as MOCK from '@/tests/mocks/dataMocks';

const dispatchProps = {};
const reducerProps = {};

const setupDispatchProps = () => {
  dispatchProps.getMineNameList = jest.fn();
};

const setupReducerProps = () => {
  reducerProps.mineNameList = MOCK.MINE_NAME_LIST;
};

beforeEach(() => {
  setupDispatchProps();
  setupReducerProps();
});

describe('MineSearch', () => {
  it('renders properly', () => {
    const component = shallow(<MineSearch {...dispatchProps} {...reducerProps} />);
    expect(component).toMatchSnapshot();
  });
});