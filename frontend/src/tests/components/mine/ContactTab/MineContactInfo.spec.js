import React from 'react';
import { shallow } from 'enzyme';
import { MineContactInfo } from '@/components/mine/ContactTab/MineContactInfo';
import * as MOCK from '../../../mocks/dataMocks';

const dispatchProps = {};
const reducerProps = {}

const setupDispatchProps = () => {
  dispatchProps.getPersonnelInfo = jest.fn();
};

const setupReducerProps = () => {
  reducerProps.mine = MOCK.MINES.mines[MOCK.MINES.mineIds[0]];
};

beforeEach(() => {
  setupDispatchProps();
  setupReducerProps();
});

describe('MineContactInfo', () => {
  it('renders properly', () => {
    const component = shallow(<MineContactInfo {...dispatchProps} {...reducerProps} />);
    expect(component).toMatchSnapshot();
  });
});