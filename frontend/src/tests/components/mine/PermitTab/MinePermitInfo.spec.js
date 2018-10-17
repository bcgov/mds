import React from 'react';
import { shallow } from 'enzyme';
import MinePermitInfo from '@/components/mine/PermitTab/MinePermitInfo';
import * as MOCK from '@/tests/mocks/dataMocks';

const props = {}

const setupProps = () => {
  props.mine = MOCK.MINES.mines[MOCK.MINES.mineIds[0]];
};

beforeEach(() => {
  setupProps();
});

describe('MineTenureInfo', () => {
  it('renders properly', () => {
    const component = shallow(
    <MinePermitInfo 
      {...props} 
      />
  );
    expect(component).toMatchSnapshot();
  });
});