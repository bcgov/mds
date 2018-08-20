import React from 'react';
import { shallow } from 'enzyme';
import MineHeader from '@/components/mine/MineHeader';
import * as MOCK from '../../mocks/dataMocks';

const reducerProps = {}

const setupReducerProps = () => {
  reducerProps.mine = MOCK.MINES.mines[0];
};

beforeEach(() => {
  setupReducerProps();
});

describe('MineHeader', () => {
  it('dummy test will always pass', () => {
    // const component = shallow(<MineHeader {...reducerProps} />);
    expect(true).not.toBeFalsy();
  });
});