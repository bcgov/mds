import React from 'react';
import { shallow } from 'enzyme';
import MineTailingsInfo from '@/components/mine/Tailings/MineTailingsInfo';
import * as MOCK from '@/tests/mocks/dataMocks';

const props = {}

const setupProps = () => {
  props.mine = MOCK.MINES.mines[MOCK.MINES.mineIds[0]];
};

beforeEach(() => {
  setupProps();
});

describe('MineTailingsInfo', () => {
  it('renders properly', () => {
    const component = shallow(
    <MineTailingsInfo 
      {...props} 
      />
  );
    expect(component).toMatchSnapshot();
  });
});