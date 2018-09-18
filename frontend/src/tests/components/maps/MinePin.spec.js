import React from 'react';
import { shallow } from 'enzyme';
import { MinePin } from '@/components/maps/MinePin';
import * as MOCK from '@/tests/mocks/dataMocks';

const props = {};

const setupProps = () => {
  props.mineIds = MOCK.MINES.mineIds;
  props.mines = MOCK.MINES.mines;
  props.match = {},
  props.view = {}
};

beforeEach(() => {
  setupProps();
});

describe('MinePin', () => {
  it('renders properly', () => {
    const component = shallow(
    <MinePin 
      {...props}
      match={{ params: { id: 1 }, isExact: true, path: "", url: "" }}
    />
  );
    expect(component).toMatchSnapshot();
  });
});