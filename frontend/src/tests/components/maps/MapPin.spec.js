import React from 'react';
import { shallow } from 'enzyme';
import { MinePin } from '@/components/maps/MinePin';
import * as MOCK from '@/tests/mocks/dataMocks';

const props = {};

const setupProps = () => {
  props.mineIds = MOCK.MINES.mineIds;
  props.mines = MOCK.MINES.mines;
};

beforeEach(() => {
  setupProps();
});

describe('MinePin', () => {
  it('renders properly', () => {
    const component = shallow(<MinePin {...props}/>);
    expect(component).toMatchSnapshot();
  });
});