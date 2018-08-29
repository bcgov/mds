import React from 'react';
import { shallow } from 'enzyme';
import MineMap from '@/components/maps/MineMap';
import * as MOCK from '@/tests/mocks/dataMocks';

const props = {};

const setupProps = () => {
  props.mine = MOCK.MINES.mines[MOCK.MINES.mineIds[0]];
};

beforeEach(() => {
  setupProps();
});

describe('MineMap', () => {
  it('renders properly', () => {
    const component = shallow(<MineMap {...props}/>);
    expect(component).toMatchSnapshot();
  });
});