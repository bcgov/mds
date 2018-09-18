import React from 'react';
import { shallow } from 'enzyme';
import MineHeader from '@/components/mine/MineHeader';
import * as MOCK from '@/tests/mocks/dataMocks';

const props = {}

const setupProps = () => {
  props.mine = MOCK.MINES.mines[MOCK.MINES.mineIds[0]];
};

beforeEach(() => {
  setupProps();
});

describe('MineHeader', () => {
  it('renders properly', () => {
    const component = shallow(<MineHeader {...props} />);
    expect(component).toMatchSnapshot();
  });
});